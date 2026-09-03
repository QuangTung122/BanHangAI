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

    async updateRole(id, newRole) {
        const { data } = await UserService.changeRole(id, newRole);
        return data;
    }

    async toggleStatus(id, is_active) {
        const { data } = await UserService.toggleStatus(id, is_active);
        return data;
    }

    async resetPassword(id) {
        const { data } = await UserService.resetPassword(id);
        return data;
    }

    async deleteUser(id) {
        const { data } = await UserService.deleteUser(id);
        return data;
    }
}
