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
            // Cần xóa dấu / ở cuối host nếu có
            const baseUrl = host.replace(/\/$/, '');
            const response = await fetch(`${baseUrl}/api/tags`);
            if (!response.ok) throw new Error('Không thể kết nối');
            const data = await response.json();
            return { success: true, models: data.models || [] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

export default new SystemService();
