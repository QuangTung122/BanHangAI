export default class InternalChatModule {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'internal-chat-module';
        // Positioned at bottom right
        this.container.className = 'fixed bottom-6 right-6 z-40 flex flex-col items-end';
        
        this.isOpen = false;
        
        this.render();
        document.body.appendChild(this.container);
    }

    render() {
        this.container.innerHTML = `
            <!-- Nút bật tắt chat nội bộ -->
            <button id="btn-toggle-team-chat" class="w-13 h-13 rounded-2xl bg-[#5745f5] shadow-lg shadow-[#5745f5]/30 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-white/40">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
            </button>

            <!-- Cửa sổ Team Chat -->
            <div id="team-chat-window" class="hidden flex-row w-[520px] max-w-[92vw] h-[440px] max-h-[75vh] bg-white rounded-2xl shadow-2xl border border-[#e7eaf2] mt-3 overflow-hidden absolute bottom-16 right-0 z-40">
                
                <!-- Sidebar Danh sách người dùng -->
                <div class="w-[180px] bg-[#fafbfd] border-r border-[#e7eaf2] flex flex-col">
                    <div class="p-3.5 font-black text-xs text-[#182033] border-b border-[#e7eaf2] bg-white flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>Team Chat</span>
                    </div>
                    <div id="chat-user-list" class="flex-1 overflow-y-auto">
                        <!-- Render users here -->
                    </div>
                </div>

                <!-- Chat Area -->
                <div class="flex-1 flex flex-col relative bg-white">
                    <div id="team-chat-header" class="h-12 bg-[#fafbfd] border-b border-[#e7eaf2] flex items-center justify-between px-4 text-[#182033] font-bold text-xs hidden">
                        <span id="active-chat-name">Chọn người chat</span>
                    </div>

                    <div id="team-chat-history" class="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafbfd] text-xs hidden">
                        <!-- Messages go here -->
                    </div>
                    
                    <div id="team-chat-empty" class="flex-1 flex flex-col items-center justify-center text-[#7b8499] text-xs p-4 text-center">
                        <div class="w-10 h-10 rounded-xl bg-[#f0edff] text-[#5745f5] flex items-center justify-center font-bold mb-2">💬</div>
                        <span>Chọn đồng nghiệp để bắt đầu trao đổi nội bộ</span>
                    </div>

                    <!-- Input area -->
                    <div class="p-3 bg-white border-t border-[#e7eaf2] hidden" id="team-chat-input-area">
                        <form id="team-chat-form" class="flex items-center gap-2">
                            <label class="w-8 h-8 rounded-xl bg-[#f5f6fa] border border-[#e7eaf2] text-[#7b8499] flex items-center justify-center cursor-pointer hover:bg-[#f0edff] hover:text-[#5745f5] transition-colors" title="Gửi ảnh">
                                <input type="file" id="team-chat-image" accept="image/jpeg,image/png,image/webp" class="hidden">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" stroke-width="2"/><path stroke-width="2" d="m21 15-5-5L5 21"/></svg>
                            </label>
                            <input type="text" id="team-chat-input" class="flex-1 min-w-0 bg-[#f5f6fa] border border-[#e7eaf2] rounded-xl px-3.5 py-1.5 focus:bg-white focus:outline-none focus:border-[#5745f5] text-xs text-[#182033] placeholder-[#7b8499]" placeholder="Nhập tin nhắn..." autocomplete="off">
                            <button type="submit" class="w-8 h-8 rounded-xl bg-[#5745f5] text-white flex items-center justify-center hover:bg-[#4736e8] transition-colors shrink-0 shadow-sm shadow-[#5745f5]/20 cursor-pointer">
                                <svg class="w-3.5 h-3.5 translate-x-px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    bindToggleChat() {
        const btnToggle = this.container.querySelector('#btn-toggle-team-chat');
        const chatWindow = this.container.querySelector('#team-chat-window');

        btnToggle.addEventListener('click', () => {
            this.isOpen = !this.isOpen;
            if (this.isOpen) {
                chatWindow.classList.remove('hidden');
                chatWindow.classList.add('flex');
            } else {
                chatWindow.classList.add('hidden');
                chatWindow.classList.remove('flex');
            }
        });
    }

    renderUserList(users, onUserClick) {
        const list = this.container.querySelector('#chat-user-list');
        list.replaceChildren();
        users.forEach((user) => {
            const name = user.full_name || user.username || 'User';
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'chat-user-item w-full text-left p-2.5 border-b border-[#e7eaf2] cursor-pointer hover:bg-[#f0edff] transition-colors flex items-center gap-2';
            const avatar = document.createElement('div');
            avatar.className = 'w-7 h-7 rounded-lg bg-[#f0edff] text-[#5745f5] font-black flex items-center justify-center text-[11px] shrink-0 uppercase';
            avatar.textContent = name.charAt(0);
            const details = document.createElement('div');
            details.className = 'min-w-0 flex-1';
            const nameNode = document.createElement('div');
            nameNode.className = 'text-xs font-bold text-[#182033] truncate';
            nameNode.textContent = name;
            const roleNode = document.createElement('div');
            roleNode.className = 'text-[10px] text-[#7b8499] uppercase';
            roleNode.textContent = user.role === 'all' ? 'Thông báo chung' : user.role;
            details.append(nameNode, roleNode);
            item.append(avatar, details);
            item.addEventListener('click', () => {
                list.querySelectorAll('.chat-user-item').forEach(el => el.classList.remove('bg-[#f0edff]'));
                item.classList.add('bg-[#f0edff]');
                onUserClick(user.id, name);
            });
            list.appendChild(item);
        });
    }

    openChatWith(name) {
        this.container.querySelector('#team-chat-empty').classList.add('hidden');
        this.container.querySelector('#team-chat-header').classList.remove('hidden');
        this.container.querySelector('#team-chat-history').classList.remove('hidden');
        this.container.querySelector('#team-chat-input-area').classList.remove('hidden');
        this.container.querySelector('#active-chat-name').textContent = name === 'Toàn hệ thống' ? 'Thông báo toàn hệ thống' : `Chat với: ${name}`;
        this.container.querySelector('#team-chat-history').innerHTML = ''; // Clear history
    }

    renderMessages(messages, currentUserId) {
        const history = this.container.querySelector('#team-chat-history');
        history.replaceChildren();
        messages.forEach((message) => history.appendChild(this.createMessageNode(message, message.sender_id === currentUserId)));
        history.scrollTop = history.scrollHeight;
    }

    createMessageNode(message, isMe = false) {
        const wrapper = document.createElement('div');
        wrapper.className = `flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'} mb-2`;
        const bubble = document.createElement('div');
        bubble.className = `${isMe ? 'bg-[#5745f5] text-white' : 'bg-white border border-[#e7eaf2] text-[#182033]'} px-3 py-2 rounded-2xl ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'} shadow-sm max-w-[85%] break-words`;
        if (message.sender_name && !isMe) {
            const sender = document.createElement('div');
            sender.className = 'text-[10px] font-bold opacity-75 mb-1';
            sender.textContent = message.sender_name;
            bubble.appendChild(sender);
        }
        if (message.content) {
            const text = document.createElement('div');
            text.textContent = message.content;
            bubble.appendChild(text);
        }
        if (message.image_url) {
            const image = document.createElement('img');
            image.src = message.image_url;
            image.alt = 'Ảnh đính kèm trong chat';
            image.loading = 'lazy';
            image.className = 'mt-1 max-w-full max-h-52 rounded-xl object-contain border border-black/10';
            bubble.appendChild(image);
        }
        wrapper.appendChild(bubble);
        if (message.created_at) {
            let dateStr = message.created_at;
            if (!dateStr.includes('Z') && !dateStr.includes('+')) dateStr = dateStr.replace(' ', 'T') + 'Z';
            const time = document.createElement('span');
            time.className = 'text-[10px] text-[#7b8499] px-1 font-mono';
            time.textContent = new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            wrapper.appendChild(time);
        }
        return wrapper;
    }

    appendMessage(message, isMe = true) {
        const history = this.container.querySelector('#team-chat-history');
        history.appendChild(this.createMessageNode(message, isMe));
        history.scrollTop = history.scrollHeight;
    }

    bindSendMessage(handler) {
        const form = this.container.querySelector('#team-chat-form');
        const input = this.container.querySelector('#team-chat-input');
        const imageInput = this.container.querySelector('#team-chat-image');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input.value.trim();
            const image = imageInput.files?.[0] || null;
            if (!text && !image) return;
            handler(text, image);
            input.value = '';
            imageInput.value = '';
        });
    }
}
