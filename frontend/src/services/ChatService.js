export default class ChatService {
    static async streamChat(message, history, onChunk, onDone, onError) {
        try {
            const token = localStorage.getItem('ecom_token');
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch('/api/chat/stream', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ message, history })
            });

            if (!response.ok) {
                throw new Error('Không thể kết nối đến máy chủ AI');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                
                // Giữ lại phần tử cuối cùng (có thể chưa hoàn thành dòng)
                buffer = lines.pop();
                
                for (const line of lines) {
                    if (line.trim().startsWith('data: ')) {
                        const dataStr = line.trim().substring(6);
                        if (dataStr === '[DONE]') {
                            onDone();
                            return;
                        }
                        
                        try {
                            const data = JSON.parse(dataStr);
                            if (data.error) {
                                onError(data.error);
                            } else if (data.content) {
                                onChunk(data.content);
                            }
                        } catch (e) {
                            // ignore partial JSON parse errors
                        }
                    }
                }
            }
            onDone();
        } catch (error) {
            onError(error.message);
        }
    }
}
