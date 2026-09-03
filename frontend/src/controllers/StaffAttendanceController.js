import StaffAttendanceView from '../views/pages/StaffAttendanceView.js';
import AttendanceService from '../services/AttendanceService.js';

export default class StaffAttendanceController {
    constructor() {
        this.view = new StaffAttendanceView();
        this.attendanceService = new AttendanceService();
        this.records = [];
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.bindEvents();
    }

    async loadData() {
        try {
            const res = await this.attendanceService.getMyRecords();
            if (res.data && res.data.success) {
                this.records = res.data.data;
                this.view.render(this.records);
            }
        } catch (err) {
            console.error('Lỗi lấy lịch sử chấm công:', err);
        }
    }

    bindEvents() {
        const container = this.view.container;
        
        container.addEventListener('click', async (e) => {
            const btnCheckin = e.target.closest('#btn-attendance-checkin');
            const btnCheckout = e.target.closest('#btn-attendance-checkout');
            
            if (btnCheckin) {
                try {
                    const res = await this.attendanceService.checkIn();
                    if (res.data && res.data.success) {
                        alert('✅ ' + res.data.message);
                        this.loadData(); // Tải lại bảng
                    } else {
                        alert('❌ Lỗi: ' + (res.data?.message || 'Không thể check-in'));
                    }
                } catch (err) {
                    alert('❌ Lỗi kết nối');
                }
            }
            
            if (btnCheckout) {
                if (!confirm('Bạn có chắc chắn muốn TAN CA không? Thao tác này sẽ chốt giờ làm ngày hôm nay!')) return;
                try {
                    const res = await this.attendanceService.checkOut();
                    if (res.data && res.data.success) {
                        alert('✅ ' + res.data.message);
                        this.loadData();
                    } else {
                        alert('❌ Lỗi: ' + (res.data?.message || 'Không thể check-out'));
                    }
                } catch (err) {
                    alert('❌ Lỗi kết nối');
                }
            }
        });
    }

    destroy() {
        if (this.view.clockInterval) {
            clearInterval(this.view.clockInterval);
        }
        if (this.view.container) {
            this.view.container.innerHTML = '';
        }
    }
}
