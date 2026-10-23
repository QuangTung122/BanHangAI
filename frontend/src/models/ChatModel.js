import ChatService from '../services/ChatService.js';

export default class ChatModel {
    constructor() {
        this.users = [];
        this.messages = [];
        this.activePartnerId = null;
    }

    async fetchUsers() {
        const { data } = await ChatService.getChatUsers();
        if (data && data.success) {
            this.users = data.data;
        }
        return this.users;
    }

    async fetchHistory(partnerId) {
        this.activePartnerId = partnerId;
        const { data } = await ChatService.getChatHistory(partnerId);
        if (data && data.success) {
            this.messages = data.data;
        }
        return this.messages;
    }

    async sendMessage(content, imageFile = null) {
        if (!this.activePartnerId) throw new Error("Chưa chọn người chat");
        const { data } = await ChatService.sendMessage(this.activePartnerId, content, imageFile);
        if (data && data.success) {
            this.messages.push(data.data);
            return data.data;
        }
        throw new Error("Lỗi gửi tin nhắn");
    }
}
