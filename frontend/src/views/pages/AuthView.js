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
        this.container.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 opacity-0 hidden';
        
        this.container.innerHTML = `
            <div class="bg-white w-full max-w-md rounded-[24px] shadow-2xl border border-slate-200 p-8 transform transition-all opacity-0 scale-95 duration-500 relative z-10 my-4 max-h-[90vh] overflow-y-auto" id="auth-card-content">
                <button type="button" id="btn-close-auth" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors z-20">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>

                <!-- Logo & Header -->
                <div class="text-center mb-8">
                    <div class="mx-auto w-24 h-24 mb-4 relative">
                        <div class="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-30"></div>
                        <img src="assets/images/logo-system.png" alt="BanHangAI Logo" class="w-full h-full object-contain relative z-10 drop-shadow-xl animate-float">
                    </div>
                    <h3 class="text-2xl font-black text-slate-900" id="auth-title">Đăng nhập hệ thống</h3>
                    <p class="text-slate-600 font-medium mt-2 text-sm" id="auth-subtitle">Chào mừng bạn quay trở lại với Trợ lý AI</p>
                </div>
                
                <div id="auth-alert" class="hidden mb-4 p-3 rounded-lg text-sm font-bold text-center transition-all duration-300"></div>
                
                <form id="auth-form" class="space-y-4">
                    <div id="field-fullname" class="hidden">
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5 ml-1">Họ và tên</label>
                        <input type="text" id="auth-fullname" class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-sm transition-all outline-none text-slate-900 font-medium placeholder-slate-400" placeholder="VD: Nguyễn Văn A">
                    </div>
                    <div id="field-email" class="hidden">
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5 ml-1">Email</label>
                        <input type="email" id="auth-email" class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-sm transition-all outline-none text-slate-900 font-medium placeholder-slate-400" placeholder="email@example.com">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5 ml-1">Tên đăng nhập <span class="text-rose-500">*</span></label>
                        <input type="text" id="auth-username" value="owner" required class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-sm transition-all outline-none text-slate-900 font-bold placeholder-slate-400" placeholder="Nhập username">
                    </div>
                    <div>
                        <div class="flex justify-between items-center mb-1.5 ml-1">
                            <label class="block text-xs font-bold text-slate-700 uppercase">Mật khẩu <span class="text-rose-500">*</span></label>
                            <a href="#" id="btn-forgot-password" class="text-xs font-bold text-indigo-700 hover:text-indigo-900 transition-colors">Quên mật khẩu?</a>
                        </div>
                        <div class="relative">
                            <input type="password" id="auth-password" value="123456" required class="w-full px-4 py-3 pr-12 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-sm transition-all outline-none text-slate-900 font-medium placeholder-slate-400" placeholder="••••••••">
                            <button type="button" id="btn-toggle-password" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition-colors" title="Hiện mật khẩu">
                                <svg class="w-5 h-5 icon-eye" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="flex items-start">
                        <div class="flex items-center h-5">
                            <input id="auth-terms" type="checkbox" required class="w-4 h-4 border border-slate-300 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer">
                        </div>
                        <label for="auth-terms" class="ml-2 text-xs font-semibold text-slate-600 cursor-pointer">
                            Tôi đồng ý với <a href="#" id="btn-show-terms" class="text-indigo-700 font-bold hover:underline">Điều khoản sử dụng</a> của hệ thống
                        </label>
                    </div>
                    
                    <button type="submit" id="btn-submit-auth" class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-sm hover:shadow-md transition-all duration-200 text-white font-bold rounded-xl flex justify-center items-center gap-2 mt-4 text-sm">
                        <span>Đăng nhập</span>
                        <div id="auth-spinner" class="hidden w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </button>
                </form>
                
                <div class="mt-8 text-center border-t border-slate-200 pt-6">
                    <p class="text-sm text-slate-600 font-medium" id="auth-toggle-text">
                        Chưa có tài khoản? <a href="#" id="btn-toggle-mode" class="text-indigo-700 font-bold hover:text-indigo-900 hover:underline underline-offset-4 transition-colors">Đăng ký ngay</a>
                    </p>
                </div>
            </div>
            
            <!-- Terms Modal -->
            <div id="terms-modal" class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm opacity-0 hidden transition-opacity duration-300">
                <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 transform scale-95 opacity-0 transition-all duration-300 max-h-[85vh] flex flex-col border border-slate-200" id="terms-content">
                    <div class="flex justify-between items-center border-b border-slate-200 pb-4 mb-4 shrink-0">
                        <h3 class="text-xl font-black text-slate-900">Điều Khoản Sử Dụng</h3>
                        <button type="button" id="btn-close-terms" class="text-slate-400 hover:text-slate-700 transition-colors">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="overflow-y-auto flex-1 pr-2 prose prose-sm prose-slate max-w-none text-sm text-slate-700 leading-relaxed font-medium" id="terms-body">
                        <h1 class="text-lg font-black text-slate-900 mb-2">Điều Khoản Sử Dụng Hệ Thống BanHangAI</h1>
                        <p class="mb-4">Chào mừng bạn đến với hệ thống quản lý bán hàng thông minh <strong>BanHangAI</strong>. Bằng việc đăng nhập và sử dụng hệ thống, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây. Vui lòng đọc kỹ trước khi sử dụng.</p>

                        <h2 class="text-base font-black text-slate-900 mt-4 mb-2">1. Quyền Truy Cập và Sử Dụng</h2>
                        <ul class="list-disc pl-5 mb-4 space-y-1">
                        <li>Tài khoản được cấp riêng cho từng cá nhân theo phân quyền. Bạn có trách nhiệm bảo mật thông tin đăng nhập của mình.</li>
                        <li>Không chia sẻ tài khoản cho người khác. Mọi thao tác phát sinh từ tài khoản của bạn sẽ do bạn chịu trách nhiệm hoàn toàn.</li>
                        </ul>

                        <h2 class="text-base font-black text-slate-900 mt-4 mb-2">2. Bảo Mật Thông Tin</h2>
                        <ul class="list-disc pl-5 mb-4 space-y-1">
                        <li>Hệ thống cam kết bảo mật mọi dữ liệu kinh doanh (doanh thu, tồn kho, khách hàng) của cửa hàng theo chuẩn an toàn thông tin.</li>
                        <li>Mật khẩu người dùng được mã hóa một chiều. Ngay cả ban quản trị hệ thống cũng không thể xem trực tiếp mật khẩu của bạn.</li>
                        </ul>

                        <h2 class="text-base font-black text-slate-900 mt-4 mb-2">3. Trách Nhiệm Của Người Dùng</h2>
                        <ul class="list-disc pl-5 mb-4 space-y-1">
                        <li>Chỉ nhập dữ liệu chính xác và trung thực vào hệ thống. Không sử dụng hệ thống cho các mục đích gian lận, phá hoại hoặc kinh doanh trái pháp luật.</li>
                        <li>Nếu phát hiện lỗ hổng bảo mật hoặc tài khoản bị xâm phạm, vui lòng báo ngay cho Quản trị viên (Admin).</li>
                        </ul>

                        <h2 class="text-base font-black text-slate-900 mt-4 mb-2">4. Trợ Lý AI</h2>
                        <ul class="list-disc pl-5 mb-4 space-y-1">
                        <li>Các tư vấn của Trợ lý AI (phân tích doanh thu, sinh mô tả sản phẩm, gợi ý bán hàng) chỉ mang tính chất tham khảo. Người dùng cần tự kiểm tra và quyết định trước khi áp dụng vào thực tế kinh doanh.</li>
                        </ul>

                        <h2 class="text-base font-black text-slate-900 mt-4 mb-2">5. Cấp Lại Mật Khẩu</h2>
                        <ul class="list-disc pl-5 mb-4 space-y-1">
                        <li>Tính năng tự động khôi phục mật khẩu tạm thời bị vô hiệu hóa để đảm bảo bảo mật nội bộ.</li>
                        <li>Trong trường hợp quên mật khẩu hoặc tài khoản bị khóa, vui lòng liên hệ Quản trị viên (Admin) hoặc Chủ cửa hàng (Owner) để được cấp lại mật khẩu mặc định.</li>
                        </ul>

                        <h2 class="text-base font-black text-slate-900 mt-4 mb-2">6. Sửa Đổi Điều Khoản</h2>
                        <ul class="list-disc pl-5 mb-5 space-y-1">
                        <li>BanHangAI có quyền thay đổi, cập nhật các điều khoản này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được thông báo trên hệ thống. Việc bạn tiếp tục sử dụng đồng nghĩa với việc chấp nhận các điều khoản mới.</li>
                        </ul>

                        <hr class="my-4 border-slate-200">
                        <p class="text-xs text-slate-500 font-bold italic">Lần cập nhật cuối: Tháng 9/2026</p>
                    </div>
                    <div class="border-t border-slate-200 pt-4 mt-4 text-right shrink-0">
                        <button type="button" id="btn-accept-terms" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm">Tôi đã hiểu và đóng</button>
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
        this.container.querySelector('#auth-subtitle').innerText = isLogin ? 'Chào mừng bạn quay trở lại với Trợ lý AI' : 'Bắt đầu trải nghiệm ngay hôm nay';
        this.container.querySelector('#btn-submit-auth span').innerText = isLogin ? 'Đăng nhập' : 'Đăng ký';
        this.container.querySelector('#auth-toggle-text').innerHTML = isLogin 
            ? 'Chưa có tài khoản? <a href="#" id="btn-toggle-mode" class="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline underline-offset-4 transition-colors">Đăng ký ngay</a>'
            : 'Đã có tài khoản? <a href="#" id="btn-toggle-mode" class="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline underline-offset-4 transition-colors">Đăng nhập</a>';
            
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
        alert.className = `mb-4 p-3.5 rounded-lg text-sm font-medium ${isSuccess ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`;
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
                    btn.innerHTML = `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>`;
                } else {
                    input.type = 'password';
                    btn.innerHTML = `<svg class="w-5 h-5 icon-eye" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>`;
                }
            } else if (e.target.closest('#btn-forgot-password')) {
                e.preventDefault();
                alert('Tính năng khôi phục mật khẩu tự động đang tạm vô hiệu hóa. Vui lòng liên hệ Admin hoặc Chủ cửa hàng để được cấp lại mật khẩu.');
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
