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
    config.max_tokens = maxTokensRow ? parseInt(maxTokensRow.value) : 8192;

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
        let toolCallOccurred = false;

        do {
            toolCallOccurred = false;
            
            const requestBody = {
                model: config.model,
                messages: currentMessages,
                stream: true,
                tools: ollamaToolDeclarations,
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

            let funcCallName = null;
            let funcCallArgs = null;
            let assistantMessage = { role: 'assistant', content: '' };

            for await (const chunk of response.body) {
                 const chunkStr = Buffer.from(chunk).toString('utf-8');
                 const lines = chunkStr.split('\n').filter(line => line.trim() !== '');
                 for (const line of lines) {
                     try {
                          const parsed = JSON.parse(line);
                          if (parsed.message) {
                              if (parsed.message.tool_calls && parsed.message.tool_calls.length > 0) {
                                  // Lấy tool call đầu tiên
                                  funcCallName = parsed.message.tool_calls[0].function.name;
                                  funcCallArgs = parsed.message.tool_calls[0].function.arguments;
                                  assistantMessage.tool_calls = parsed.message.tool_calls;
                              } else if (parsed.message.content) {
                                  const cleanContent = parsed.message.content.replace(/[\u4e00-\u9fa5]/g, '');
                                  assistantMessage.content += cleanContent;
                                  if (cleanContent) {
                                      yield cleanContent;
                                  }
                              }
                          }
                      } catch(e) {}
                 }
            }

            if (funcCallName) {
                toolCallOccurred = true;
                currentMessages.push(assistantMessage);
                
                // Thực thi tool
                const apiResponse = await executeAiTool(funcCallName, funcCallArgs, userRole);
                
                // Gửi lại kết quả tool cho Ollama
                currentMessages.push({
                    role: 'tool',
                    content: JSON.stringify(apiResponse)
                });
            }
        } while (toolCallOccurred);
    }
}
