
import UserService from '../services/UserService.js';

export default class UserModel {
    constructor() {
        this.users = [];
    }

    async fetchUsers() {
        const { data } = await UserService.getUsers();
        if (data.success) {
            this.users = data.data;
        }
        return data;
    }

    async createUser(payload) {
        const { data } = await UserService.createUser(payload);
        return data;
    }

    async updateUser(id, payload) {
        const { data } = await UserService.updateUser(id, payload);
        if (data && data.success && data.data) {
            const idx = this.users.findIndex(u => u.id == id);
            if (idx !== -1) {
                this.users[idx] = { ...this.users[idx], ...data.data };
            }
        }
        return data;
    }

    async updateRole(id, newRole) {
        const { data } = await UserService.changeRole(id, newRole);
        return data;
    }

    async toggleStatus(id, is_active) {
        const { data } = await UserService.toggleStatus(id, is_active);
        return data;
    }

    async resetPassword(id, newPassword = null) {
        const { data } = await UserService.resetPassword(id, newPassword);
        return data;
    }

    async deleteUser(id) {
        const { data } = await UserService.deleteUser(id);
        if (data && data.success) {
            this.users = this.users.filter(u => u.id != id);
        }
        return data;
    }
}
