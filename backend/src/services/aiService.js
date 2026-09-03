import * as db from './db.js';

/**
 * Lấy cấu hình hệ thống (Ollama host và model)
 */
export async function getAiConfig() {
    const rows = await db.query("SELECT key, value FROM system_configs WHERE key IN ('ollama_host', 'ai_model')");
    const config = {
        host: 'http://localhost:11434',
        model: 'qwen2.5-coder:1.5b'
    };
    rows.forEach(row => {
        if (row.key === 'ollama_host') config.host = row.value;
        if (row.key === 'ai_model') config.model = row.value;
    });
    // Xóa dấu '/' ở cuối host nếu có
    config.host = config.host.replace(/\/$/, '');
    return config;
}

/**
 * Gửi request sinh câu trả lời bằng Ollama
 */
export async function generateChatResponse(messages, options = { stream: false }) {
    const config = await getAiConfig();
    
    const requestBody = {
        model: config.model,
        messages: messages,
        stream: options.stream
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

    return response;
}
