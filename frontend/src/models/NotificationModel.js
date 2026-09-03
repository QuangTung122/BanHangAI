import NotificationService from '../services/NotificationService.js';

export default class NotificationModel {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
    }

    async fetchNotifications() {
        const { data } = await NotificationService.getNotifications();
        if (data && data.success) {
            this.notifications = data.data.notifications;
            this.unreadCount = data.data.unreadCount;
        }
        return data;
    }

    async markAsRead(id) {
        return await NotificationService.markAsRead(id);
    }

    async markAllAsRead() {
        return await NotificationService.markAllAsRead();
    }
}
