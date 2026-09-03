import ApiClient from '../core/ApiClient.js';

class AttendanceService {
    async checkIn() {
        return await ApiClient.post('/attendance/check-in');
    }

    async checkOut() {
        return await ApiClient.post('/attendance/check-out');
    }

    async getMyRecords() {
        return await ApiClient.get('/attendance/my-records');
    }

    async getAllRecords(month = '') {
        const url = month ? `/attendance/all?month=${month}` : '/attendance/all';
        return await ApiClient.get(url);
    }
}

export default AttendanceService;
