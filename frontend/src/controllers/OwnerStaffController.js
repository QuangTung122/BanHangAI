import OwnerStaffView from '../views/pages/OwnerStaffView.js';
import AttendanceService from '../services/AttendanceService.js';
import ApiClient from '../core/ApiClient.js';

export default class OwnerStaffController {
    constructor() {
        this.view = new OwnerStaffView();
        this.attendanceService = new AttendanceService();
        
        this.records = [];
        this.users = [];
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        this.currentMonth = `${yyyy}-${mm}`;
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.bindEvents();
    }

    async loadData() {
        try {
            // Fetch users first
            const userRes = await ApiClient.get('/users');
            if (userRes.data && userRes.data.success) {
                this.users = userRes.data.data.filter(u => u.role !== 'owner');
            }
            
            // Fetch attendance
            const attRes = await this.attendanceService.getAllRecords(this.currentMonth);
            if (attRes.data && attRes.data.success) {
                this.records = attRes.data.data.filter(r => r.role !== 'owner');
            }
            
            this.view.render(this.records, this.users, this.currentMonth);
        } catch (err) {
            console.error('Lỗi lấy dữ liệu nhân sự:', err);
        }
    }

    bindEvents() {
        const container = this.view.container;
        
        container.addEventListener('click', async (e) => {
            // Chuyển tab
            const tabBtn = e.target.closest('.tab-btn');
            if (tabBtn) {
                this.view.activeTab = tabBtn.dataset.tab;
                this.view.render(this.records, this.users, this.currentMonth); // Render lại với tab mới
                return;
            }

            // Đổi mức lương
            const btnSave = e.target.closest('.btn-save-wage');
            if (btnSave) {
                const tr = btnSave.closest('tr');
                const id = tr.dataset.id;
                const input = tr.querySelector('.input-wage');
                const newWage = input.value;
                
                try {
                    const res = await ApiClient.put(`/users/${id}/wage`, { hourly_wage: newWage });
                    if (res.data && res.data.success) {
                        alert('✅ ' + res.data.message);
                        this.loadData();
                    } else {
                        alert('❌ Lỗi: ' + (res.data?.message || 'Cập nhật thất bại'));
                    }
                } catch (error) {
                    alert('❌ Lỗi kết nối');
                }
                return;
            }

            // Xuất Excel
            const btnExport = e.target.closest('#btn-export-excel');
            if (btnExport) {
                this.exportExcel();
            }
        });

        // Đổi tháng chấm công
        container.addEventListener('change', (e) => {
            if (e.target.id === 'filter-month') {
                this.currentMonth = e.target.value;
                this.loadData();
            }
        });
    }

    exportExcel() {
        // Gom nhóm theo nhân viên
        const summary = {};
        this.records.forEach(r => {
            const name = r.full_name || r.username;
            if (!summary[name]) {
                summary[name] = { 
                    name: name, 
                    role: r.role,
                    wage: r.hourly_wage || 0, 
                    standard_hours: 0, 
                    ot_hours: 0,
                    days: 0 
                };
            }
            if (r.total_daily_hours) {
                summary[name].standard_hours += parseFloat(r.standard_hours || 0);
                summary[name].ot_hours += parseFloat(r.ot_hours || 0);
                summary[name].days += 1;
            }
        });
        
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += "Tên Nhân Viên,Chức Vụ,Số Ngày Công,Giờ Chuẩn (x1),Giờ Tăng Ca (x1.5),Lương / Giờ,Tiền Giờ Chuẩn,Tiền OT,Tổng Lương\n";
        
        Object.values(summary).forEach(s => {
            const standardMoney = s.standard_hours * s.wage;
            const otMoney = s.ot_hours * s.wage * 1.5;
            const totalMoney = standardMoney + otMoney;
            csvContent += `"${s.name}","${s.role}",${s.days},${s.standard_hours.toFixed(2)},${s.ot_hours.toFixed(2)},${s.wage},${standardMoney},${otMoney},${totalMoney}\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Bang_Luong.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    destroy() {
        if (this.view.container) {
            this.view.container.innerHTML = '';
        }
    }
}
