export default class InternalChatModule {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'internal-chat-module';
        // Positioned slightly above the AI chat
        this.container.className = 'fixed bottom-28 right-6 z-40 flex flex-col items-end';
        
        this.isOpen = false;
        
        this.render();
        document.body.appendChild(this.container);
    }

    render() {
        this.container.innerHTML = `
            <!-- Nút bật tắt chat nội bộ -->
            <button id="btn-toggle-team-chat" class="w-14 h-14 rounded-full bg-emerald-500 shadow-[0_5px_15px_rgba(16,185,129,0.4)] flex items-center justify-center text-white hover:scale-110 hover:shadow-[0_10px_25px_rgba(16,185,129,0.5)] transition-all duration-300 relative border-2 border-white/20">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
            </button>

            <!-- Cửa sổ Team Chat -->
            <div id="team-chat-window" class="hidden flex-row w-[500px] max-w-[90vw] h-[400px] max-h-[70vh] bg-white rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] border border-slate-100/50 mt-4 overflow-hidden absolute bottom-16 right-0 z-40">
                
                <!-- Sidebar Danh sách người dùng -->
                <div class="w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col">
                    <div class="p-3 font-semibold text-slate-700 border-b border-slate-200 bg-white">Team Chat</div>
                    <div id="chat-user-list" class="flex-1 overflow-y-auto">
                        <!-- Render users here -->
                    </div>
                </div>

                <!-- Chat Area -->
                <div class="flex-1 flex flex-col relative bg-white">
                    <div id="team-chat-header" class="h-12 bg-emerald-50 border-b border-slate-200 flex items-center justify-between px-4 text-emerald-800 font-medium hidden">
                        <span id="active-chat-name">Chọn người chat</span>
                    </div>

                    <div id="team-chat-history" class="flex-1 overflow-y-auto p-4 space-y-3 bg-white text-sm hidden">
                        <!-- Messages go here -->
                    </div>
                    
                    <div id="team-chat-empty" class="flex-1 flex items-center justify-center text-slate-400 text-sm">
                        Chọn một người để bắt đầu
                    </div>

                    <!-- Input area -->
                    <div class="p-3 bg-white border-t border-slate-100 hidden" id="team-chat-input-area">
                        <form id="team-chat-form" class="flex items-center gap-2">
                            <input type="text" id="team-chat-input" class="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm" placeholder="Nhập tin nhắn..." autocomplete="off">
                            <button type="submit" class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors shrink-0">
                                <svg class="w-4 h-4 translate-x-px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
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
        list.innerHTML = users.map(u => {
            const displayName = u.full_name || u.username || 'User';
            return `
            <div class="chat-user-item p-3 border-b border-slate-100 cursor-pointer hover:bg-emerald-50 transition-colors flex items-center gap-2" data-id="${u.id}" data-name="${displayName}">
                <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-xs shrink-0 uppercase">
                    ${displayName.charAt(0)}
                </div>
                <div class="min-w-0 flex-1">
                    <div class="text-sm font-medium text-slate-800 truncate">${displayName}</div>
                    <div class="text-[10px] text-slate-500 uppercase">${u.role}</div>
                </div>
            </div>
        `}).join('');

        list.querySelectorAll('.chat-user-item').forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class
                list.querySelectorAll('.chat-user-item').forEach(el => el.classList.remove('bg-emerald-100'));
                item.classList.add('bg-emerald-100');
                
                const id = item.dataset.id;
                const name = item.dataset.name;
                onUserClick(id, name);
            });
        });
    }

    openChatWith(name) {
        this.container.querySelector('#team-chat-empty').classList.add('hidden');
        this.container.querySelector('#team-chat-header').classList.remove('hidden');
        this.container.querySelector('#team-chat-history').classList.remove('hidden');
        this.container.querySelector('#team-chat-input-area').classList.remove('hidden');
        this.container.querySelector('#active-chat-name').textContent = `Chat với: ${name}`;
        this.container.querySelector('#team-chat-history').innerHTML = ''; // Clear history
    }

    renderMessages(messages, currentUserId) {
        const history = this.container.querySelector('#team-chat-history');
        history.innerHTML = messages.map(m => {
            const isMe = m.sender_id === currentUserId;
            let timeString = '';
            if (m.created_at) {
                let dateStr = m.created_at;
                if (!dateStr.includes('Z') && !dateStr.includes('+')) {
                    dateStr = dateStr.replace(' ', 'T') + 'Z';
                }
                timeString = new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            }
            return `
                <div class="flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'} mb-2">
                    <div class="${isMe ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-800'} px-3 py-2 rounded-2xl ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'} shadow-sm max-w-[85%]">
                        ${m.content}
                    </div>
                    ${timeString ? `<span class="text-[10px] text-slate-400 px-1">${timeString}</span>` : ''}
                </div>
            `;
        }).join('');
        history.scrollTop = history.scrollHeight;
    }

    appendMessage(message, isMe = true, createdAt = new Date()) {
        const history = this.container.querySelector('#team-chat-history');
        let timeString = '';
        if (createdAt) {
            let dateStr = typeof createdAt === 'string' ? createdAt : createdAt.toISOString();
            if (!dateStr.includes('Z') && !dateStr.includes('+')) {
                dateStr = dateStr.replace(' ', 'T') + 'Z';
            }
            timeString = new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }
        const msgHtml = `
            <div class="flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'} mb-2">
                <div class="${isMe ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-800'} px-3 py-2 rounded-2xl ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'} shadow-sm max-w-[85%]">
                    ${message}
                </div>
                ${timeString ? `<span class="text-[10px] text-slate-400 px-1">${timeString}</span>` : ''}
            </div>
        `;
        history.insertAdjacentHTML('beforeend', msgHtml);
        history.scrollTop = history.scrollHeight;
    }

    bindSendMessage(handler) {
        const form = this.container.querySelector('#team-chat-form');
        const input = this.container.querySelector('#team-chat-input');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;
            handler(text);
            input.value = '';
        });
    }
}
