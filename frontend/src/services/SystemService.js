import ApiClient from '../core/ApiClient.js';

class SystemService {
    async getConfigs() {
        return await ApiClient.get('/system/config');
    }

    async updateConfigs(configs) {
        return await ApiClient.request('/system/config', {
            method: 'PUT',
            body: JSON.stringify(configs)
        });
    }

    getBackupUrl() {
        // Cần truyền token vào URL hoặc gọi qua fetch blob.
        // Cách nhanh nhất là fetch file blob.
        return ApiClient.request('/system/backup', { method: 'GET' });
    }

    async resetData(confirmation) {
        return await ApiClient.post('/system/reset-data', { confirmation });
    }

    // API check Ollama models
    async checkOllama(host) {
        try {
            const { data } = await ApiClient.post('/system/check-ollama', { host });
            if (!data) throw new Error('Mất kết nối với máy chủ Backend');
            if (!data.success) throw new Error(data.message || 'Lỗi kiểm tra Ollama');
            return data;
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

export default new SystemService();
