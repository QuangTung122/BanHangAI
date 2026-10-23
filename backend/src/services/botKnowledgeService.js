import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import * as db from './db.js';
import { getEmbeddingModel, hasGeminiKey } from './aiService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = path.resolve(__dirname, '../../knowledge');
const MAX_CHUNK_CHARS = 900;

let syncPromise = null;
let chunkCache = null;

const normalizeText = (text) => String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

const tokenize = (text) => normalizeText(text).split(/[^a-z0-9]+/).filter((token) => token.length >= 2);

const encodeVector = (vector) => Buffer.from(new Float32Array(vector).buffer).toString('base64');

const decodeVector = (encoded) => {
    const buffer = Buffer.from(encoded, 'base64');
    const aligned = new ArrayBuffer(buffer.length);
    new Uint8Array(aligned).set(buffer);
    return new Float32Array(aligned);
};

const cosine = (a, b) => {
    let dot = 0; let normA = 0; let normB = 0;
    const length = Math.min(a.length, b.length);
    for (let i = 0; i < length; i += 1) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
};

/** Tách file markdown thành các đoạn nhỏ theo tiêu đề để tìm kiếm chính xác hơn. */
const splitMarkdown = (source, markdown) => {
    const lines = markdown.replace(/\r/g, '').split('\n');
    let docTitle = source;
    let heading = '';
    let buffer = [];
    const sections = [];

    const flush = () => {
        const body = buffer.join('\n').trim();
        if (body) sections.push({ title: heading ? `${docTitle} > ${heading}` : docTitle, body });
        buffer = [];
    };

    for (const line of lines) {
        if (/^# /.test(line)) {
            flush();
            docTitle = line.replace(/^# /, '').trim();
            heading = '';
        } else if (/^## /.test(line)) {
            flush();
            heading = line.replace(/^## /, '').trim();
        } else {
            buffer.push(line);
        }
    }
    flush();

    const chunks = [];
    for (const section of sections) {
        let current = '';
        for (const paragraph of section.body.split(/\n\s*\n/)) {
            if (current && (current.length + paragraph.length) > MAX_CHUNK_CHARS) {
                chunks.push({ title: section.title, content: current.trim() });
                current = '';
            }
            current += `${paragraph}\n\n`;
        }
        if (current.trim()) chunks.push({ title: section.title, content: current.trim() });
    }
    return chunks.map((chunk, index) => ({
        source,
        chunk_index: index,
        title: chunk.title,
        content: `${chunk.title}\n${chunk.content}`
    }));
};

const readKnowledgeFiles = () => {
    if (!fs.existsSync(KNOWLEDGE_DIR)) return [];
    return fs.readdirSync(KNOWLEDGE_DIR)
        .filter((name) => name.endsWith('.md'))
        .flatMap((name) => splitMarkdown(name, fs.readFileSync(path.join(KNOWLEDGE_DIR, name), 'utf8')));
};

const syncKnowledge = async () => {
    const chunks = readKnowledgeFiles().map((chunk) => ({
        ...chunk,
        hash: crypto.createHash('sha1').update(chunk.content).digest('hex')
    }));
    const existing = await db.query('SELECT id, source, chunk_index, content_hash, embedding FROM bot_knowledge');
    const existingByKey = new Map(existing.map((row) => [`${row.source}#${row.chunk_index}`, row]));
    const liveKeys = new Set(chunks.map((chunk) => `${chunk.source}#${chunk.chunk_index}`));

    for (const row of existing) {
        if (!liveKeys.has(`${row.source}#${row.chunk_index}`)) {
            await db.run('DELETE FROM bot_knowledge WHERE id = ?', [row.id]);
        }
    }

    const config = await import('./aiService.js').then(m => m.getAiConfig());
    const canEmbed = Boolean(process.env.GEMINI_API_KEY) || config.provider === 'ollama';

    const needsWork = chunks.filter((chunk) => {
        const row = existingByKey.get(`${chunk.source}#${chunk.chunk_index}`);
        return !row || row.content_hash !== chunk.hash || (!row.embedding && canEmbed);
    });
    if (!needsWork.length) return;

    let vectors = [];
    if (canEmbed) {
        try {
            const model = await getEmbeddingModel();
            vectors = await model.embedDocuments(needsWork.map((chunk) => chunk.content));
        } catch (error) {
            console.warn('Bot RAG: không tạo được embedding, dùng tìm kiếm từ khóa.', error.message);
        }
    }

    for (let i = 0; i < needsWork.length; i += 1) {
        const chunk = needsWork[i];
        const embedding = vectors[i] ? encodeVector(vectors[i]) : null;
        await db.run(
            `INSERT INTO bot_knowledge (source, chunk_index, title, content, content_hash, embedding, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(source, chunk_index) DO UPDATE SET
               title = excluded.title, content = excluded.content, content_hash = excluded.content_hash,
               embedding = excluded.embedding, updated_at = CURRENT_TIMESTAMP`,
            [chunk.source, chunk.chunk_index, chunk.title, chunk.content, chunk.hash, embedding]
        );
    }
    chunkCache = null;
};

export const ensureKnowledgeSynced = () => {
    if (!syncPromise) {
        syncPromise = syncKnowledge().catch((error) => {
            console.error('Bot RAG: lỗi đồng bộ tri thức:', error.message);
            syncPromise = null;
        });
    }
    return syncPromise;
};

const loadChunks = async () => {
    if (chunkCache) return chunkCache;
    const rows = await db.query('SELECT source, title, content, embedding FROM bot_knowledge');
    chunkCache = rows.map((row) => ({
        source: row.source,
        title: row.title,
        content: row.content,
        vector: row.embedding ? decodeVector(row.embedding) : null,
        tokens: new Set(tokenize(row.content))
    }));
    return chunkCache;
};

const keywordSearch = (chunks, query, limit) => {
    const queryTokens = [...new Set(tokenize(query))];
    if (!queryTokens.length) return [];
    return chunks
        .map((chunk) => ({
            chunk,
            score: queryTokens.filter((token) => chunk.tokens.has(token)).length / queryTokens.length
        }))
        .filter((item) => item.score > 0.15)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
};

/**
 * Tìm các đoạn tri thức liên quan. Ưu tiên tìm theo vector (Gemini embedding),
 * tự động rơi về tìm theo từ khóa nếu không có API key hoặc API lỗi.
 */
export const searchKnowledge = async (query, limit = 4) => {
    await ensureKnowledgeSynced();
    const chunks = await loadChunks();
    if (!chunks.length) return [];

    const config = await import('./aiService.js').then(m => m.getAiConfig());
    const canEmbed = Boolean(process.env.GEMINI_API_KEY) || config.provider === 'ollama';

    let ranked = null;
    const vectorChunks = chunks.filter((chunk) => chunk.vector);
    if (canEmbed && vectorChunks.length) {
        try {
            const model = await getEmbeddingModel();
            const queryVector = await model.embedQuery(query);
            ranked = vectorChunks
                .map((chunk) => ({ chunk, score: cosine(queryVector, chunk.vector) }))
                .filter((item) => item.score > 0.45)
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);
        } catch (error) {
            console.warn('Bot RAG: embedding truy vấn lỗi, dùng tìm kiếm từ khóa.', error.message);
        }
    }
    if (!ranked || !ranked.length) ranked = keywordSearch(chunks, query, limit);

    return ranked.map(({ chunk, score }) => ({
        nguon: chunk.title,
        noi_dung: chunk.content,
        do_lien_quan: Number(score.toFixed(2))
    }));
};
