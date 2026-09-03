import ApiClient from '../core/ApiClient.js';

class NotificationService {
    async getNotifications() {
        return await ApiClient.get('/notifications');
    }

    async markAsRead(id) {
        return await ApiClient.request(`/notifications/${id}/read`, { method: 'PUT' });
    }

    async markAllAsRead() {
        return await ApiClient.request('/notifications/read-all', { method: 'PUT' });
    }
}

export default new NotificationService();
