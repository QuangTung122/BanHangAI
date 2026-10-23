export default class ChatService {
    static async requestHumanHelp(context = '') {
        const token = localStorage.getItem('bot_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await fetch('/api/bot/handoff', {
            method: 'POST',
            headers,
            body: JSON.stringify({ context })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Không gửi được yêu cầu hỗ trợ');
        return data;
    }

    static async getSupportMessages(requestId, accessKey, after = 0) {
        const response = await fetch(`/api/bot/handoff/${encodeURIComponent(requestId)}/messages?after=${after}`, {
            headers: { 'X-Support-Key': accessKey }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Không tải được tin nhắn hỗ trợ');
        return data;
    }

    static async sendSupportMessage(requestId, accessKey, content, image = null) {
        if (image) {
            const body = new FormData();
            body.append('content', content || '');
            body.append('image', image, image.name);
            const response = await fetch(`/api/bot/handoff/${encodeURIComponent(requestId)}/messages`, {
                method: 'POST',
                headers: { 'X-Support-Key': accessKey },
                body
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Không gửi được tin nhắn hỗ trợ');
            return data;
        }
        const response = await fetch(`/api/bot/handoff/${encodeURIComponent(requestId)}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Support-Key': accessKey },
            body: JSON.stringify({ content })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Không gửi được tin nhắn hỗ trợ');
        return data;
    }

    static async closeSupportSession(requestId, accessKey) {
        const response = await fetch(`/api/bot/handoff/${encodeURIComponent(requestId)}/close`, {
            method: 'POST',
            headers: { 'X-Support-Key': accessKey }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Không thể kết thúc phiên hỗ trợ');
        return data;
    }

    static async streamChat(message, history, onChunk, onDone, onError, onPending, image = null) {
        try {
            const token = localStorage.getItem('bot_token'); // Use bot_token specifically if you want, or just 'token'
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            let body;
            if (image) {
                body = new FormData();
                body.append('message', message);
                body.append('history', JSON.stringify(history));
                body.append('image', image, image.name);
            } else {
                headers['Content-Type'] = 'application/json';
                body = JSON.stringify({ message, history });
            }

            const response = await fetch('/api/bot/stream', {
                method: 'POST',
                headers: headers,
                body
            });

            if (!response.ok) {
                let errorMsg = 'Không thể kết nối đến máy chủ AI';
                try {
                    const errorData = await response.json();
                    if (errorData.message) errorMsg = errorData.message;
                } catch(e) {}
                throw new Error(`${response.status} ${response.statusText}: ${errorMsg}`);
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
                            if (data.pending) onPending?.(data.pending);
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

    static async confirmCustomerAction(actionId) {
        const response = await fetch(`/api/bot/actions/${encodeURIComponent(actionId)}/confirm`, { method: 'POST' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Không xác nhận được thao tác.');
        return data;
    }

    static async cancelCustomerAction(actionId) {
        const response = await fetch(`/api/bot/actions/${encodeURIComponent(actionId)}/cancel`, { method: 'POST' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Không hủy được thao tác.');
        return data;
    }

    static async botLogout() {
        const response = await fetch('/api/bot/logout', { method: 'POST' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Không thể đăng xuất.');
        return data;
    }

    // --- BOT AUTH API ---
    static async botLogin(username, password) {
        const response = await fetch('/api/bot/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Đăng nhập thất bại');
        }
        return response.json();
    }

    static async requestBotRegistrationOtp(phone) {
        const response = await fetch('/api/bot/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Không gửi được mã xác minh');
        return data;
    }

    static async botRegister(details) {
        const response = await fetch('/api/bot/register/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(details)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Đăng ký thất bại');
        }
        return data;
    }

    static async botProfile() {
        const token = localStorage.getItem('bot_token');
        if (!token) throw new Error('Not logged in');
        const response = await fetch('/api/bot/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Lỗi lấy thông tin bot');
        }
        return response.json();
    }

    static async getCustomerUpdates() {
        const token = localStorage.getItem('bot_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch('/api/bot/updates', { headers });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Không tải được thông báo Bot.');
        return data;
    }

    // --- INTERNAL CHAT API ---
    static async getChatUsers() {
        const ApiClient = (await import('../core/ApiClient.js')).default;
        return ApiClient.get('/chat/users');
    }

    static async getChatHistory(partnerId) {
        const ApiClient = (await import('../core/ApiClient.js')).default;
        return ApiClient.get(`/chat/history/${partnerId}`);
    }

    static async sendMessage(receiverId, content, imageFile = null) {
        const ApiClient = (await import('../core/ApiClient.js')).default;
        if (imageFile) {
            const formData = new FormData();
            formData.append('receiverId', receiverId);
            formData.append('content', content || '');
            formData.append('image', imageFile);
            return ApiClient.postFormData('/chat/message', formData);
        }
        return ApiClient.post('/chat/message', { receiverId, content });
    }
}
