import ApiClient from '../core/ApiClient.js';

export default class DashboardService {
    static async getDashboardData() {
        return await ApiClient.get('/dashboard');
    }
}
