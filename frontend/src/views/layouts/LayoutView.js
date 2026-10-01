export default class LayoutView {
    constructor() {
        this.appRoot = document.getElementById('app-root');
        this.container = null;
    }

    render(user) {
        if (this.container) return;
        
        this.container = document.createElement('div');
        // Theme: Chuẩn hóa Clean Modern Business SaaS (Nền sáng làm việc rõ nét, Sidebar tối tinh tế)
        this.container.className = 'flex h-screen w-full bg-slate-100 overflow-hidden font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white';
        this.container.id = 'layout-container';

        this.container.innerHTML = `
            ${this._renderSidebar(user)}
            ${this._renderMainWorkspace(user)}
            <!-- Global Toast Container -->
            <div id="toast-container" class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"></div>
        `;

        this.appRoot.appendChild(this.container);
    }

    _renderSidebar(user) {
        const sidebarMenu = this.getSidebarMenu(user.role);
        
        return `
            <!-- Sidebar Dark Card -->
            <aside class="w-[260px] bg-slate-900 text-white m-3 mr-0 rounded-[20px] shadow-xl flex flex-col shrink-0 relative z-20 border border-slate-800 overflow-hidden">
                <!-- Logo -->
                <div class="h-20 flex items-center px-6 border-b border-slate-800 shrink-0">
                    <img src="assets/images/logo-system.png" alt="BanHangAI Logo" class="w-10 h-10 object-contain drop-shadow-md mr-3 shrink-0 rounded-lg">
                    <div class="flex flex-col justify-center">
                        <span class="font-black text-[16px] tracking-tight text-white leading-tight">HTH Smart Sales</span>
                        <span class="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Smarter Sales POS</span>
                    </div>
                </div>
                
                <!-- Menu -->
                <nav class="flex-1 overflow-y-auto py-5 px-3 space-y-1 scroll-smooth custom-scrollbar" id="sidebar-nav">
                    ${sidebarMenu}
                </nav>

                <!-- Mini Music Player -->
                <div class="p-3.5 border-t border-slate-800 bg-slate-950/60">
                    <div class="flex items-center gap-2">
                        <button id="btn-play-music" class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-500 text-slate-200 transition-colors shrink-0">
                            <svg id="icon-play" class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            <svg id="icon-pause" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        </button>
                        <div class="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer" id="music-progress-container">
                            <div id="music-progress-bar" class="w-0 h-full bg-indigo-500 transition-all duration-100"></div>
                        </div>
                        <span id="music-time" class="text-[10px] font-bold text-slate-400 w-8 text-right">0:00</span>
                    </div>
                    <audio id="sys-audio-player" loop></audio>
                </div>
            </aside>
        `;
    }

    _renderMainWorkspace(user) {
        return `
            <main class="flex-1 flex flex-col h-full overflow-hidden relative z-10 bg-slate-100 text-slate-800">
                <!-- Top Navbar: Trắng sáng, viền sắc nét, chữ đen đậm tương phản cao -->
                <header class="h-20 bg-white border-b border-slate-200/90 shadow-sm flex items-center justify-between px-8 shrink-0 relative z-30">
                    <div>
                        <div class="font-black text-slate-900 text-2xl tracking-tight" id="topbar-title">Bảng điều khiển</div>
                        <div class="text-xs text-slate-600 font-semibold mt-0.5">Hệ thống quản trị bán hàng & chuỗi cửa hàng</div>
                    </div>
                    
                    <div class="flex items-center gap-4">
                        <!-- Notifications -->
                        <div class="relative">
                            <button id="btn-notifications" class="relative p-2.5 text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 rounded-xl shadow-sm border border-slate-200 transition-colors" title="Thông báo">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span id="notification-badge" class="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-black flex items-center justify-center rounded-full hidden border-2 border-white">0</span>
                            </button>
                            
                            <div id="notification-dropdown" class="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border border-slate-200 hidden z-50 overflow-hidden">
                                <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                    <h3 class="font-black text-slate-900 text-sm">Thông báo hệ thống</h3>
                                    <button id="btn-mark-all-read" class="text-xs text-indigo-600 font-bold hidden hover:underline">Đã đọc tất cả</button>
                                </div>
                                <div id="notification-list" class="max-h-96 overflow-y-auto divide-y divide-slate-100">
                                    <div class="p-8 text-center text-slate-500 font-medium text-sm">Đang tải thông báo...</div>
                                </div>
                            </div>
                        </div>

                        <div class="w-px h-7 bg-slate-200"></div>
                        
                        <!-- User Profile -->
                        <div class="flex items-center gap-3">
                            <div class="text-right hidden sm:block">
                                <div class="text-sm font-black text-slate-900 leading-tight">${user.full_name || user.username}</div>
                                <div class="inline-block px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">${user.role}</div>
                            </div>
                            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-sm text-sm">
                                ${(user.full_name || user.username).charAt(0).toUpperCase()}
                            </div>
                        </div>
                        
                        <!-- Logout -->
                        <button id="btn-logout" class="text-slate-500 hover:text-rose-600 p-2.5 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors" title="Đăng xuất">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        </button>
                    </div>
                </header>
                
                <!-- Dynamic Content Area -->
                <div id="content-area" class="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth relative z-0 bg-slate-100 text-slate-800">
                    <!-- Child views will be injected here -->
                </div>
            </main>
        `;
    }

    bindAttendanceEvents(onCheckIn, onCheckOut) {
        const btnCheckin = document.getElementById('btn-checkin');
        const btnCheckout = document.getElementById('btn-checkout');
        if (btnCheckin) btnCheckin.addEventListener('click', onCheckIn);
        if (btnCheckout) btnCheckout.addEventListener('click', onCheckOut);
    }

    getSidebarMenu(role) {
        const menus = [];
        
        if (role === 'admin') {
            menus.push({ id: 'menu-admin-accounts', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', text: 'Quản lý tài khoản' });
            menus.push({ id: 'menu-admin-system', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', text: 'Thiết lập hệ thống' });
            menus.push({ id: 'menu-admin-audit', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', text: 'Nhật ký hoạt động' });
            menus.push({ id: 'menu-admin-return-warranty', icon: 'M8 7h12m-12 5h12M8 17h12M4 7h.01M4 12h.01M4 17h.01', text: 'Duyệt đổi trả & bảo hành' });
        } else if (role === 'owner') {
            menus.push({ id: 'menu-owner-dashboard', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z', text: 'Thống kê & Biểu đồ' });
            menus.push({ id: 'menu-owner-cashflow', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Quản lý dòng tiền' });
            menus.push({ id: 'menu-owner-products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', text: 'Quản lý sản phẩm' });
            menus.push({ id: 'menu-owner-staff', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', text: 'Quản lý nhân sự' });
            menus.push({ id: 'menu-owner-return-warranty', icon: 'M8 7h12m-12 5h12M8 17h12M4 7h.01M4 12h.01M4 17h.01', text: 'Duyệt đổi trả & bảo hành' });
        } else if (role === 'staff') {
            menus.push({ id: 'menu-staff-pos', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', text: 'Lập hóa đơn (POS)' });
            menus.push({ id: 'menu-staff-inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', text: 'Tra cứu tồn kho' });
            menus.push({ id: 'menu-staff-orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', text: 'Lịch sử hóa đơn' });
            menus.push({ id: 'menu-staff-installment', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z', text: 'Quản lý trả góp' });
            menus.push({ id: 'menu-staff-return-warranty', icon: 'M8 7h12m-12 5h12M8 17h12M4 7h.01M4 12h.01M4 17h.01', text: 'Đổi trả & Bảo hành' });
            menus.push({ id: 'menu-staff-attendance', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Chấm công của tôi' });
        }
        
        if (role === 'staff' || role === 'owner') {
            menus.push({ id: 'menu-settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', text: 'Cài đặt cá nhân' });
        }

        return menus.map(m => `
            <a href="#${m.id}" id="${m.id}" class="sidebar-item flex items-center px-3.5 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200 mb-1">
                <svg class="w-5 h-5 mr-3 shrink-0 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${m.icon}"/>
                </svg>
                ${m.text}
            </a>
        `).join('');
    }

    setActiveMenu(menuId, title) {
        // Xóa trạng thái active cũ
        this.container.querySelectorAll('.sidebar-item').forEach(el => {
            el.classList.remove('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-500/20', 'font-black');
            el.classList.add('text-slate-300', 'hover:text-white', 'hover:bg-slate-800', 'font-bold');
            const icon = el.querySelector('svg');
            if (icon) {
                icon.classList.remove('text-white');
                icon.classList.add('text-slate-400');
            }
        });
        
        // Gắn trạng thái active mới
        const activeEl = document.getElementById(menuId);
        if (activeEl) {
            activeEl.classList.remove('text-slate-300', 'hover:text-white', 'hover:bg-slate-800');
            activeEl.classList.add('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-500/20', 'font-black');
            const icon = activeEl.querySelector('svg');
            if (icon) {
                icon.classList.remove('text-slate-400');
                icon.classList.add('text-white');
            }
        }

        // Đổi tiêu đề Topbar
        const titleEl = document.getElementById('topbar-title');
        if (titleEl) titleEl.innerText = title;
    }

    bindLogout(handler) {
        const btn = document.getElementById('btn-logout');
        if(btn) btn.addEventListener('click', handler);
    }

    bindMenuClick(handler) {
        this.container.querySelectorAll('.sidebar-item').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                handler(el.id, el.innerText.trim());
            });
        });
    }
}
