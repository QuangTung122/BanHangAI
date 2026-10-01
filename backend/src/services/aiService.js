import * as db from './db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiToolDeclarations, ollamaToolDeclarations, executeAiTool } from './aiTool.js';

/**
 * Lấy cấu hình hệ thống (Ollama host và model)
 */
export async function getAiConfig() {
    const rows = await db.query("SELECT key, value FROM system_configs WHERE key IN ('ollama_host', 'ai_model', 'ai_provider', 'gemini_model', 'ollama_model', 'ai_max_tokens')");
    const config = {
        provider: 'ollama', // gemini hoặc ollama
        host: 'http://localhost:11434',
        model: 'qwen2.5:1.5b' // fallback
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
        // Sử dụng phiên bản gemini-3.8-flash mới nhất
        config.model = gemini_model || (ai_model_legacy?.startsWith('gemini') ? ai_model_legacy : 'gemini-3.8-flash');
    } else {
        config.model = ollama_model || (!ai_model_legacy?.startsWith('gemini') ? ai_model_legacy : 'qwen2.5:1.5b');
    }

    config.host = config.host.replace(/\/$/, '');
    config.host = config.host.replace('://localhost', '://127.0.0.1');

    const maxTokensRow = rows.find(r => r.key === 'ai_max_tokens');
    const configuredMaxTokens = maxTokensRow ? parseInt(maxTokensRow.value, 10) : 512;
    config.max_tokens = Number.isFinite(configuredMaxTokens) && configuredMaxTokens > 0 ? configuredMaxTokens : 512;

    return config;
}

/**
 * Gửi request sinh câu trả lời AI (Hỗ trợ Stream cho cả Gemini và Ollama)
 */
export async function* generateChatStream(messages, userRole = 'admin') {
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
            },
            tools: geminiToolDeclarations
        };
        if (systemMessage) {
            modelConfig.systemInstruction = systemMessage.content;
        }

        const modelInstance = genAI.getGenerativeModel(modelConfig);
        
        const chatHistory = historyMessages.slice(0, -1);
        const userMsg = historyMessages[historyMessages.length - 1].parts[0].text;

        const chat = modelInstance.startChat({ history: chatHistory });
        const result = await chat.sendMessageStream(userMsg);

        let funcCallName = null;
        let funcCallArgs = null;

        for await (const chunk of result.stream) {
            // FIX BUGS: Đọc trực tiếp từ cấu trúc raw thay vì dùng hàm helper .functionCall() của SDK (bị lỗi undefined index 0)
            const parts = chunk.candidates?.[0]?.content?.parts || [];
            const funcCallPart = parts.find(p => p.functionCall);

            if (funcCallPart) {
                funcCallName = funcCallPart.functionCall.name;
                funcCallArgs = funcCallPart.functionCall.args;
                // Không break ở đây để stream hoàn tất, giúp SDK lưu function call vào lịch sử
            } else {
                try {
                    const chunkText = chunk.text();
                    if (chunkText) yield chunkText;
                } catch (e) {
                    // ignore invalid text chunks
                }
            }
        }

        // Đợi response hoàn chỉnh để SDK cập nhật history
        await result.response;

        if (funcCallName) {
            // Thực thi hàm an toàn từ aiTool.js
            const apiResponse = await executeAiTool(funcCallName, funcCallArgs, userRole);
            
            // Gửi data ngược lại cho Gemini
            const toolResult = await chat.sendMessageStream([{
                functionResponse: {
                    name: funcCallName,
                    response: { data: apiResponse }
                }
            }]);
            
            for await (const finalChunk of toolResult.stream) {
                try {
                    const finalChunkText = finalChunk.text();
                    if (finalChunkText) yield finalChunkText;
                } catch (e) {
                    // ignore invalid text chunks
                }
            }
            await toolResult.response;
        }
    } else {
        let currentMessages = [...messages];
        const maxToolRounds = 2;

        for (let round = 0; round < maxToolRounds; round += 1) {
            const requestBody = {
                model: config.model,
                messages: currentMessages,
                stream: true,
                tools: ollamaToolDeclarations,
                options: {
                    temperature: 0.2,
                    num_predict: Math.min(config.max_tokens, 512),
                    num_ctx: 4096
                }
            };

            const response = await fetch(`${config.host}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                signal: AbortSignal.timeout(60000)
            });

            if (!response.ok) {
                throw new Error(`Ollama API trả về mã lỗi: ${response.status}`);
            }

            let funcCall = null;
            const assistantMessage = { role: 'assistant', content: '' };
            const decoder = new TextDecoder();
            let buffer = '';

            const consumeLine = (line) => {
                if (!line.trim()) return;
                let parsed;
                try {
                    parsed = JSON.parse(line);
                } catch {
                    return;
                }
                if (parsed.error) throw new Error(parsed.error);
                const message = parsed.message;
                if (!message) return;
                if (Array.isArray(message.tool_calls) && message.tool_calls.length > 0) {
                    assistantMessage.tool_calls = message.tool_calls;
                    const firstCall = message.tool_calls[0];
                    funcCall = {
                        name: firstCall?.function?.name,
                        args: firstCall?.function?.arguments
                    };
                    return;
                }
                if (message.content) {
                    assistantMessage.content += message.content;
                    yieldChunk(message.content);
                }
            };

            // Keep the stream incremental while carrying incomplete JSON lines between chunks.
            const pendingChunks = [];
            const yieldChunk = (value) => pendingChunks.push(value);
            const flushOutput = async function* () {
                while (pendingChunks.length) yield pendingChunks.shift();
            };

            for await (const chunk of response.body) {
                buffer += decoder.decode(chunk, { stream: true });
                let newlineIndex;
                while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.slice(0, newlineIndex).replace(/\r$/, '');
                    buffer = buffer.slice(newlineIndex + 1);
                    consumeLine(line);
                    yield* flushOutput();
                }
            }
            buffer += decoder.decode();
            if (buffer.trim()) {
                consumeLine(buffer);
                yield* flushOutput();
            }

            if (!funcCall?.name) return;

            let functionArgs = funcCall.args || {};
            if (typeof functionArgs === 'string') {
                try {
                    functionArgs = JSON.parse(functionArgs);
                } catch {
                    functionArgs = {};
                }
            }
            currentMessages.push(assistantMessage);
            const apiResponse = await executeAiTool(funcCall.name, functionArgs, userRole);
            currentMessages.push({ role: 'tool', content: JSON.stringify(apiResponse) });
        }

        yield 'Mình chưa xử lý được yêu cầu này từ dữ liệu hiện có. Bạn thử hỏi ngắn gọn hơn hoặc dùng lệnh tra cứu cụ thể nhé.';
    }
}

// Text-only generation for database-grounded helpers. This path deliberately
// omits tools so a small model can explain a server-selected result without
// running another query or taking an action of its own.
export async function generateGroundedText(systemPrompt, userPrompt) {
    const config = await getAiConfig();
    if (config.provider === 'gemini') {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('Thiếu GEMINI_API_KEY trong file .env');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: config.model,
            systemInstruction: systemPrompt,
            generationConfig: { maxOutputTokens: Math.min(config.max_tokens, 240), temperature: 0.2 }
        });
        const result = await model.generateContent(userPrompt);
        return result.response.text().trim();
    }

    const response = await fetch(`${config.host}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: config.model,
            stream: false,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            options: { temperature: 0.2, num_predict: Math.min(config.max_tokens, 240), num_ctx: 4096 }
        }),
        signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) throw new Error(`Ollama API trả về mã lỗi: ${response.status}`);
    const payload = await response.json();
    if (payload.error) throw new Error(payload.error);
    return String(payload.message?.content || '').trim();
}
