export default class UserSettingsView {
    constructor() {
        this.appRoot = document.getElementById('content-area');
        this.container = null;
    }

    render() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.className = 'p-6 max-w-4xl mx-auto animate-fade-in-up';
        
        this.container.innerHTML = `
            <div class="mb-8">
                <h1 class="text-3xl font-black text-slate-900 tracking-tight">Cài đặt cá nhân</h1>
                <p class="text-slate-500 mt-2 font-medium">Quản lý thông tin tài khoản và bảo mật</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Thông tin cá nhân -->
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h2 class="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Thông tin hồ sơ
                    </h2>
                    
                    <form id="form-profile" class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Tên đăng nhập</label>
                            <input type="text" id="prof-username" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500 font-medium cursor-not-allowed" disabled>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Họ và tên</label>
                            <input type="text" id="prof-fullname" class="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="Nhập họ và tên">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                            <input type="email" id="prof-email" class="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="Nhập địa chỉ email">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại</label>
                            <input type="tel" id="prof-phone" class="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="Nhập số điện thoại">
                        </div>
                        
                        <div class="pt-4 border-t border-slate-100">
                            <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm hover:shadow-md">
                                Lưu thay đổi
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- Đổi mật khẩu -->
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-fit">
                    <h2 class="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Bảo mật tài khoản
                    </h2>
                    
                    <form id="form-password" class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu hiện tại</label>
                            <input type="password" id="pwd-current" class="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none" placeholder="••••••••" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu mới</label>
                            <input type="password" id="pwd-new" class="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none" placeholder="••••••••" required minlength="6">
                            <p class="text-xs text-slate-500 mt-1">Tối thiểu 6 ký tự.</p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                            <input type="password" id="pwd-confirm" class="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none" placeholder="••••••••" required minlength="6">
                        </div>
                        
                        <div class="pt-4 border-t border-slate-100">
                            <button type="submit" class="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors shadow-sm hover:shadow-md">
                                Đổi mật khẩu
                            </button>
                            <p class="text-xs text-center text-slate-400 mt-3">Lưu ý: Bạn sẽ cần đăng nhập lại sau khi đổi mật khẩu.</p>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.appRoot.appendChild(this.container);
    }

    fillProfileData(user) {
        if (!this.container) return;
        document.getElementById('prof-username').value = user.username || '';
        document.getElementById('prof-fullname').value = user.full_name || '';
        document.getElementById('prof-email').value = user.email || '';
        document.getElementById('prof-phone').value = user.phone || '';
    }

    clearPasswordForm() {
        if (!this.container) return;
        document.getElementById('pwd-current').value = '';
        document.getElementById('pwd-new').value = '';
        document.getElementById('pwd-confirm').value = '';
    }

    bindUpdateProfile(handler) {
        const form = document.getElementById('form-profile');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                handler({
                    full_name: document.getElementById('prof-fullname').value,
                    email: document.getElementById('prof-email').value,
                    phone: document.getElementById('prof-phone').value
                });
            });
        }
    }

    bindChangePassword(handler) {
        const form = document.getElementById('form-password');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                handler({
                    current_password: document.getElementById('pwd-current').value,
                    new_password: document.getElementById('pwd-new').value,
                    confirm_password: document.getElementById('pwd-confirm').value
                });
            });
        }
    }
}
