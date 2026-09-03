import ApiClient from '../core/ApiClient.js';

export default class AuthService {
    static async login(username, password) {
        return await ApiClient.post('/auth/login', { username, password });
    }

    static async register(username, password, email, fullName) {
        return await ApiClient.post('/auth/register', { 
            username, 
            password, 
            email, 
            full_name: fullName 
        });
    }
}
