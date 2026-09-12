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
            <button id="btn-toggle-chat" class="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-[0_10px_25px_rgba(99,102,241,0.5)] flex items-center justify-center text-white hover:scale-110 hover:shadow-[0_15px_35px_rgba(99,102,241,0.6)] transition-all duration-300 relative overflow-hidden group border-2 border-white/20 backdrop-blur-sm z-50">
                <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                <!-- Vòng tròn sáng nhấp nháy -->
                <div class="absolute inset-0 rounded-full animate-ping bg-white/20 opacity-75 duration-1000"></div>
                <!-- Ảnh Robot 3D nổi bật -->
                <img src="assets/images/logo-ai.png" alt="AI Chat" class="w-12 h-12 object-contain relative z-10 drop-shadow-xl group-hover:rotate-12 transition-transform duration-300">
                
                <!-- Badge chưa đọc (nếu có) -->
                <span class="absolute top-0 right-0 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-black shadow-sm hidden">1</span>
            </button>

            <!-- Cửa sổ Chat -->
            <div id="chat-window" class="hidden flex-col w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] border border-slate-100/50 mt-4 overflow-hidden origin-bottom-right transition-all absolute bottom-20 right-0 z-40">
                
                <!-- Header -->
                <div class="h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 flex items-center justify-between px-4 text-white relative overflow-hidden">
                    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div class="flex items-center gap-3 relative z-10">
                        <!-- Avatar Robot trong Header -->
                        <div class="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shadow-inner relative">
                            <img src="assets/images/logo-ai.png" alt="AI" class="w-full h-full object-cover">
                        </div>
                        <div>
                            <div class="flex items-center gap-1.5">
                                <span class="font-black text-[15px] tracking-wide text-white">Trợ lý BanHangAI</span>
                                <span class="relative flex h-2 w-2">
                                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            </div>
                            <div class="text-[10px] text-indigo-200 font-medium">Sẵn sàng hỗ trợ bạn 24/7</div>
                        </div>
                    </div>
                    <button id="btn-close-chat" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors relative z-10 backdrop-blur-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <!-- Lịch sử Chat -->
                <div id="chat-history" class="flex-1 overflow-y-auto p-5 space-y-5 bg-[#f8faff] text-sm">
                    <!-- Lời chào mặc định -->
                    <div class="flex gap-3">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-sm mt-0.5">
                            <img src="assets/images/logo-ai.png" alt="AI" class="w-full h-full object-cover">
                        </div>
                        <div class="bg-white px-4 py-2.5 rounded-2xl rounded-tl-sm border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-slate-700 leading-relaxed font-medium">
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
        wrapper.className = 'flex gap-3';
        wrapper.innerHTML = `
            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-sm mt-0.5">
                <img src="assets/images/logo-ai.png" alt="AI" class="w-full h-full object-cover">
            </div>
            <div class="ai-content bg-white px-4 py-2.5 rounded-2xl rounded-tl-sm border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-slate-700 leading-relaxed font-medium min-h-[36px] max-w-[85%]">
                <span class="typing-dots flex gap-1 items-center mt-1.5 mb-1.5 px-1">
                    <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                    <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
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
