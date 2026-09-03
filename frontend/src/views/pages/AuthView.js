export default class AuthView {
    constructor() {
        this.container = null;
        this.currentMode = 'login';
        this.appRoot = document.getElementById('app-root');
        this.landingPage = document.getElementById('landing-page');
        this.landingMain = this.landingPage ? this.landingPage.querySelector('main') : null;
        this.landingImg = this.landingPage ? this.landingPage.querySelector('.max-w-5xl') : null;
    }

    renderView() {
        if (this.container) return;
        
        this.container = document.createElement('div');
        this.container.id = 'auth-page';
        this.container.className = 'flex flex-col items-center justify-center min-h-[calc(100vh-64px)] pt-16 w-full bg-slate-50 relative';
        
        this.container.innerHTML = `
            <!-- Decorator Background -->
            <div class="absolute inset-0 overflow-hidden pointer-events-none">
                <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-3xl"></div>
                <div class="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-100/40 blur-3xl"></div>
            </div>

            <div class="bg-white w-full max-w-md rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 transform transition-all opacity-0 scale-95 duration-500 relative z-10 my-10" id="auth-card-content">
                
                <!-- Logo & Header -->
                <div class="text-center mb-8">
                    <div class="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-md shadow-indigo-200 mb-4">
                        AI
                    </div>
                    <h3 class="text-2xl font-bold text-slate-900" id="auth-title">Đăng nhập hệ thống</h3>
                    <p class="text-slate-500 mt-2 text-sm" id="auth-subtitle">Chào mừng bạn quay trở lại với Trợ lý AI</p>
                </div>
                
                <div id="auth-alert" class="hidden mb-4 p-3 rounded-xl text-sm font-medium text-center transition-all duration-300"></div>
                
                <form id="auth-form" class="space-y-4">
                    <div id="field-fullname" class="hidden">
                        <label class="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Họ và tên</label>
                        <input type="text" id="auth-fullname" class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none bg-slate-50/50 focus:bg-white text-slate-700" placeholder="VD: Nguyễn Văn A">
                    </div>
                    <div id="field-email" class="hidden">
                        <label class="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email</label>
                        <input type="email" id="auth-email" class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none bg-slate-50/50 focus:bg-white text-slate-700" placeholder="email@example.com">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Tên đăng nhập <span class="text-red-500">*</span></label>
                        <input type="text" id="auth-username" value="owner" required class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none bg-slate-50/50 focus:bg-white text-slate-700" placeholder="Nhập username">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Mật khẩu <span class="text-red-500">*</span></label>
                        <input type="password" id="auth-password" value="123456" required class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none bg-slate-50/50 focus:bg-white text-slate-700" placeholder="••••••••">
                    </div>
                    
                    <button type="submit" id="btn-submit-auth" class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium rounded-xl shadow-md shadow-indigo-600/20 transition-all flex justify-center items-center gap-2 mt-4">
                        <span>Đăng nhập</span>
                        <div id="auth-spinner" class="hidden w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </button>
                </form>
                
                <div class="mt-8 text-center border-t border-slate-100 pt-6">
                    <p class="text-sm text-slate-500" id="auth-toggle-text">
                        Chưa có tài khoản? <a href="#" id="btn-toggle-mode" class="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline underline-offset-4 transition-colors">Đăng ký ngay</a>
                    </p>
                </div>
            </div>
        `;
        
        if (this.landingPage) {
            this.landingPage.appendChild(this.container);
        } else {
            this.appRoot.appendChild(this.container);
        }
    }

    openView(mode = 'login') {
        if (!this.container) this.renderView();
        
        // Ẩn tất cả nội dung của landing page trừ Header
        if (this.landingPage) {
            Array.from(this.landingPage.children).forEach(child => {
                // Giữ lại Header và container Auth
                if (child.tagName !== 'HEADER' && child.id !== 'auth-page') {
                    child.classList.add('hidden');
                }
            });
        }
        
        this.container.classList.remove('hidden');
        
        this.setMode(mode);
        this.clearAlert();
        this.container.querySelector('#auth-form').reset();

        // Animation in
        setTimeout(() => {
            const content = this.container.querySelector('#auth-card-content');
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 50);
    }

    closeView() {
        if (!this.container) return;
        this.container.remove();
        this.container = null;
    }

    setMode(mode) {
        this.currentMode = mode;
        const isLogin = mode === 'login';
        
        document.getElementById('auth-title').innerText = isLogin ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản';
        document.getElementById('auth-subtitle').innerText = isLogin ? 'Chào mừng bạn quay trở lại với Trợ lý AI' : 'Bắt đầu trải nghiệm ngay hôm nay';
        document.getElementById('btn-submit-auth').querySelector('span').innerText = isLogin ? 'Đăng nhập' : 'Đăng ký';
        document.getElementById('auth-toggle-text').innerHTML = isLogin 
            ? 'Chưa có tài khoản? <a href="#" id="btn-toggle-mode" class="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline underline-offset-4 transition-colors">Đăng ký ngay</a>'
            : 'Đã có tài khoản? <a href="#" id="btn-toggle-mode" class="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline underline-offset-4 transition-colors">Đăng nhập</a>';
            
        if (isLogin) {
            document.getElementById('field-fullname').classList.add('hidden');
            document.getElementById('field-email').classList.add('hidden');
            document.getElementById('auth-fullname').removeAttribute('required');
            document.getElementById('auth-email').removeAttribute('required');
        } else {
            document.getElementById('field-fullname').classList.remove('hidden');
            document.getElementById('field-email').classList.remove('hidden');
            document.getElementById('auth-fullname').setAttribute('required', 'true');
            document.getElementById('auth-email').setAttribute('required', 'true');
        }
    }

    showAlert(message, isSuccess = false) {
        const alert = document.getElementById('auth-alert');
        alert.innerText = message;
        alert.className = `mb-4 p-3.5 rounded-xl text-sm font-medium ${isSuccess ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`;
        alert.classList.remove('hidden');
    }

    clearAlert() {
        document.getElementById('auth-alert').classList.add('hidden');
    }

    setLoading(isLoading) {
        const btn = document.getElementById('btn-submit-auth');
        const spinner = document.getElementById('auth-spinner');
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
            if (e.target && e.target.id === 'btn-toggle-mode') {
                e.preventDefault();
                handler();
            }
        });
    }

    bindSubmit(handler) {
        this.container.querySelector('#auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('auth-username').value.trim();
            const password = document.getElementById('auth-password').value;
            const fullname = document.getElementById('auth-fullname').value.trim();
            const email = document.getElementById('auth-email').value.trim();
            handler(this.currentMode, { username, password, fullname, email });
        });
    }
}
