import SystemService from '../services/SystemService.js';

export default class SystemModel {
    constructor() {
        this.configs = {
            ollama_host: '',
            ai_model: '',
            ai_max_tokens: '4096',
            ai_system_prompt: '',
            ai_temperature: '0.7',
            bgm_url: ''
        };
    }

    async fetchConfigs() {
        const { data } = await SystemService.getConfigs();
        if (data && data.success) {
            this.configs = { ...this.configs, ...data.data };
        }
        return data;
    }

    async saveConfigs(newConfigs) {
        const { data } = await SystemService.updateConfigs(newConfigs);
        if (data && data.success) {
            this.configs = { ...this.configs, ...newConfigs };
        }
        return data;
    }

    async downloadBackup() {
        const token = localStorage.getItem('token');
        // Vì file tải về là binary nên không dùng ApiClient JSON được.
        // Gửi request trực tiếp
        try {
            const response = await fetch('http://localhost:5000/api/system/backup', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Backup failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ecom_ai_backup_${new Date().getTime()}.db`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            return { success: true };
        } catch (error) {
            return { success: false, message: 'Không thể sao lưu' };
        }
    }

    async checkOllamaConnection(host) {
        return await SystemService.checkOllama(host);
    }

    async resetData(confirmation) {
        return await SystemService.resetData(confirmation);
    }
}
