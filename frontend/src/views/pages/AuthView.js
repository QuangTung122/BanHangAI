export default class AuthView {
    constructor() {
        this.container = null;
        this.currentMode = 'login';
        this.appRoot = document.getElementById('app-root') || document.body;
    }

    renderView() {
        if (this.container) return;
        
        // Clean up any stray containers left by previous controller instances
        const existing = document.querySelectorAll('#auth-page');
        existing.forEach(el => el.remove());
        
        this.container = document.createElement('div');
        this.container.id = 'auth-page';
        this.container.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-[#182033]/60 backdrop-blur-sm transition-opacity duration-300 opacity-0 hidden p-4';
        
        this.container.innerHTML = `
            <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#e7eaf2] p-8 transform transition-all opacity-0 scale-95 duration-300 relative z-10 max-h-[92vh] overflow-y-auto" id="auth-card-content">
                <button type="button" id="btn-close-auth" class="absolute top-4 right-4 text-[#7b8499] hover:text-[#182033] p-1.5 rounded-lg hover:bg-[#f5f6fa] transition-colors z-20 cursor-pointer">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>

                <!-- Logo & Header -->
                <div class="text-center mb-6">
                    <div class="w-14 h-14 rounded-2xl bg-[#5745f5] text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-[#5745f5]/30 mx-auto mb-3">
                        H
                    </div>
                    <div class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f0edff] text-[#5745f5] mb-2">
                        HTH Smart Sales
                    </div>
                    <h3 class="text-xl font-black text-[#182033]" id="auth-title">Đăng nhập hệ thống</h3>
                    <p class="text-xs text-[#7b8499] mt-1 font-medium" id="auth-subtitle">Trợ lý bán hàng và vận hành thông minh trợ lực bởi AI</p>
                </div>
                
                <div id="auth-alert" class="hidden mb-4 p-3 rounded-xl text-xs font-bold text-center transition-all duration-300"></div>
                
                <form id="auth-form" class="space-y-4">
                    <div id="field-fullname" class="hidden">
                        <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Họ và tên</label>
                        <input type="text" id="auth-fullname" class="w-full px-3.5 py-2.5 bg-white border border-[#e7eaf2] rounded-xl text-xs text-[#182033] font-medium placeholder-[#7b8499] focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all" placeholder="VD: Nguyễn Văn A">
                    </div>
                    <div id="field-email" class="hidden">
                        <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Email liên hệ</label>
                        <input type="email" id="auth-email" class="w-full px-3.5 py-2.5 bg-white border border-[#e7eaf2] rounded-xl text-xs text-[#182033] font-medium placeholder-[#7b8499] focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all" placeholder="email@example.com">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Tên đăng nhập <span class="text-rose-500">*</span></label>
                        <input type="text" id="auth-username" value="owner" required class="w-full px-3.5 py-2.5 bg-white border border-[#e7eaf2] rounded-xl text-xs text-[#182033] font-bold placeholder-[#7b8499] focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all" placeholder="Nhập username">
                    </div>
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="block text-xs font-bold text-[#182033] uppercase">Mật khẩu <span class="text-rose-500">*</span></label>
                            <a href="#" id="btn-forgot-password" class="text-xs font-bold text-[#5745f5] hover:text-[#4736e8] transition-colors">Quên mật khẩu?</a>
                        </div>
                        <div class="relative">
                            <input type="password" id="auth-password" value="123456" required class="w-full px-3.5 py-2.5 pr-10 bg-white border border-[#e7eaf2] rounded-xl text-xs text-[#182033] font-medium placeholder-[#7b8499] focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all" placeholder="••••••••">
                            <button type="button" id="btn-toggle-password" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b8499] hover:text-[#182033] transition-colors cursor-pointer" title="Hiện mật khẩu">
                                <svg class="w-4 h-4 icon-eye" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="flex items-start pt-1">
                        <div class="flex items-center h-5">
                            <input id="auth-terms" type="checkbox" required class="w-4 h-4 border border-[#e7eaf2] rounded accent-[#5745f5] cursor-pointer">
                        </div>
                        <label for="auth-terms" class="ml-2 text-xs font-medium text-[#7b8499] cursor-pointer">
                            Tôi đồng ý với <a href="#" id="btn-show-terms" class="text-[#5745f5] font-bold hover:underline">Điều khoản sử dụng</a> HTH Smart Sales
                        </label>
                    </div>
                    
                    <button type="submit" id="btn-submit-auth" class="w-full py-2.5 px-4 bg-[#5745f5] hover:bg-[#4736e8] active:scale-[0.98] shadow-sm shadow-[#5745f5]/25 transition-all text-white font-bold rounded-xl flex justify-center items-center gap-2 mt-4 text-xs cursor-pointer">
                        <span>Đăng nhập</span>
                        <div id="auth-spinner" class="hidden w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </button>
                </form>
                
                <div class="mt-6 text-center border-t border-[#e7eaf2] pt-4">
                    <p class="text-xs text-[#7b8499] font-medium" id="auth-toggle-text">
                        Chưa có tài khoản? <a href="#" id="btn-toggle-mode" class="text-[#5745f5] font-bold hover:text-[#4736e8] hover:underline underline-offset-4 transition-colors">Đăng ký ngay</a>
                    </p>
                </div>
            </div>
            
            <!-- Terms Modal -->
            <div id="terms-modal" class="fixed inset-0 z-[200] flex items-center justify-center bg-[#182033]/60 backdrop-blur-sm opacity-0 hidden transition-opacity duration-300 p-4">
                <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 transform scale-95 opacity-0 transition-all duration-300 max-h-[85vh] flex flex-col border border-[#e7eaf2]" id="terms-content">
                    <div class="flex justify-between items-center border-b border-[#e7eaf2] pb-4 mb-4 shrink-0">
                        <div class="flex items-center gap-2.5">
                            <span class="w-8 h-8 rounded-lg bg-[#f0edff] text-[#5745f5] flex items-center justify-center font-bold text-xs">📜</span>
                            <h3 class="text-base font-black text-[#182033]">Điều Khoản Sử Dụng HTH Smart Sales</h3>
                        </div>
                        <button type="button" id="btn-close-terms" class="text-[#7b8499] hover:text-[#182033] transition-colors cursor-pointer">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="overflow-y-auto flex-1 pr-2 text-xs text-[#182033] leading-relaxed font-medium space-y-3" id="terms-body">
                        <p>Chào mừng bạn đến với hệ thống quản lý bán hàng thông minh <strong>HTH Smart Sales</strong>. Bằng việc đăng nhập và sử dụng hệ thống, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây.</p>

                        <h4 class="text-xs font-black text-[#182033] uppercase tracking-wider pt-2">1. Quyền Truy Cập và Sử Dụng</h4>
                        <ul class="list-disc pl-5 space-y-1 text-[#7b8499]">
                            <li>Tài khoản được cấp riêng cho từng cá nhân theo phân quyền (Admin, Owner, Staff). Bạn có trách nhiệm bảo mật thông tin đăng nhập của mình.</li>
                            <li>Không chia sẻ tài khoản cho người ngoài. Mọi giao dịch phát sinh từ tài khoản sẽ do chủ tài khoản chịu trách nhiệm.</li>
                        </ul>

                        <h4 class="text-xs font-black text-[#182033] uppercase tracking-wider pt-2">2. Bảo Mật Thông Tin & Dữ Liệu</h4>
                        <ul class="list-disc pl-5 space-y-1 text-[#7b8499]">
                            <li>Hệ thống cam kết bảo mật toàn diện dữ liệu kinh doanh, doanh thu, tồn kho và danh bạ khách hàng.</li>
                            <li>Mật khẩu người dùng được băm bảo mật tiêu chuẩn mã hóa một chiều.</li>
                        </ul>

                        <h4 class="text-xs font-black text-[#182033] uppercase tracking-wider pt-2">3. Trợ Lý AI Khuyến Nghị</h4>
                        <ul class="list-disc pl-5 space-y-1 text-[#7b8499]">
                            <li>Các tư vấn của Trợ lý AI (phân tích tồn kho, sinh mô tả, gợi ý upsell) mang tính tham khảo để tối ưu năng suất lao động.</li>
                        </ul>

                        <hr class="border-[#e7eaf2] my-3">
                        <p class="text-[11px] text-[#7b8499] italic">Cập nhật lần cuối: Năm 2026 • HTH Smart Sales System</p>
                    </div>
                    <div class="border-t border-[#e7eaf2] pt-4 mt-4 text-right shrink-0">
                        <button type="button" id="btn-accept-terms" class="px-5 py-2 bg-[#5745f5] hover:bg-[#4736e8] text-white font-bold rounded-xl shadow-sm shadow-[#5745f5]/20 transition-colors text-xs cursor-pointer">Tôi đã hiểu và đồng ý</button>
                    </div>
                </div>
            </div>
        `;
        
        this.appRoot.appendChild(this.container);
    }

    openView(mode = 'login') {
        if (!this.container) this.renderView();
        
        this.container.classList.remove('hidden');
        
        this.setMode(mode);
        this.clearAlert();
        this.container.querySelector('#auth-form').reset();

        // Animation in
        setTimeout(() => {
            this.container.classList.remove('opacity-0');
            this.container.classList.add('opacity-100');
            const content = this.container.querySelector('#auth-card-content');
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
    }

    closeView() {
        if (!this.container) return;
        this.container.classList.remove('opacity-100');
        this.container.classList.add('opacity-0');
        const content = this.container.querySelector('#auth-card-content');
        if (content) {
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
        }
        setTimeout(() => {
            if (this.container) {
                this.container.remove();
                this.container = null;
            }
        }, 300);
    }

    setMode(mode) {
        this.currentMode = mode;
        const isLogin = mode === 'login';
        
        this.container.querySelector('#auth-title').innerText = isLogin ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản';
        this.container.querySelector('#auth-subtitle').innerText = isLogin ? 'Trợ lý bán hàng và vận hành thông minh trợ lực bởi AI' : 'Bắt đầu trải nghiệm ngay hôm nay';
        this.container.querySelector('#btn-submit-auth span').innerText = isLogin ? 'Đăng nhập' : 'Đăng ký';
        this.container.querySelector('#auth-toggle-text').innerHTML = isLogin 
            ? 'Chưa có tài khoản? <a href="#" id="btn-toggle-mode" class="text-[#5745f5] font-bold hover:text-[#4736e8] hover:underline underline-offset-4 transition-colors">Đăng ký ngay</a>'
            : 'Đã có tài khoản? <a href="#" id="btn-toggle-mode" class="text-[#5745f5] font-bold hover:text-[#4736e8] hover:underline underline-offset-4 transition-colors">Đăng nhập</a>';
            
        if (isLogin) {
            this.container.querySelector('#field-fullname').classList.add('hidden');
            this.container.querySelector('#field-email').classList.add('hidden');
            this.container.querySelector('#auth-fullname').removeAttribute('required');
            this.container.querySelector('#auth-email').removeAttribute('required');
        } else {
            this.container.querySelector('#field-fullname').classList.remove('hidden');
            this.container.querySelector('#field-email').classList.remove('hidden');
            this.container.querySelector('#auth-fullname').setAttribute('required', 'true');
            this.container.querySelector('#auth-email').setAttribute('required', 'true');
        }
    }

    showAlert(message, isSuccess = false) {
        const alert = this.container.querySelector('#auth-alert');
        alert.innerText = message;
        alert.className = `mb-4 p-3 rounded-xl text-xs font-bold ${isSuccess ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`;
        alert.classList.remove('hidden');
    }

    clearAlert() {
        this.container.querySelector('#auth-alert').classList.add('hidden');
    }

    setLoading(isLoading) {
        const btn = this.container.querySelector('#btn-submit-auth');
        const spinner = this.container.querySelector('#auth-spinner');
        if (isLoading) {
            btn.disabled = true;
            btn.classList.add('opacity-75', 'cursor-not-allowed');
            spinner.classList.remove('hidden');
        } else {
            btn.disabled = false;
            btn.classList.remove('opacity-75', 'cursor-not-allowed');
            spinner.classList.add('hidden');
        }
    }

    bindToggleMode(handler) {
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('#btn-toggle-mode')) {
                e.preventDefault();
                handler();
            } else if (e.target.closest('#btn-close-auth') || e.target === this.container) {
                this.closeView();
            } else if (e.target.closest('#btn-toggle-password')) {
                e.preventDefault();
                const input = this.container.querySelector('#auth-password');
                const btn = e.target.closest('#btn-toggle-password');
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.innerHTML = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>`;
                } else {
                    input.type = 'password';
                    btn.innerHTML = `<svg class="w-4 h-4 icon-eye" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>`;
                }
            } else if (e.target.closest('#btn-forgot-password')) {
                e.preventDefault();
                alert('Tính năng khôi phục mật khẩu tự động đang tạm vô hiệu hóa để bảo đảm bảo mật. Vui lòng liên hệ Admin hoặc Chủ cửa hàng để được cấp lại mật khẩu.');
            } else if (e.target.closest('#btn-show-terms')) {
                e.preventDefault();
                const modal = this.container.querySelector('#terms-modal');
                const content = this.container.querySelector('#terms-content');
                modal.classList.remove('hidden');
                setTimeout(() => {
                    modal.classList.remove('opacity-0');
                    content.classList.remove('scale-95', 'opacity-0');
                }, 10);
            } else if (e.target.closest('#btn-close-terms') || e.target.closest('#btn-accept-terms') || e.target.id === 'terms-modal') {
                const modal = this.container.querySelector('#terms-modal');
                const content = this.container.querySelector('#terms-content');
                modal.classList.add('opacity-0');
                content.classList.add('scale-95', 'opacity-0');
                setTimeout(() => {
                    modal.classList.add('hidden');
                }, 300);
            }
        });
    }

    bindSubmit(handler) {
        this.container.addEventListener('submit', (e) => {
            if (e.target && e.target.id === 'auth-form') {
                e.preventDefault();
                const username = this.container.querySelector('#auth-username').value.trim();
                const password = this.container.querySelector('#auth-password').value;
                const fullname = this.container.querySelector('#auth-fullname').value.trim();
                const email = this.container.querySelector('#auth-email').value.trim();
                handler(this.currentMode, { username, password, fullname, email });
            }
        });
    }
}
