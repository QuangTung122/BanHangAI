import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import * as db from './db.js';

const DEFAULT_CHAT_MODEL = 'gemini-3.8-flash';
const AVAILABLE_GEMINI_CHAT_MODELS = new Set(['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite']);
const DEFAULT_EMBEDDING_MODEL = 'gemini-embedding-001';

const normalizeGeminiModel = (model) => {
    // Keep stale or unavailable saved settings from breaking calls for this API key.
    return AVAILABLE_GEMINI_CHAT_MODELS.has(model) ? model : DEFAULT_CHAT_MODEL;
};

const requireApiKey = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Thiếu GEMINI_API_KEY trong file .env');
    return apiKey;
};

export const hasGeminiKey = () => Boolean(process.env.GEMINI_API_KEY);

export const getGeminiModel = (options = {}) => {
    const modelName = normalizeGeminiModel(options.model || process.env.GEMINI_MODEL);
    return new ChatGoogleGenerativeAI({
        ...options,
        model: modelName,
        maxOutputTokens: options.maxOutputTokens ?? 2048,
        // Gemini 3 rejects sampling parameters such as temperature.
        temperature: modelName.startsWith('gemini-3') ? undefined : (options.temperature ?? 0.2),
        apiKey: requireApiKey(),
    });
};

export const getEmbeddingModel = async () => {
    const config = await getAiConfig();
    if (config.provider === 'ollama') {
        return new OllamaEmbeddings({
            model: process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text",
            baseUrl: config.host || "http://localhost:11434"
        });
    }
    return new GoogleGenerativeAIEmbeddings({
        model: process.env.GEMINI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL,
        apiKey: requireApiKey(),
    });
};

export const getAiConfig = async () => {
    const fallback = { provider: 'gemini', model: normalizeGeminiModel(process.env.GEMINI_MODEL), model_mode: 'auto', host: 'http://localhost:11434', max_tokens: 2048, temperature: 0.2 };
    try {
        const configRows = await db.query("SELECT key, value FROM system_configs WHERE key IN ('ai_provider', 'ai_model', 'ai_model_mode', 'ai_host', 'ai_max_tokens', 'ai_temperature', 'ai_last_model', 'ai_last_model_reason', 'ai_auto_model', 'ai_auto_until', 'ai_auto_primary')");
        const config = { ...fallback };
        configRows.forEach(row => {
            if (row.key === 'ai_provider') config.provider = row.value;
            if (row.key === 'ai_model') config.model = row.value;
            if (row.key === 'ai_model_mode') config.model_mode = row.value === 'manual' ? 'manual' : 'auto';
            if (row.key === 'ai_host') config.host = row.value;
            if (row.key === 'ai_max_tokens') config.max_tokens = parseInt(row.value) || 2048;
            if (row.key === 'ai_temperature') config.temperature = parseFloat(row.value) || 0.2;
            if (row.key === 'ai_last_model') config.last_model = row.value;
            if (row.key === 'ai_last_model_reason') config.last_model_reason = row.value;
            if (row.key === 'ai_auto_model') config.auto_model = row.value;
            if (row.key === 'ai_auto_until') config.auto_until = Number(row.value) || 0;
            if (row.key === 'ai_auto_primary') config.auto_primary = row.value;
        });
        if (config.provider === 'gemini') config.model = normalizeGeminiModel(config.model);
        return config;
    } catch (e) {
        return fallback;
    }
};

export const recordAiRuntimeModel = async (model, reason = 'configured', primaryModel = null) => {
    const values = {
        ai_last_model: model,
        ai_last_model_reason: reason,
        ai_last_model_at: new Date().toISOString()
    };
    if (reason === 'failover' && primaryModel) {
        values.ai_auto_model = model;
        values.ai_auto_until = String(Date.now() + 5 * 60 * 1000);
        values.ai_auto_primary = primaryModel;
    }
    for (const [key, value] of Object.entries(values)) {
        await db.run('INSERT INTO system_configs (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, value]);
    }
};

export const getChatModel = async (options = {}) => {
    const config = await getAiConfig();
    const commonOpts = {
        temperature: config.temperature,
        ...options
    };

    if (config.provider === 'ollama') {
        return new ChatOllama({
            model: config.model || "llama3", // fallback ollama model
            baseUrl: config.host || "http://localhost:11434",
            ...commonOpts
        });
    }
    
    return getGeminiModel({ 
        model: config.model, 
        maxOutputTokens: config.max_tokens,
        ...commonOpts 
    });
};

export const generateGroundedText = async (systemPrompt, userPrompt) => {
    const llm = await getChatModel();
    const messages = [
        ["system", systemPrompt],
        ["human", userPrompt]
    ];
    const response = await llm.invoke(messages);
    return response.content;
};
