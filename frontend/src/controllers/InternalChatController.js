import InternalChatModule from '../views/layouts/InternalChatModule.js';
import ChatModel from '../models/ChatModel.js';
import AuthModel from '../models/AuthModel.js';

export default class InternalChatController {
    constructor() {
        this.view = new InternalChatModule();
        this.model = new ChatModel();
        this.authModel = new AuthModel();
        
        this.pollingInterval = null;
        this.init();
    }

    async init() {
        this.view.bindToggleChat();
        
        // Fetch users
        try {
            await this.model.fetchUsers();
            this.view.renderUserList(this.model.users, (id, name) => {
                this.openChat(id, name);
            });
        } catch (e) {
            console.error("Failed to fetch chat users", e);
        }

        this.view.bindSendMessage(this.handleSendMessage.bind(this));
    }

    async openChat(partnerId, partnerName) {
        this.view.openChatWith(partnerName);
        
        // Dừng polling cũ
        if (this.pollingInterval) clearInterval(this.pollingInterval);

        // Fetch lần đầu
        await this.loadMessages(partnerId);

        // Polling mỗi 5s
        this.pollingInterval = setInterval(() => {
            this.loadMessages(partnerId);
        }, 5000);
    }

    async loadMessages(partnerId) {
        try {
            const currentUserId = this.authModel.user.id;
            await this.model.fetchHistory(partnerId);
            this.view.renderMessages(this.model.messages, currentUserId);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    async handleSendMessage(text, imageFile = null) {
        try {
            // Optimistic update
            this.view.appendMessage({ content: text, image_url: imageFile ? URL.createObjectURL(imageFile) : null }, true);
            await this.model.sendMessage(text, imageFile);
        } catch (error) {
            console.error("Lỗi gửi tin nhắn", error);
            alert(error.message || 'Không gửi được tin nhắn.');
        }
    }
}
