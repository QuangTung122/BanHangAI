import ApiClient from '../core/ApiClient.js';

class UserService {
    async getUsers() {
        return await ApiClient.get('/users');
    }

    async createUser(data) {
        return await ApiClient.post('/users', data);
    }

    async changeRole(id, role) {
        return await ApiClient.request(`/users/${id}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
    }

    async toggleStatus(id, is_active) {
        return await ApiClient.request(`/users/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ is_active })
        });
    }

    async resetPassword(id) {
        return await ApiClient.request(`/users/${id}/reset-password`, {
            method: 'PUT'
        });
    }

    async deleteUser(id) {
        return await ApiClient.request(`/users/${id}`, {
            method: 'DELETE'
        });
    }
}

export default new UserService();
