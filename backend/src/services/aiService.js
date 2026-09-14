import * as db from './db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Lấy cấu hình hệ thống (Ollama host và model)
 */
export async function getAiConfig() {
    const rows = await db.query("SELECT key, value FROM system_configs WHERE key IN ('ollama_host', 'ai_model', 'ai_provider', 'gemini_model', 'ollama_model', 'ai_max_tokens')");
    const config = {
        provider: 'ollama', // gemini hoặc ollama
        host: 'http://localhost:11434',
        model: 'qwen2.5-coder:1.5b' // fallback
    };
    
    let ai_model_legacy = null;
    let gemini_model = null;
    let ollama_model = null;

    rows.forEach(row => {
        if (row.key === 'ollama_host') config.host = row.value;
        if (row.key === 'ai_provider') config.provider = row.value;
        if (row.key === 'ai_model') ai_model_legacy = row.value;
        if (row.key === 'gemini_model') gemini_model = row.value;
        if (row.key === 'ollama_model') ollama_model = row.value;
    });

    if (config.provider === 'gemini') {
        config.model = gemini_model || (ai_model_legacy?.startsWith('gemini') ? ai_model_legacy : 'gemini-3.7-flash');
    } else {
        config.model = ollama_model || (!ai_model_legacy?.startsWith('gemini') ? ai_model_legacy : 'qwen2.5-coder:1.5b');
    }

    // Xóa dấu '/' ở cuối host nếu có
    config.host = config.host.replace(/\/$/, '');
    config.host = config.host.replace('://localhost', '://127.0.0.1');

    // Lấy max_tokens
    const maxTokensRow = rows.find(r => r.key === 'ai_max_tokens');
    config.max_tokens = maxTokensRow ? parseInt(maxTokensRow.value) : 8192;

    return config;
}

/**
 * Gửi request sinh câu trả lời AI (Hỗ trợ Stream cho cả Gemini và Ollama)
 */
export async function* generateChatStream(messages) {
    const config = await getAiConfig();

    if (config.provider === 'gemini') {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('Thiếu GEMINI_API_KEY trong file .env');

        const genAI = new GoogleGenerativeAI(apiKey);
        
        const systemMessage = messages.find(m => m.role === 'system');
        const historyMessages = messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        const modelConfig = { 
            model: config.model,
            generationConfig: {
                maxOutputTokens: config.max_tokens
            }
        };
        if (systemMessage) {
            modelConfig.systemInstruction = systemMessage.content;
        }

        const modelInstance = genAI.getGenerativeModel(modelConfig);
        
        // Trừ tin nhắn cuối cùng để truyền vào userMsg
        const chatHistory = historyMessages.slice(0, -1);
        const userMsg = historyMessages[historyMessages.length - 1].parts[0].text;

        const chat = modelInstance.startChat({ history: chatHistory });
        const result = await chat.sendMessageStream(userMsg);

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            yield chunkText;
        }
    } else {
        // Fallback: Sử dụng Ollama
        const requestBody = {
            model: config.model,
            messages: messages,
            stream: true,
            options: {
                num_predict: config.max_tokens,
                num_ctx: 8192
            }
        };

        const response = await fetch(`${config.host}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Ollama API trả về mã lỗi: ${response.status}`);
        }

        for await (const chunk of response.body) {
             const chunkStr = Buffer.from(chunk).toString('utf-8');
             const lines = chunkStr.split('\n').filter(line => line.trim() !== '');
             for (const line of lines) {
                 try {
                     const parsed = JSON.parse(line);
                     if (parsed.message && parsed.message.content) {
                         yield parsed.message.content;
                     }
                 } catch(e) {}
             }
        }
    }
}
