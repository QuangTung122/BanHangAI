export default class UserSettingsView {
    constructor() {
        this.appRoot = document.getElementById('content-area');
        this.container = null;
    }

    render() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.className = 'h-full flex flex-col p-1 max-w-[1100px] mx-auto w-full';
        
        this.container.innerHTML = `
            <!-- Content Grid 2 Columns Tinh gọn -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Thông tin cá nhân -->
                <div class="bg-white rounded-xl p-4 shadow-xs border border-[#e7eaf2] flex flex-col">
                    <div class="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#e7eaf2]">
                        <div class="w-8 h-8 rounded-lg bg-[#f0edff] text-[#5745f5] flex items-center justify-center font-bold">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-xs font-black text-[#182033]">Thông tin hồ sơ</h2>
                            <p class="text-[10px] text-[#7b8499]">Thông tin hiển thị trên chứng từ</p>
                        </div>
                    </div>
                    
                    <form id="form-profile" class="space-y-4 flex-1 flex flex-col justify-between">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Tên đăng nhập</label>
                                <input type="text" id="prof-username" class="w-full bg-[#f5f6fa] border border-[#e7eaf2] rounded-xl px-3.5 py-2.5 text-xs text-[#7b8499] font-bold cursor-not-allowed" disabled>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Họ và tên</label>
                                <input type="text" id="prof-fullname" class="w-full bg-white border border-[#e7eaf2] rounded-xl px-3.5 py-2.5 text-xs text-[#182033] font-medium focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all" placeholder="Nhập họ và tên đầy đủ">
                            </div>
                            
                            <div>
                                <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Email</label>
                                <input type="email" id="prof-email" class="w-full bg-white border border-[#e7eaf2] rounded-xl px-3.5 py-2.5 text-xs text-[#182033] font-medium focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all" placeholder="email@domain.com">
                            </div>
                            
                            <div>
                                <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Số điện thoại</label>
                                <input type="tel" id="prof-phone" class="w-full bg-white border border-[#e7eaf2] rounded-xl px-3.5 py-2.5 text-xs text-[#182033] font-medium focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all" placeholder="0901234567">
                            </div>
                        </div>
                        
                        <div class="pt-4 border-t border-[#e7eaf2]">
                            <button type="submit" class="w-full bg-[#5745f5] hover:bg-[#4736e8] text-white font-bold py-2.5 rounded-xl transition-all shadow-sm shadow-[#5745f5]/20 text-xs cursor-pointer">
                                Lưu thay đổi hồ sơ
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- Đổi mật khẩu -->
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#e7eaf2] flex flex-col h-fit">
                    <div class="flex items-center gap-3 pb-4 mb-4 border-b border-[#e7eaf2]">
                        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-base font-black text-[#182033]">Bảo mật & Đổi mật khẩu</h2>
                            <p class="text-xs text-[#7b8499]">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản</p>
                        </div>
                    </div>
                    
                    <form id="form-password" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Mật khẩu hiện tại</label>
                            <input type="password" id="pwd-current" class="w-full bg-white border border-[#e7eaf2] rounded-xl px-3.5 py-2.5 text-xs text-[#182033] focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all" placeholder="••••••••" required>
                        </div>
                        
                        <div>
                            <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Mật khẩu mới</label>
                            <input type="password" id="pwd-new" class="w-full bg-white border border-[#e7eaf2] rounded-xl px-3.5 py-2.5 text-xs text-[#182033] focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all" placeholder="••••••••" required minlength="6">
                            <p class="text-[11px] text-[#7b8499] mt-1">Yêu cầu tối thiểu 6 ký tự.</p>
                        </div>
                        
                        <div>
                            <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Xác nhận mật khẩu mới</label>
                            <input type="password" id="pwd-confirm" class="w-full bg-white border border-[#e7eaf2] rounded-xl px-3.5 py-2.5 text-xs text-[#182033] focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all" placeholder="••••••••" required minlength="6">
                        </div>
                        
                        <div class="pt-4 border-t border-[#e7eaf2]">
                            <button type="submit" class="w-full bg-[#182033] hover:bg-black text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs cursor-pointer">
                                Cập nhật mật khẩu mới
                            </button>
                            <p class="text-[11px] text-center text-[#7b8499] mt-2">Hệ thống sẽ yêu cầu xác thực lại nếu đổi mật khẩu thành công.</p>
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
