import LayoutView from '../views/layouts/LayoutView.js';
import AuthModel from '../models/AuthModel.js';
import ChatController from './ChatController.js';

export default class LayoutController {
    constructor() {
        this.authModel = new AuthModel();
        this.view = new LayoutView();
        this.chatController = null;
        
        this.init();
    }

    init() {
        const user = this.authModel.user;
        if (!user) return; // Bảo vệ

        // Render bộ khung giao diện
        this.view.render(user);

        // Khởi tạo Chat Module (Hiển thị cục chat ở góc dưới)
        this.chatController = new ChatController();

        // Khởi tạo Internal Team Chat (Góc phải dưới, cạnh nút chuông/chat)
        import('./InternalChatController.js').then(module => {
            const InternalChatController = module.default;
            this.internalChatController = new InternalChatController();
        }).catch(err => console.error("Không thể tải Internal Chat", err));

        // Gắn sự kiện đăng xuất
        this.view.bindLogout(() => {
            this.authModel.logout();
            window.dispatchEvent(new Event('auth-logout'));
        });

        // Gán sự kiện click menu
        this.view.bindMenuClick((menuId, title) => {
            this.navigate(menuId, title);
        });

        // Khởi tạo trang mặc định dựa trên Role
        this.loadDefaultPage(user.role);

        // Khởi tạo Music Player
        this.initMusicPlayer();
        
        // Khởi tạo Global Toast Notification
        this.initToastSystem();

        // Khởi tạo Notification Bell & Dropdown
        this.initNotificationSystem();
    }

    async initNotificationSystem() {
        try {
            const { default: NotificationModel } = await import('../models/NotificationModel.js');
            this.notiModel = new NotificationModel();
            
            const btnBell = document.getElementById('btn-notifications');
            const dropdown = document.getElementById('notification-dropdown');
            const badge = document.getElementById('notification-badge');
            const list = document.getElementById('notification-list');
            const btnMarkAll = document.getElementById('btn-mark-all-read');

            if (!btnBell || !dropdown) return;

            // Toggle Dropdown
            btnBell.addEventListener('click', () => {
                dropdown.classList.toggle('hidden');
                if (!dropdown.classList.contains('hidden')) {
                    this.renderNotifications(list, badge, btnMarkAll);
                }
            });

            // Đóng khi click ra ngoài
            document.addEventListener('click', (e) => {
                if (!btnBell.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            });

            // Mark all as read
            btnMarkAll.addEventListener('click', async () => {
                const res = await this.notiModel.markAllAsRead();
                if (res && res.success) {
                    await this.notiModel.fetchNotifications();
                    this.renderNotifications(list, badge, btnMarkAll);
                }
            });

            // Click vào từng thông báo để đọc
            list.addEventListener('click', async (e) => {
                const notiItem = e.target.closest('.noti-item');
                if (notiItem && notiItem.dataset.unread === 'true') {
                    const id = notiItem.dataset.id;
                    await this.notiModel.markAsRead(id);
                    notiItem.dataset.unread = 'false';
                    notiItem.classList.remove('bg-indigo-50/50');
                    notiItem.querySelector('.unread-dot')?.remove();
                    
                    this.notiModel.unreadCount = Math.max(0, this.notiModel.unreadCount - 1);
                    this.updateBadge(badge, this.notiModel.unreadCount);
                }
            });

            // Fetch lần đầu và Polling mỗi 30 giây
            await this.notiModel.fetchNotifications();
            this.updateBadge(badge, this.notiModel.unreadCount);

            setInterval(async () => {
                await this.notiModel.fetchNotifications();
                this.updateBadge(badge, this.notiModel.unreadCount);
                if (!dropdown.classList.contains('hidden')) {
                    this.renderNotifications(list, badge, btnMarkAll);
                }
            }, 30000);

        } catch (error) {
            console.error('Lỗi khởi tạo Notification:', error);
        }
    }

    updateBadge(badge, count) {
        if (count > 0) {
            badge.innerText = count > 9 ? '9+' : count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    renderNotifications(list, badge, btnMarkAll) {
        const notis = this.notiModel.notifications;
        
        if (!notis || notis.length === 0) {
            list.innerHTML = `<div class="p-8 text-center text-slate-400 text-sm">Chưa có thông báo nào</div>`;
            btnMarkAll.classList.add('hidden');
            return;
        }

        btnMarkAll.classList.remove('hidden');

        list.innerHTML = notis.map(n => {
            const isUnread = n.is_read === 0;
            const bgClass = isUnread ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50';
            const dotHtml = isUnread ? `<div class="w-2 h-2 bg-indigo-600 rounded-full unread-dot mt-1.5 shrink-0"></div>` : '';
            
            // Xử lý type (chọn icon/màu tùy type)
            let iconColor = 'text-indigo-500';
            let bgColor = 'bg-indigo-100';
            if (n.type === 'warning') { iconColor = 'text-amber-500'; bgColor = 'bg-amber-100'; }
            if (n.type === 'error') { iconColor = 'text-rose-500'; bgColor = 'bg-rose-100'; }
            if (n.type === 'success') { iconColor = 'text-emerald-500'; bgColor = 'bg-emerald-100'; }

            const time = new Date(n.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
            const date = new Date(n.created_at).toLocaleDateString('vi-VN');

            return `
                <div class="noti-item p-4 flex gap-3 cursor-pointer transition-colors ${bgClass}" data-id="${n.id}" data-unread="${isUnread}">
                    <div class="w-10 h-10 rounded-full ${bgColor} ${iconColor} flex items-center justify-center shrink-0">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-slate-800 ${isUnread ? 'font-semibold' : 'font-medium'} leading-tight">${n.message}</p>
                        <p class="text-xs text-slate-500 mt-1">${time} - ${date}</p>
                    </div>
                    ${dotHtml}
                </div>
            `;
        }).join('');
    }

    initToastSystem() {
        window.showToast = (message, type = 'success') => {
            const container = document.getElementById('toast-container');
            if (!container) return;

            const toast = document.createElement('div');
            // Colors: success(green), error(red), warning(yellow), info(blue)
            const bgColors = {
                success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                error: 'bg-rose-50 border-rose-200 text-rose-800',
                warning: 'bg-amber-50 border-amber-200 text-amber-800',
                info: 'bg-blue-50 border-blue-200 text-blue-800'
            };
            const icons = {
                success: '<svg class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
                error: '<svg class="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
                warning: '<svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
                info: '<svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
            };

            const selectedClass = bgColors[type] || bgColors.info;
            const selectedIcon = icons[type] || icons.info;

            toast.className = `flex items-center gap-3 px-4 py-3 border rounded-xl shadow-lg transform transition-all duration-300 translate-x-full opacity-0 pointer-events-auto ${selectedClass}`;
            toast.innerHTML = `
                ${selectedIcon}
                <p class="text-sm font-semibold">${message}</p>
                <button class="ml-2 text-slate-400 hover:text-slate-600 focus:outline-none" onclick="this.parentElement.remove()">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            `;

            container.appendChild(toast);

            // Animate in
            setTimeout(() => {
                toast.classList.remove('translate-x-full', 'opacity-0');
            }, 10);

            // Auto remove after 4 seconds
            setTimeout(() => {
                toast.classList.add('translate-x-full', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        };
    }

    async initMusicPlayer() {
        // Fetch cấu hình bgm_url từ hệ thống
        try {
            const { default: SystemService } = await import('../services/SystemService.js');
            const res = await SystemService.getConfigs();
            if (res.data && res.data.success && res.data.data.bgm_url) {
                this.setupAudio(res.data.data.bgm_url);
            }
        } catch (error) {
            console.error(error);
        }

        // Lắng nghe sự kiện cập nhật nhạc nền từ AdminSystemController
        window.addEventListener('bgm-updated', (e) => {
            this.setupAudio(e.detail);
        });
    }

    setupAudio(url) {
        const audio = document.getElementById('sys-audio-player');
        if (!audio || !url) return;
        
        const isPlaying = !audio.paused;
        audio.src = url;
        audio.volume = 0.5;
        
        if (isPlaying) {
            audio.play().catch(e => console.error(e));
        }

        // Gắn sự kiện nút Play/Pause
        const btnPlay = document.getElementById('btn-play-music');
        const iconPlay = document.getElementById('icon-play');
        const iconPause = document.getElementById('icon-pause');
        const timeDisplay = document.getElementById('music-time');
        const progressBar = document.getElementById('music-progress-bar');
        
        // Remove old listeners to avoid duplicates
        const newBtnPlay = btnPlay.cloneNode(true);
        btnPlay.parentNode.replaceChild(newBtnPlay, btnPlay);
        
        newBtnPlay.addEventListener('click', async () => {
            if (audio.paused) {
                try {
                    await audio.play();
                    newBtnPlay.querySelector('#icon-play').classList.add('hidden');
                    newBtnPlay.querySelector('#icon-pause').classList.remove('hidden');
                } catch (err) {
                    console.error('Lỗi phát nhạc:', err);
                    if (window.showToast) {
                        window.showToast('Không thể phát nhạc nền. Vui lòng kiểm tra lại đường dẫn nhạc.', 'error');
                    }
                }
            } else {
                audio.pause();
                newBtnPlay.querySelector('#icon-pause').classList.add('hidden');
                newBtnPlay.querySelector('#icon-play').classList.remove('hidden');
            }
        });

        // Update progress
        audio.ontimeupdate = () => {
            const current = audio.currentTime;
            const mins = Math.floor(current / 60);
            const secs = Math.floor(current % 60).toString().padStart(2, '0');
            timeDisplay.innerText = `${mins}:${secs}`;
            
            if (audio.duration) {
                const percent = (current / audio.duration) * 100;
                progressBar.style.width = `${percent}%`;
            }
        };

        // Seek (Tua nhạc)
        const progressContainer = document.getElementById('music-progress-container');
        if (progressContainer) {
            progressContainer.onclick = (e) => {
                if (!audio.duration) return;
                const rect = progressContainer.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percent = clickX / rect.width;
                audio.currentTime = percent * audio.duration;
            };
        }
    }

    loadDefaultPage(role) {
        let defaultMenuId = '';
        let defaultTitle = '';

        if (role === 'admin') {
            defaultMenuId = 'menu-admin-accounts';
            defaultTitle = 'Quản lý Tài khoản Hệ thống';
        } else if (role === 'owner') {
            defaultMenuId = 'menu-owner-dashboard';
            defaultTitle = 'Thống kê Tổng quan';
        } else if (role === 'staff') {
            defaultMenuId = 'menu-staff-pos';
            defaultTitle = 'Lập hóa đơn (POS)';
        }

        if (defaultMenuId) {
            this.navigate(defaultMenuId, defaultTitle);
        }
    }

    navigate(menuId, title) {
        // Cập nhật giao diện menu đang chọn
        this.view.setActiveMenu(menuId, title);
        
        // Hủy controller cũ nếu có
        if (this.childController && typeof this.childController.destroy === 'function') {
            this.childController.destroy();
        }

        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = ''; // Clear cũ

        if (menuId === 'menu-admin-accounts') {
            import('./AdminUserController.js').then(module => {
                const AdminUserController = module.default;
                this.childController = new AdminUserController();
            }).catch(err => console.error(err));
        } else if (menuId === 'menu-admin-system') {
            import('./AdminSystemController.js').then(module => {
                const AdminSystemController = module.default;
                this.childController = new AdminSystemController();
            }).catch(err => console.error(err));
        } else if (menuId === 'menu-admin-audit') {
            import('./AdminAuditController.js').then(module => {
                const AdminAuditController = module.default;
                this.childController = new AdminAuditController();
            }).catch(err => console.error(err));
        } else if (menuId === 'menu-staff-pos') {
            import('./StaffPOSController.js').then(module => {
                const StaffPOSController = module.default;
                this.childController = new StaffPOSController();
            }).catch(err => console.error(err));
        } else if (menuId === 'menu-staff-orders') {
            import('./StaffOrderHistoryController.js').then(module => {
                const StaffOrderHistoryController = module.default;
                this.childController = new StaffOrderHistoryController();
            }).catch(err => console.error(err));
        } else if (menuId === 'menu-staff-installment') {
            import('./StaffInstallmentController.js').then(module => {
                const StaffInstallmentController = module.default;
                this.childController = new StaffInstallmentController();
            }).catch(err => console.error(err));
        } else if (menuId === 'menu-staff-return-warranty') {
            import('./StaffReturnWarrantyController.js').then(module => {
                const StaffReturnWarrantyController = module.default;
                this.childController = new StaffReturnWarrantyController();
            }).catch(err => console.error(err));
        } else if (menuId === 'menu-staff-inventory') {
            import('./StaffProductController.js').then(module => {
                const StaffProductController = module.default;
                this.childController = new StaffProductController();
            }).catch(err => console.error(err));
        } else if (menuId === 'menu-staff-attendance') {
            import('./StaffAttendanceController.js').then(module => {
                const StaffAttendanceController = module.default;
                this.childController = new StaffAttendanceController();
            }).catch(err => console.error(err));
        } else if (menuId === 'menu-owner-products') {
            import('./OwnerProductController.js').then(module => {
                const OwnerProductController = module.default;
                this.childController = new OwnerProductController();
            }).catch(err => console.error(err));
        } else if (menuId === 'menu-owner-dashboard') {
            import('./OwnerDashboardController.js').then(module => {
                const OwnerDashboardController = module.default;
                this.childController = new OwnerDashboardController();
            }).catch(err => console.error(err));
        } else if (menuId === 'menu-owner-cashflow') {
            import('./OwnerCashflowController.js').then(module => {
                const OwnerCashflowController = module.default;
                this.childController = new OwnerCashflowController();
            }).catch(err => console.error(err));
        } else if (menuId === 'menu-owner-staff') {
            import('./OwnerStaffController.js').then(module => {
                const OwnerStaffController = module.default;
                this.childController = new OwnerStaffController();
            }).catch(err => console.error(err));
        } else if (menuId === 'menu-settings') {
            import('./UserSettingsController.js').then(module => {
                const UserSettingsController = module.default;
                this.childController = new UserSettingsController();
            }).catch(err => console.error(err));
        } else {
            contentArea.innerHTML = `
                <div class="flex items-center justify-center h-full">
                    <div class="text-center text-slate-400">
                        <svg class="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 class="mt-2 text-sm font-medium text-slate-900">Chưa có giao diện</h3>
                        <p class="mt-1 text-sm text-slate-500">Chức năng ${title} đang được xây dựng.</p>
                    </div>
                </div>
            `;
        }
    }

    destroy() {
        if (this.view.container) {
            this.view.container.remove();
        }
    }
}
