export default class ChatModule {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'ai-chat-module';
        this.container.className = 'fixed bottom-6 right-6 z-50 flex flex-col items-end';
        
        this.isOpen = false;
        
        this.render();
        document.body.appendChild(this.container);
    }

    render() {
        this.container.innerHTML = `
            <!-- Nút bật tắt chat -->
            <button id="btn-toggle-chat" class="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            </button>

            <!-- Cửa sổ Chat -->
            <div id="chat-window" class="hidden flex-col w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-100 mt-4 overflow-hidden origin-bottom-right transition-all absolute bottom-16 right-0">
                
                <!-- Header -->
                <div class="h-14 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-between px-4 text-white">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">AI</div>
                        <span class="font-semibold text-sm">Trợ lý BanHangAI</span>
                    </div>
                    <button id="btn-close-chat" class="text-white/80 hover:text-white transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <!-- Lịch sử Chat -->
                <div id="chat-history" class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 text-sm">
                    <!-- Lời chào mặc định -->
                    <div class="flex gap-2">
                        <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-xs mt-1">AI</div>
                        <div class="bg-white px-3 py-2 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm text-slate-700">
                            Chào bạn! Tôi là Trợ lý AI của cửa hàng. Bạn cần tìm sản phẩm gì ạ?
                        </div>
                    </div>
                </div>

                <!-- Khung nhập liệu -->
                <div class="p-3 bg-white border-t border-slate-100">
                    <form id="chat-form" class="flex items-center gap-2">
                        <input type="text" id="chat-input" class="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-indigo-100 focus:outline-none text-sm text-slate-700" placeholder="Hỏi tôi về sản phẩm..." autocomplete="off">
                        <button type="submit" id="btn-send-chat" class="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors shrink-0">
                            <svg class="w-4 h-4 translate-x-px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    bindToggleChat() {
        const btnToggle = this.container.querySelector('#btn-toggle-chat');
        const btnClose = this.container.querySelector('#btn-close-chat');
        const chatWindow = this.container.querySelector('#chat-window');

        const toggle = () => {
            this.isOpen = !this.isOpen;
            if (this.isOpen) {
                chatWindow.classList.remove('hidden');
                chatWindow.classList.add('flex');
            } else {
                chatWindow.classList.add('hidden');
                chatWindow.classList.remove('flex');
            }
        };

        btnToggle.addEventListener('click', toggle);
        btnClose.addEventListener('click', toggle);
    }

    bindSendMessage(handler) {
        const form = this.container.querySelector('#chat-form');
        const input = this.container.querySelector('#chat-input');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;
            handler(text);
            input.value = '';
        });
    }

    appendUserMessage(text) {
        const history = this.container.querySelector('#chat-history');
        const msgHtml = `
            <div class="flex gap-2 justify-end">
                <div class="bg-indigo-600 text-white px-3 py-2 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%]">
                    ${text}
                </div>
            </div>
        `;
        history.insertAdjacentHTML('beforeend', msgHtml);
        history.scrollTop = history.scrollHeight;
    }

    appendAIBubble() {
        const history = this.container.querySelector('#chat-history');
        const wrapper = document.createElement('div');
        wrapper.className = 'flex gap-2';
        wrapper.innerHTML = `
            <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-xs mt-1">AI</div>
            <div class="ai-content bg-white px-3 py-2 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm text-slate-700 min-h-[36px] flex items-center max-w-[85%]">
                <span class="typing-dots flex gap-1">
                    <span class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                    <span class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                    <span class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
                </span>
            </div>
        `;
        history.appendChild(wrapper);
        history.scrollTop = history.scrollHeight;
        
        return wrapper.querySelector('.ai-content');
    }

    updateBubbleText(bubbleEl, text) {
        // Render Markdown cơ bản: in đậm, xuống dòng
        let htmlText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        bubbleEl.innerHTML = htmlText;
        const history = this.container.querySelector('#chat-history');
        history.scrollTop = history.scrollHeight;
    }

    setLoadingState(isLoading) {
        const input = this.container.querySelector('#chat-input');
        const btn = this.container.querySelector('#btn-send-chat');
        input.disabled = isLoading;
        btn.disabled = isLoading;
        if (isLoading) {
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
            input.focus();
        }
    }
}
