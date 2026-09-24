import UserSettingsView from '../views/pages/UserSettingsView.js';
import AuthModel from '../models/AuthModel.js';

export default class UserSettingsController {
    constructor() {
        this.view = new UserSettingsView();
        this.authModel = new AuthModel();
        this.init();
    }

    async init() {
        this.view.render();
        await this.loadProfile();

        this.view.bindUpdateProfile(this.handleUpdateProfile.bind(this));
        this.view.bindChangePassword(this.handleChangePassword.bind(this));
    }

    async loadProfile() {
        try {
            const token = this.authModel.getToken();
            const res = await fetch('/api/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success && result.data) {
                this.view.fillProfileData(result.data);
            } else {
                if (window.showToast) window.showToast(result.message || 'Không thể tải thông tin', 'error');
            }
        } catch (error) {
            console.error('Lỗi tải profile:', error);
        }
    }

    async handleUpdateProfile(data) {
        try {
            const token = this.authModel.getToken();
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.success) {
                if (window.showToast) window.showToast(result.message || 'Cập nhật thành công', 'success');
                // Cập nhật lại AuthModel user info if needed
                if (data.full_name) {
                    const user = this.authModel.user;
                    user.full_name = data.full_name;
                    localStorage.setItem('user', JSON.stringify(user));
                }
            } else {
                if (window.showToast) window.showToast(result.message || 'Lỗi cập nhật', 'error');
            }
        } catch (error) {
            console.error('Lỗi update profile:', error);
            if (window.showToast) window.showToast('Lỗi kết nối', 'error');
        }
    }

    async handleChangePassword(data) {
        if (data.new_password !== data.confirm_password) {
            if (window.showToast) window.showToast('Mật khẩu xác nhận không khớp', 'error');
            return;
        }

        try {
            const token = this.authModel.getToken();
            const res = await fetch('/api/profile/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: data.current_password,
                    new_password: data.new_password
                })
            });
            const result = await res.json();
            if (result.success) {
                if (window.showToast) window.showToast(result.message || 'Đổi mật khẩu thành công', 'success');
                this.view.clearPasswordForm();
                // Tự động đăng xuất sau khi đổi mật khẩu (tùy chọn) hoặc logout
                setTimeout(() => {
                    this.authModel.logout();
                    window.location.reload();
                }, 2000);
            } else {
                if (window.showToast) window.showToast(result.message || 'Lỗi đổi mật khẩu', 'error');
            }
        } catch (error) {
            console.error('Lỗi đổi mật khẩu:', error);
            if (window.showToast) window.showToast('Lỗi kết nối', 'error');
        }
    }

    destroy() {
        if (this.view.container) {
            this.view.container.remove();
        }
    }
}
