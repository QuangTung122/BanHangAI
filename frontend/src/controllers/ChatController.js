import ChatModule from '../views/layouts/ChatModule.js';
import ChatService from '../services/ChatService.js';

export default class ChatController {
    constructor() {
        this.view = new ChatModule();
        this.history = [];
        this.init();
    }

    init() {
        this.view.bindToggleChat();
        this.view.bindSendMessage(this.handleSendMessage.bind(this));
    }

    async handleSendMessage(text) {
        // 1. Hiển thị tin nhắn của User
        this.view.appendUserMessage(text);
        
        // 2. Disable input, show typing
        this.view.setLoadingState(true);
        const aiBubble = this.view.appendAIBubble();
        
        let fullResponse = '';

        // 3. Gọi Streaming API
        ChatService.streamChat(
            text, 
            this.history, 
            // onChunk
            (chunk) => {
                fullResponse += chunk;
                this.view.updateBubbleText(aiBubble, fullResponse);
            },
            // onDone
            () => {
                this.view.setLoadingState(false);
                this.history.push({ role: 'user', content: text });
                this.history.push({ role: 'assistant', content: fullResponse });
                
                // Giới hạn 10 lịch sử gần nhất để tiết kiệm context
                if (this.history.length > 10) {
                    this.history = this.history.slice(-10);
                }
            },
            // onError
            (errorMsg) => {
                this.view.setLoadingState(false);
                this.view.updateBubbleText(aiBubble, `<span class="text-red-500">Lỗi: ${errorMsg}</span>`);
            }
        );
    }
}
