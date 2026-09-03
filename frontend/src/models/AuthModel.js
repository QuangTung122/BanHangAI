import AuthService from '../services/AuthService.js';

export default class AuthModel {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.token = localStorage.getItem('token') || null;
    }

    isLoggedIn() {
        return !!this.token;
    }

    async login(username, password) {
        const { status, data } = await AuthService.login(username, password);
        if (data.success) {
            this.token = data.data.token;
            this.user = data.data.user;
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
        }
        return data;
    }

    async register(username, password, email, fullName) {
        const { status, data } = await AuthService.register(username, password, email, fullName);
        return data;
    }

    logout() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}
