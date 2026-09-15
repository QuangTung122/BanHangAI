import AdminAuditView from '../views/pages/AdminAuditView.js';
import AuditModel from '../models/AuditModel.js';

export default class AdminAuditController {
    constructor() {
        this.view = new AdminAuditView();
        this.model = new AuditModel();
        
        this.currentPage = 1;
        this.filters = {};
        
        this.init();
    }

    async init() {
        this.view.render();
        await this.loadLogs();
        this.bindEvents();
    }

    async loadLogs() {
        const query = { ...this.filters, page: this.currentPage };
        await this.model.fetchLogs(query);
        this.view.renderLogs(this.model.logs, this.model.meta);
    }

    bindEvents() {
        const container = this.view.container;

        // Xử lý Lọc
        container.querySelector('#btn-filter').addEventListener('click', () => {
            this.filters = {
                action_type: container.querySelector('#filter-type').value,
                from_date: container.querySelector('#filter-from').value,
                to_date: container.querySelector('#filter-to').value,
                user_id: container.querySelector('#filter-uid').value
            };
            this.currentPage = 1; // Reset trang về 1 khi lọc
            this.loadLogs();
        });

        // Xử lý phân trang
        container.querySelector('#btn-prev').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadLogs();
            }
        });

        container.querySelector('#btn-next').addEventListener('click', () => {
            if (this.currentPage < this.model.meta.totalPages) {
                this.currentPage++;
                this.loadLogs();
            }
        });

        // Xử lý xem chi tiết JSON
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-view-json');
            if (btn) {
                const jsonStr = btn.getAttribute('data-json');
                this.view.showJsonModal(jsonStr);
            }
        });

        // Đóng modal
        container.querySelector('#btn-close-modal').addEventListener('click', () => {
            this.view.hideJsonModal();
        });
        container.querySelector('#json-modal').addEventListener('click', (e) => {
            if (e.target.id === 'json-modal') this.view.hideJsonModal();
        });
    }

    destroy() {
        if (this.view.container) {
            this.view.container.remove();
        }
    }
}
