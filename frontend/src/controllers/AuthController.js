import AuthModel from '../models/AuthModel.js?v=209';
import AuthView from '../views/pages/AuthView.js?v=210';

export default class AuthController {
    constructor() {
        this.model = new AuthModel();
        this.view = new AuthView();
        
        this.init();
    }

    init() {
        // Khởi tạo Views
        this.view.renderView();
        this.view.bindToggleMode(this.handleToggleMode.bind(this));
        this.view.bindSubmit(this.handleSubmit.bind(this));
    }

    open(mode) {
        if (this.model.isLoggedIn()) {
            const userName = this.model.user.full_name || this.model.user.username;
            alert(`Bạn đã đăng nhập với tên: ${userName}`);
            return;
        }
        this.view.openView(mode);
    }

    handleToggleMode() {
        const newMode = this.view.currentMode === 'login' ? 'register' : 'login';
        this.view.setMode(newMode);
        this.view.clearAlert();
    }

    async handleSubmit(mode, data) {
        this.view.setLoading(true);
        this.view.clearAlert();
        
        let response;
        if (mode === 'login') {
            response = await this.model.login(data.username, data.password);
        } else {
            response = await this.model.register(data.username, data.password, data.email, data.fullname);
        }

        this.view.setLoading(false);

        if (response.success) {
            this.view.showAlert(response.message, true);
            if (mode === 'login') {
                // Đăng nhập thành công -> Bắn event để app.js chuyển sang Master Layout
                setTimeout(() => {
                    window.dispatchEvent(new Event('auth-success'));
                }, 800);
            } else {
                // Đăng ký xong -> chuyển sang form đăng nhập
                setTimeout(() => {
                    this.view.setMode('login');
                    this.view.showAlert('Vui lòng đăng nhập bằng tài khoản vừa tạo', true);
                    this.view.container.querySelector('#auth-username').value = data.username;
                    this.view.container.querySelector('#auth-password').value = '';
                }, 1500);
            }
        } else {
            this.view.showAlert(response.message || 'Có lỗi xảy ra', false);
        }
    }

    destroy() {
        this.view.closeView();
    }
}
