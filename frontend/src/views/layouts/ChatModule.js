export default class ChatModule {
    constructor(parentElement = null) {
        this.container = document.createElement('div');
        this.imagePreviewUrls = new Set();
        this.isEmbedded = !!parentElement;
        
        if (this.isEmbedded) {
            this.container.id = 'ai-chat-module-embedded';
            this.container.className = 'flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden';
        } else {
            this.container.id = 'ai-chat-module';
            this.container.className = 'fixed bottom-6 right-6 z-50 flex flex-col items-end';
        }
        
        this.isOpen = this.isEmbedded; // Always open if embedded
        
        this.render();
        
        if (this.isEmbedded) {
            parentElement.appendChild(this.container);
        } else {
            document.body.appendChild(this.container);
        }
    }

    render() {
        if (this.isEmbedded) {
            this.container.innerHTML = `
                <!-- Header -->
                <div class="h-16 bg-gradient-to-r from-slate-800 to-slate-900 flex items-center px-5 text-white relative overflow-hidden shrink-0 border-b border-slate-700">
                    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                    <div class="flex items-center gap-3 relative z-10">
                        <div class="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center overflow-hidden border border-indigo-400/30 shadow-sm relative p-1.5">
                            <img src="assets/images/logo-ai.png" alt="AI" class="w-full h-full object-contain">
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="font-black text-[16px] tracking-wide text-white">Trợ lý AI</span>
                                <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Online
                                </span>
                            </div>
                            <div class="text-[11px] text-slate-400 font-medium mt-0.5">HTH Smart Sales Bot</div>
                        </div>
                    </div>
                    <div id="bot-session" class="ml-auto relative z-10 flex items-center gap-2"></div>
                </div>

                <!-- Lịch sử Chat -->
                <div id="chat-history" class="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50 text-sm scroll-smooth">
                    <div class="flex gap-3">
                        <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm mt-0.5 border border-indigo-200/50 p-1.5">
                            <img src="assets/images/logo-ai.png" alt="AI" class="w-full h-full object-contain">
                        </div>
                        <div class="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-200/80 shadow-sm text-slate-700 leading-relaxed font-medium">
                            Chào bạn! Mình là Trợ lý AI. Gõ <code class="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded text-xs">/batdau</code> để xem chức năng, hoặc gõ <code class="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded text-xs">/trogiup</code> để xem danh sách lệnh nhé.
                        </div>
                    </div>
                </div>

                <!-- Khung nhập liệu -->
                <div class="relative p-4 bg-white border-t border-slate-200 shrink-0">
                    <div id="chat-quick-actions" class="hidden mb-3 overflow-x-auto whitespace-nowrap"></div>
                    <!-- Popup Gợi ý lệnh -->
                    <div id="command-suggestions" class="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden hidden z-50 transition-all duration-200 translate-y-2 opacity-0 flex flex-col max-h-[250px]">
                        <div class="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">Gợi ý lệnh <span class="ml-1 normal-case font-medium tracking-normal">· ↑ ↓ để chọn · Enter để dùng</span></div>
                        <div id="suggestions-list" role="listbox" class="flex-1 overflow-y-auto p-1"></div>
                    </div>

                    <form id="chat-form" class="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:bg-white focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50 transition-all shadow-sm">
                        <button type="button" id="btn-commands-menu" class="w-9 h-9 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-colors shrink-0" title="Danh sách lệnh">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        </button>
                        <input type="text" id="chat-input" aria-autocomplete="list" aria-controls="suggestions-list" aria-expanded="false" class="flex-1 bg-transparent border-none px-2 py-2 focus:ring-0 focus:outline-none text-[14px] text-slate-700 placeholder-slate-400" placeholder="Hỏi trợ lý hoặc gõ / để xem lệnh..." autocomplete="off">
                        <button type="submit" id="btn-send-chat" class="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg class="w-4 h-4 translate-x-px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        </button>
                    </form>
                </div>
            `;
        } else {
            // Giữ nguyên bản cũ cho các nơi vẫn dùng dạng nổi (nếu có)
            this.container.innerHTML = `
                <!-- Nút bật tắt chat -->
                <button id="btn-toggle-chat" class="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-[0_10px_25px_rgba(99,102,241,0.5)] flex items-center justify-center text-white hover:scale-110 hover:shadow-[0_15px_35px_rgba(99,102,241,0.6)] transition-all duration-300 relative overflow-hidden group border-2 border-white/20 backdrop-blur-sm z-50">
                    <img src="assets/images/logo-ai.png" alt="AI Chat" class="w-12 h-12 object-contain relative z-10 drop-shadow-xl group-hover:rotate-12 transition-transform duration-300">
                </button>

                <!-- Cửa sổ Chat -->
                <div id="chat-window" class="hidden flex-col w-[calc(100vw-2rem)] max-w-96 h-[min(500px,80vh)] bg-white rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] border border-slate-100/50 mt-4 overflow-hidden origin-bottom-right transition-all absolute bottom-20 right-0 z-40">
                    
                    <div class="h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 flex items-center justify-between px-4 text-white relative overflow-hidden">
                        <div class="flex items-center gap-3 relative z-10">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shadow-inner relative">
                                <img src="assets/images/logo-ai.png" alt="AI" class="w-full h-full object-cover">
                            </div>
                            <div>
                                <div class="flex items-center gap-1.5">
                                    <span class="font-black text-[15px] tracking-wide text-white">Trợ lý BanHangAI</span>
                                </div>
                            </div>
                        </div>
                        <div id="bot-session" class="ml-auto mr-2 relative z-10 flex items-center gap-2"></div>
                        <button id="btn-meet-agent" type="button" class="px-2.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-[11px] font-bold text-white whitespace-nowrap">Gặp nhân viên</button>
                        <button id="btn-close-chat" aria-label="Đóng chat" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors relative z-10 backdrop-blur-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div id="chat-history" class="flex-1 overflow-y-auto p-5 space-y-5 bg-[#f8faff] text-sm">
                        <div class="flex gap-3">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-sm mt-0.5">
                                <img src="assets/images/logo-ai.png" alt="AI" class="w-full h-full object-cover">
                            </div>
                            <div class="bg-white px-4 py-2.5 rounded-2xl rounded-tl-sm border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-slate-700 leading-relaxed font-medium">
                                Chào bạn! Tôi là Trợ lý AI của cửa hàng. Bạn cần tìm sản phẩm gì ạ?
                            </div>
                        </div>
                    </div>

                    <div class="relative p-3 bg-white border-t border-slate-100">
                        <div id="chat-quick-actions" class="hidden mb-2 overflow-x-auto whitespace-nowrap"></div>
                        <div id="command-suggestions" class="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(15,23,42,0.22)] border border-slate-200 overflow-hidden hidden z-50 transition-all duration-200 translate-y-2 opacity-0 flex flex-col max-h-[280px]">
                            <div class="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">Lệnh phù hợp <span class="ml-1 normal-case font-medium tracking-normal">· ↑ ↓ để chọn · Enter để dùng</span></div>
                            <div id="suggestions-list" role="listbox" class="flex-1 overflow-y-auto p-1"></div>
                        </div>
                        <form id="chat-form" class="flex items-center gap-2">
                            <button type="button" id="btn-commands-menu" class="w-9 h-9 rounded-full text-slate-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors shrink-0" title="Xem lệnh có thể dùng" aria-label="Xem lệnh có thể dùng">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7"/></svg>
                            </button>
                            <input type="text" id="chat-input" aria-autocomplete="list" aria-controls="suggestions-list" aria-expanded="false" class="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-indigo-100 focus:outline-none text-sm text-slate-700" placeholder="Hỏi..." autocomplete="off">
                            <button type="submit" id="btn-send-chat" class="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors shrink-0">
                                <svg class="w-4 h-4 translate-x-px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </button>
                        </form>
                    </div>
                </div>
            `;
        }
    }

    bindToggleChat() {
        if (this.isEmbedded) return; // Embedded mode doesn't toggle
        
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

        if (btnToggle) btnToggle.addEventListener('click', toggle);
        if (btnClose) btnClose.addEventListener('click', toggle);
    }

    bindSendMessage(handler) {
        const form = this.container.querySelector('#chat-form');
        const input = this.container.querySelector('#chat-input');
        const attach = document.createElement('button');
        attach.type = 'button';
        attach.title = 'Gửi ảnh hóa đơn hoặc sản phẩm (JPG, PNG, WEBP; tối đa 5 MB)';
        attach.className = 'shrink-0 rounded-full px-2.5 py-2 text-xs font-bold text-slate-500 hover:bg-indigo-50 hover:text-indigo-600';
        attach.textContent = 'Ảnh';
        const picker = document.createElement('input');
        picker.type = 'file';
        picker.accept = 'image/jpeg,image/png,image/webp';
        picker.className = 'hidden';
        const selected = document.createElement('span');
        selected.className = 'hidden max-w-24 truncate text-[10px] text-indigo-600';
        form.insertBefore(attach, input);
        form.insertBefore(picker, input);
        form.insertBefore(selected, input);
        let attachment = null;
        attach.addEventListener('click', () => picker.click());
        picker.addEventListener('change', () => {
            const file = picker.files?.[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) {
                window.showToast?.('Ảnh không được vượt quá 5 MB.', 'error');
                picker.value = '';
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                window.showToast?.('Chỉ nhận ảnh JPG, PNG hoặc WEBP.', 'error');
                picker.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                attachment = { file, name: file.name };
                selected.textContent = file.name;
                selected.title = file.name;
                selected.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text && !attachment) return;
            handler(text || 'Hãy xem ảnh hóa đơn này giúp tôi.', attachment?.file || null);
            input.value = '';
            picker.value = '';
            selected.textContent = '';
            selected.classList.add('hidden');
            attachment = null;
        });
    }

    appendUserMessage(text, imageFile = null) {
        const history = this.container.querySelector('#chat-history');
        const wrapper = document.createElement('div');
        wrapper.className = 'flex gap-2 justify-end group';
        const bubble = document.createElement('div');
        bubble.className = 'bg-slate-800 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%] font-medium whitespace-pre-wrap break-words';
        if (text) {
            const message = document.createElement('div');
            message.textContent = text;
            bubble.appendChild(message);
        }
        if (imageFile instanceof Blob) {
            const imageUrl = URL.createObjectURL(imageFile);
            this.imagePreviewUrls.add(imageUrl);
            const image = document.createElement('img');
            image.src = imageUrl;
            image.alt = 'Ảnh đính kèm trong tin nhắn';
            image.loading = 'lazy';
            image.className = 'mt-2 block max-h-80 max-w-full cursor-zoom-in rounded-xl border border-white/20 object-contain';
            image.title = 'Bấm để mở ảnh kích thước đầy đủ';
            image.addEventListener('click', () => window.open(imageUrl, '_blank', 'noopener,noreferrer'));
            bubble.appendChild(image);
        }
        wrapper.appendChild(bubble);
        history.appendChild(wrapper);
        history.scrollTop = history.scrollHeight;
    }

    releaseImagePreviews() {
        this.imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
        this.imagePreviewUrls.clear();
    }

    appendAIBubble() {
        const history = this.container.querySelector('#chat-history');
        const wrapper = document.createElement('div');
        wrapper.className = 'flex gap-3 group';
        wrapper.innerHTML = `
            <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm mt-0.5 border border-indigo-200/50 p-1.5">
                <img src="assets/images/logo-ai.png" alt="AI" class="w-full h-full object-contain">
            </div>
            <div class="ai-content bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-200/80 shadow-sm text-slate-700 leading-relaxed font-medium min-h-[44px] max-w-[85%]">
                <span class="typing-dots flex gap-1 items-center mt-2 mb-2 px-1">
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

    /** Bảng màu theo nhóm lệnh (khớp COMMAND_GROUPS phía server). */
    static GROUP_STYLES = {
        basic: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
        account: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
        shop: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
        stock: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
        manage: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-100',
        action: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
    };

    /** Controller gọi để cung cấp nhóm/args của lệnh (tô màu chip & biết lệnh có cần tham số). */
    setCommandMeta(commands = []) {
        this.commandMeta = new Map();
        commands.forEach((cmd) => {
            [cmd.name, cmd.canonicalName, ...(cmd.aliases || [])].filter(Boolean)
                .forEach((name) => this.commandMeta.set(name, cmd));
        });
    }

    /** Đăng ký hành động khi bấm vào chip lệnh trong tin nhắn bot. */
    bindCommandChips(onClick) {
        const history = this.container.querySelector('#chat-history');
        history.addEventListener('click', (e) => {
            const chip = e.target.closest('[data-chip-cmd]');
            if (!chip) return;
            const name = chip.getAttribute('data-chip-cmd');
            onClick(name, this.commandMeta?.get(name));
        });
    }

    renderInline(text) {
        const codes = [];
        let html = text.replace(/`([^`\n]+)`/g, (_, code) => {
            codes.push(code);
            return `\u0000${codes.length - 1}\u0000`;
        });
        html = html
            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>')
            .replace(/~~(.+?)~~/g, '<del class="text-slate-400">$1</del>')
            .replace(/(^|\s)_([^_\n]+)_(?=\s|$|[.,;])/g, '$1<em class="text-slate-500">$2</em>');
        return html.replace(/\u0000(\d+)\u0000/g, (_, i) => {
            const code = codes[Number(i)];
            const cmd = /^\/([a-z]+)$/i.exec(code);
            if (cmd) {
                const group = this.commandMeta?.get(cmd[1].toLowerCase())?.group || 'basic';
                const style = ChatModule.GROUP_STYLES[group] || ChatModule.GROUP_STYLES.basic;
                return `<button type="button" data-chip-cmd="${cmd[1].toLowerCase()}" class="inline-flex items-center px-2 py-0.5 my-0.5 rounded-lg border text-[12px] font-bold font-mono transition-colors cursor-pointer ${style}">/${cmd[1]}</button>`;
            }
            return `<code class="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded text-[12px]">${code}</code>`;
        });
    }

    renderMarkdown(text) {
        // Escape các "thẻ" lạ như <mã đơn>, chỉ giữ lại thẻ HTML nội bộ dùng cho thông báo lỗi
        const safe = text.replace(/&(?![a-z]+;|#\d+;)/gi, '&amp;').replace(/<(?!\/?(span|br|code|strong)\b)/gi, '&lt;');
        const lines = safe.split('\n');
        const blocks = [];
        let paragraph = [];
        let list = [];
        let listType = '';

        const flushParagraph = () => {
            if (!paragraph.length) return;
            blocks.push(`<p class="my-1 leading-6">${paragraph.map((line) => this.renderInline(line)).join('<br>')}</p>`);
            paragraph = [];
        };
        const flushList = () => {
            if (!list.length) return;
            const tag = listType === 'ordered' ? 'ol' : 'ul';
            const marker = listType === 'ordered' ? 'list-decimal' : 'list-disc';
            blocks.push(`<${tag} class="my-2 pl-5 space-y-1 ${marker} marker:text-indigo-400">${list.map((item) => `<li class="pl-1 leading-6">${this.renderInline(item)}</li>`).join('')}</${tag}>`);
            list = [];
            listType = '';
        };

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                flushParagraph();
                flushList();
                continue;
            }

            const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
            if (heading) {
                flushParagraph();
                flushList();
                const size = heading[1].length === 1 ? 'text-base' : 'text-sm';
                blocks.push(`<h3 class="mt-3 mb-1 ${size} font-bold text-slate-900">${this.renderInline(heading[2])}</h3>`);
                continue;
            }

            const bullet = /^[-•*]\s+(.+)$/.exec(trimmed);
            const numbered = /^\d+[.)]\s+(.+)$/.exec(trimmed);
            if (bullet || numbered) {
                flushParagraph();
                const nextType = numbered ? 'ordered' : 'unordered';
                if (listType && listType !== nextType) flushList();
                listType = nextType;
                list.push((bullet || numbered)[1]);
                continue;
            }

            flushList();
            paragraph.push(trimmed);
        }
        flushParagraph();
        flushList();
        return blocks.join('');
    }

    /** Màu + nhãn theo vai trò cho badge phiên đăng nhập. */
    static ROLE_BADGES = {
        admin: { label: 'Quản trị viên', icon: '🛡️', cls: 'bg-rose-500/20 text-rose-300 border-rose-400/40' },
        owner: { label: 'Chủ cửa hàng', icon: '👑', cls: 'bg-amber-500/20 text-amber-300 border-amber-400/40' },
        staff: { label: 'Nhân viên', icon: '🧑‍💼', cls: 'bg-sky-500/20 text-sky-300 border-sky-400/40' },
        customer: { label: 'Khách hàng', icon: '🛍️', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' }
    };

    /** Hiển thị trạng thái đăng nhập & vai trò thường trực trên header. user = null => khách. */
    setSession(user, { onLogin, onLogout, onHandoff, onQuickAction } = {}) {
        const slot = this.container.querySelector('#bot-session');
        const input = this.container.querySelector('#chat-input');
        if (!slot) return;
        const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const commandFor = (name) => this.commandMeta?.get(name)?.name || name;

        if (!user) {
            slot.innerHTML = `
                <span class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/20 text-slate-300 border border-slate-400/30 text-[11px] font-bold">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Khách
                </span>
                <button type="button" data-session="handoff" class="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold transition-colors">Gặp nhân viên</button>`;
            if (input) input.placeholder = 'Hỏi về sản phẩm, giá hoặc chính sách...';
        } else {
            const badge = ChatModule.ROLE_BADGES[user.role] || { label: user.role, icon: '👤', cls: 'bg-slate-500/20 text-slate-200 border-slate-400/40' };
            slot.innerHTML = `
                <div class="flex flex-col items-end leading-tight">
                    <span class="text-[12px] font-bold text-white max-w-[140px] truncate" title="${esc(user.username)}">${esc(user.full_name || user.username)}</span>
                    <span class="mt-0.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${badge.cls}">${badge.icon} ${badge.label}</span>
                </div>
                <button type="button" data-session="logout" title="Đăng xuất" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-rose-500/80 text-slate-200 hover:text-white flex items-center justify-center transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                </button>`;
            if (input) input.placeholder = `Hỏi trợ lý (${badge.label}) hoặc gõ / để xem lệnh...`;
        }
        slot.querySelector('[data-session="login"]')?.addEventListener('click', () => onLogin?.(`/${commandFor('login')} `));
        slot.querySelector('[data-session="logout"]')?.addEventListener('click', () => onLogout?.(`/${commandFor('logout')}`));
        slot.querySelector('[data-session="handoff"]')?.addEventListener('click', () => onHandoff?.());
        this.container.querySelector('#btn-meet-agent')?.addEventListener('click', () => onHandoff?.());

        const suggestions = {
            guest: [
                { label: '🔎 Tìm sản phẩm', command: '/products ' },
                { label: '📜 Chính sách', command: '/policy ' },
                { label: '🔐 Đăng nhập', command: '/login' },
                { label: '👤 Tạo tài khoản', command: '/register' }
            ],
            customer: [
                { label: '🔎 Tìm sản phẩm', command: '/products ' },
                { label: '🛒 Đặt hàng', command: '/buy ' },
                { label: '📦 Đơn của tôi', command: '/orders' },
                { label: '↩️ Đổi trả / bảo hành', command: '/myreturns' },
                { label: 'Hủy đơn', command: '/cancelorder ' }
            ],
            staff: [
                { label: '🔎 Tìm sản phẩm', command: '/products ' },
                { label: '📦 Đơn hàng', command: '/orders' },
                { label: '⚠️ Sắp hết hàng', command: '/lowstock' },
                { label: '🕒 Chấm công', command: '/attendance' }
            ],
            owner: [
                { label: '📊 Báo cáo', command: '/report ' },
                { label: '⚠️ Sắp hết hàng', command: '/lowstock' },
                { label: '↩️ Phiếu đổi trả', command: '/returns' },
                { label: '📦 Đơn hàng', command: '/orders' }
            ],
            admin: [
                { label: '👥 Tài khoản', command: '/accounts' },
                { label: '🧾 Nhật ký', command: '/audit' },
                { label: '⚙️ Cấu hình AI', command: '/config ' },
                { label: '❔ Trợ giúp', command: '/help' }
            ]
        };
        const actions = (suggestions[user?.role || 'guest'] || []).filter((action) => {
            const commandName = action.command.trim().split(/\s+/)[0].slice(1);
            return this.commandMeta?.has(commandName);
        }).map((action) => {
            const [command, ...rest] = action.command.trimEnd().split(/\s+/);
            const commandMeta = this.commandMeta?.get(command.slice(1));
            return { ...action, command: `/${commandMeta?.name || command.slice(1)}${action.command.endsWith(' ') ? ' ' : ''}${rest.join(' ')}`.trimEnd() + (action.command.endsWith(' ') ? ' ' : '') };
        });
        this.renderQuickActions(actions, onQuickAction);
    }

    renderQuickActions(actions = [], onQuickAction) {
        const quickActions = this.container.querySelector('#chat-quick-actions');
        if (!quickActions) return;
        if (!actions.length) {
            quickActions.classList.add('hidden');
            quickActions.replaceChildren();
            return;
        }

        const esc = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        quickActions.innerHTML = `<div class="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Gợi ý tiếp theo</div><div class="flex gap-2 pb-1">${actions.map((action, index) => `<button type="button" data-quick-action="${index}" class="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200">${esc(action.label)}</button>`).join('')}</div>`;
        quickActions.classList.remove('hidden');
        quickActions.querySelectorAll('[data-quick-action]').forEach((button) => {
            button.addEventListener('click', () => {
                const action = actions[Number(button.dataset.quickAction)];
                const value = action.command || action.message || '';
                if (action.needsInput || value.endsWith(' ')) onQuickAction?.(value, true);
                else onQuickAction?.(value, false);
            });
        });
    }

    updateBubbleText(bubbleEl, text, isRawHtml = false) {
        bubbleEl.innerHTML = isRawHtml ? text : this.renderMarkdown(text);
        const history = this.container.querySelector('#chat-history');
        history.scrollTop = history.scrollHeight;
    }

    appendImageToBubble(bubbleEl, src, alt = 'Ảnh đính kèm') {
        if (!bubbleEl || typeof src !== 'string' || !src.trim()) return;
        let finalSrc = src.trim();
        const isInvoice = finalSrc.startsWith('/api/bot/orders/');
        if (isInvoice) {
            const token = localStorage.getItem('bot_token');
            finalSrc = token && !finalSrc.includes('token=') ? `${finalSrc}${finalSrc.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : finalSrc;
        }
        if (!finalSrc.startsWith('http://') && !finalSrc.startsWith('https://') && !finalSrc.startsWith('blob:') && !finalSrc.startsWith('data:')) {
            const backendOrigin = (window.location.port && window.location.port !== '5000') ? 'http://localhost:5000' : '';
            finalSrc = `${backendOrigin}${finalSrc.startsWith('/') ? '' : '/'}${finalSrc}`;
        }
        const wrapper = document.createElement('div');
        wrapper.className = 'mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm max-w-[560px]';
        const image = document.createElement('img');
        image.src = finalSrc;
        image.alt = alt;
        image.loading = 'lazy';
        image.className = 'block max-h-80 w-auto max-w-full cursor-zoom-in rounded-xl object-contain';
        image.title = 'Bấm để mở ảnh kích thước đầy đủ';
        image.addEventListener('click', () => window.open(finalSrc, '_blank', 'noopener,noreferrer'));
        image.addEventListener('error', () => {
            wrapper.innerHTML = `<div class="p-3 text-xs text-indigo-700 bg-indigo-50 flex items-center justify-between gap-2">
                <span>⚠️ ${isInvoice ? 'Không thể hiển thị trước ảnh hóa đơn.' : 'Không thể hiển thị ảnh đính kèm.'}</span>
                <a href="${finalSrc}" target="_blank" rel="noopener noreferrer" class="font-bold underline text-indigo-800 shrink-0">${isInvoice ? 'Mở xem hóa đơn' : 'Mở xem ảnh'}</a>
            </div>`;
        }, { once: true });
        wrapper.appendChild(image);
        bubbleEl.appendChild(wrapper);
        const history = this.container.querySelector('#chat-history');
        if (history) history.scrollTop = history.scrollHeight;
    }

    appendPendingAction(action, onConfirm, onCancel) {
        const history = this.container.querySelector('#chat-history');
        const card = document.createElement('section');
        card.className = 'mx-11 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-slate-700';
        const title = document.createElement('p');
        title.className = 'mb-2 font-bold text-amber-900';
        title.textContent = 'Vui lòng xem lại trước khi xác nhận';
        const summary = document.createElement('pre');
        summary.className = 'whitespace-pre-wrap break-words font-sans text-xs leading-5';
        summary.textContent = action.summary || 'Thao tác đang chờ xác nhận.';
        const buttons = document.createElement('div');
        buttons.className = 'mt-3 flex gap-2';
        const confirm = document.createElement('button');
        confirm.type = 'button';
        confirm.className = 'rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50';
        confirm.textContent = 'Xác nhận';
        const cancel = document.createElement('button');
        cancel.type = 'button';
        cancel.className = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50';
        cancel.textContent = 'Hủy';
        confirm.addEventListener('click', () => onConfirm(action.id, card, confirm, cancel));
        cancel.addEventListener('click', () => onCancel(action.id, card, confirm, cancel));
        buttons.append(confirm, cancel);
        card.append(title, summary, buttons);
        history.append(card);
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

    clearHistory() {
        this.releaseImagePreviews();
        const history = this.container.querySelector('#chat-history');
        if (history) {
            history.innerHTML = '';
        }
    }

    // --- Command Suggestions ---
    bindInputEvents(onInput) {
        const input = this.container.querySelector('#chat-input');
        input.addEventListener('input', (e) => onInput(e.target.value));
        input.addEventListener('keydown', (e) => {
            const items = [...this.container.querySelectorAll('.suggestion-item')];
            const isOpen = !this.container.querySelector('#command-suggestions')?.classList.contains('hidden');
            if (!isOpen || !items.length) {
                if (e.key === 'Escape') this.hideSuggestions();
                return;
            }

            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const direction = e.key === 'ArrowDown' ? 1 : -1;
                this.activeSuggestionIndex = this.activeSuggestionIndex < 0
                    ? (direction > 0 ? 0 : items.length - 1)
                    : (this.activeSuggestionIndex + direction + items.length) % items.length;
                this.updateActiveSuggestion(items);
            } else if (e.key === 'Enter' && this.activeSuggestionIndex >= 0) {
                e.preventDefault();
                items[this.activeSuggestionIndex].click();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                items[0].click();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.hideSuggestions();
            }
        });
        
        const btnMenu = this.container.querySelector('#btn-commands-menu');
        if (btnMenu) {
            btnMenu.addEventListener('click', () => {
                onInput('/'); // trigger showing all commands
                input.focus();
                input.value = '/';
            });
        }
        
        // Hide when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.container.querySelector('#chat-form').contains(e.target) && 
                !this.container.querySelector('#command-suggestions').contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }

    renderSuggestions(commands, onSelect) {
        const container = this.container.querySelector('#command-suggestions');
        const list = this.container.querySelector('#suggestions-list');
        if (!container || !list) return;
        
        if (!commands || commands.length === 0) {
            this.hideSuggestions();
            return;
        }

        const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        this.activeSuggestionIndex = -1;
        list.innerHTML = commands.map((cmd, index) => {
            const style = ChatModule.GROUP_STYLES[cmd.group] || ChatModule.GROUP_STYLES.basic;
            return `
            <button type="button" role="option" aria-selected="false" id="command-option-${index}" class="suggestion-item w-full px-2.5 py-2 cursor-pointer text-left hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-3" data-cmd="/${cmd.name}">
                <span class="shrink-0 px-2.5 py-1 rounded-lg border text-[12px] font-bold font-mono ${style}">/${cmd.name}</span>
                <span class="flex-1 min-w-0">
                    <span class="block truncate text-xs font-medium text-slate-700">${esc(cmd.desc)}</span>
                    ${cmd.args ? `<span class="block mt-0.5 truncate text-[10px] font-mono text-slate-400">${esc(cmd.args)}</span>` : ''}
                </span>
                <span class="shrink-0 text-[10px] text-slate-300">↵</span>
            </button>`;
        }).join('');

        list.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const cmd = item.getAttribute('data-cmd');
                onSelect(cmd);
                this.hideSuggestions();
            });
        });

        clearTimeout(this.suggestionHideTimer);
        this.container.querySelector('#chat-input')?.setAttribute('aria-expanded', 'true');
        container.classList.remove('hidden');
        // Small delay to allow display block before opacity transition
        setTimeout(() => {
            container.classList.remove('translate-y-2', 'opacity-0');
        }, 10);
    }

    updateActiveSuggestion(items = [...this.container.querySelectorAll('.suggestion-item')]) {
        items.forEach((item, index) => {
            const active = index === this.activeSuggestionIndex;
            item.setAttribute('aria-selected', String(active));
            item.classList.toggle('bg-indigo-50', active);
            item.classList.toggle('ring-1', active);
            item.classList.toggle('ring-indigo-100', active);
        });
        const activeItem = items[this.activeSuggestionIndex];
        const input = this.container.querySelector('#chat-input');
        if (activeItem) input?.setAttribute('aria-activedescendant', activeItem.id);
        else input?.removeAttribute('aria-activedescendant');
        items[this.activeSuggestionIndex]?.scrollIntoView({ block: 'nearest' });
    }

    hideSuggestions() {
        const container = this.container.querySelector('#command-suggestions');
        if (!container) return;
        this.container.querySelector('#chat-input')?.setAttribute('aria-expanded', 'false');
        this.container.querySelector('#chat-input')?.removeAttribute('aria-activedescendant');
        container.classList.add('translate-y-2', 'opacity-0');
        clearTimeout(this.suggestionHideTimer);
        this.suggestionHideTimer = setTimeout(() => {
            container.classList.add('hidden');
        }, 200);
    }

    setInput(text) {
        const input = this.container.querySelector('#chat-input');
        input.value = text;
        input.focus();
    }
}
