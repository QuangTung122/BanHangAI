import ApiClient from '../core/ApiClient.js';

export default class AuditModel {
    constructor() {
        this.logs = [];
        this.meta = { total: 0, page: 1, totalPages: 1 };
    }

    async fetchLogs(filters = {}) {
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await ApiClient.get(`/audit-logs?${query}`);
            
            if (res.status === 200 && res.data.success) {
                this.logs = res.data.data;
                this.meta = res.data.meta;
                return { success: true };
            }
            return { success: false, message: res.data.message || 'Lỗi tải log' };
        } catch (error) {
            console.error('Audit fetch error:', error);
            return { success: false, message: 'Lỗi kết nối' };
        }
    }
}
