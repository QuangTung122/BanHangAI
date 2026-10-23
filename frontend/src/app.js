import AuthController from './controllers/AuthController.js?v=211';
import AuthModel from './models/AuthModel.js?v=209';
import LayoutController from './controllers/LayoutController.js?v=209';
import ChatController from './controllers/ChatController.js';

class App {
    constructor() {
        this.authModel = new AuthModel();
        this.currentController = null;
        this.publicChatController = null;
    }

    init() {
        console.log('Hệ thống E-Com AI đang khởi động...');
        
        window.addEventListener('auth-success', () => {
            this.publicChatController?.destroy();
            this.publicChatController = null;
            this.bootMasterLayout();
        });
        window.addEventListener('auth-logout', () => {
            localStorage.removeItem('bot_token');
            window.location.reload(); // Reload toàn trang để về trang bìa cho sạch
        });

        if (this.authModel.isLoggedIn()) {
            this.bootMasterLayout();
        } else {
            this.bindLandingPage();
            this.publicChatController = new ChatController();
        }
    }

    bindLandingPage() {
        // Gắn sự kiện cho các nút trên trang bìa
        const btnLogin = document.getElementById('btn-nav-login');
        const btnRegister = document.getElementById('btn-nav-register');
        const btnHeroLogin = document.getElementById('btn-hero-login');
        
        const openAuth = (mode) => {
            // Không xóa DOM, chỉ tạo AuthController để nó đè lên hoặc ẩn trang bìa
            if (this.currentController && typeof this.currentController.destroy === 'function') {
                this.currentController.destroy();
            }
            this.currentController = new AuthController();
            this.currentController.open(mode);
        };

        if (btnLogin) btnLogin.addEventListener('click', (e) => { e.preventDefault(); openAuth('login'); });
        if (btnRegister) btnRegister.addEventListener('click', (e) => { e.preventDefault(); openAuth('register'); });
        if (btnHeroLogin) btnHeroLogin.addEventListener('click', (e) => { e.preventDefault(); openAuth('login'); });
    }

    bootMasterLayout() {
        if (this.currentController && typeof this.currentController.destroy === 'function') {
            this.currentController.destroy();
        }
        document.getElementById('app-root').innerHTML = ''; // Dọn dẹp DOM sạch sẽ
        
        this.currentController = new LayoutController();
    }
}

const bootstrap = () => {
    const app = new App();
    app.init();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
