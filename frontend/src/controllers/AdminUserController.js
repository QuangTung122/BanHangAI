import AdminUserView from '../views/pages/AdminUserView.js';
import UserModel from '../models/UserModel.js';
import AuthModel from '../models/AuthModel.js';

export default class AdminUserController {
    constructor() {
        this.view = new AdminUserView();
        this.model = new UserModel();
        this.authModel = new AuthModel(); // Dùng để kiểm tra ko cho tự khóa
        this.currentFilterRole = '';
        this.currentSearchText = '';
        
        this.init();
    }

    async init() {
        // Vẽ khung giao diện ban đầu (dữ liệu rỗng)
        this.view.render([]);
        
        // Load dữ liệu
        await this.loadUsers();
        
        // Gắn sự kiện
        this.bindEvents();
    }

    async loadUsers() {
        const response = await this.model.fetchUsers();
        if (response.success) {
            this.filterAndRender();
        } else {
            alert('Lỗi khi tải danh sách người dùng');
        }
    }

    filterAndRender() {
        let filtered = this.model.users;

        // Lọc theo Role
        if (this.currentFilterRole) {
            filtered = filtered.filter(u => u.role === this.currentFilterRole);
        }

        // Lọc theo Text
        if (this.currentSearchText) {
            const text = this.currentSearchText.toLowerCase();
            filtered = filtered.filter(u => 
                (u.username && u.username.toLowerCase().includes(text)) ||
                (u.full_name && u.full_name.toLowerCase().includes(text)) ||
                (u.email && u.email.toLowerCase().includes(text))
            );
        }

        this.view.updateTable(filtered);
    }

    bindEvents() {
        const container = this.view.container;

        // Filter events
        const searchInput = container.querySelector('#search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearchText = e.target.value.trim();
                this.filterAndRender();
            });
        }

        const roleFilter = container.querySelector('#role-filter');
        if (roleFilter) {
            roleFilter.addEventListener('change', (e) => {
                this.currentFilterRole = e.target.value;
                this.filterAndRender();
            });
        }

        // Nút Thêm tài khoản
        const btnAdd = container.querySelector('#btn-add-user');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => {
                this.view.renderAddModal();
                this.bindModalEvents();
            });
        }

        // Sự kiện trên bảng (Dùng Event Delegation)
        container.addEventListener('change', async (e) => {
            // Đổi quyền
            if (e.target.classList.contains('quick-role-select')) {
                const id = e.target.dataset.id;
                const newRole = e.target.value;
                const res = await this.model.updateRole(id, newRole);
                if (res.success) {
                    await this.loadUsers(); // reload
                } else {
                    alert(res.message);
                    e.target.value = this.model.users.find(u => u.id == id).role; // reset
                }
            }

            // Đổi trạng thái (Toggle status)
            if (e.target.classList.contains('toggle-status')) {
                const id = e.target.dataset.id;
                const is_active = e.target.checked;
                const res = await this.model.toggleStatus(id, is_active);
                if (res.success) {
                    await this.loadUsers();
                } else {
                    alert(res.message);
                    e.target.checked = !is_active;
                }
            }
        });

        container.addEventListener('click', async (e) => {
            // Nút reset password
            const btnReset = e.target.closest('.btn-reset-pwd');
            if (btnReset) {
                const id = btnReset.dataset.id;
                const user = this.model.users.find(u => u.id == id);
                if (confirm(`Bạn có chắc muốn đặt lại mật khẩu của ${user.username} về mặc định (123456)?`)) {
                    const res = await this.model.resetPassword(id);
                    alert(res.message);
                }
            }

            // Nút xóa tài khoản
            const btnDelete = e.target.closest('.btn-delete-user');
            if (btnDelete) {
                const id = btnDelete.dataset.id;
                const user = this.model.users.find(u => u.id == id);
                if (confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản ${user.username}?\n\nLưu ý: Chỉ có thể xóa tài khoản chưa phát sinh giao dịch!`)) {
                    const res = await this.model.deleteUser(id);
                    if (res && res.success) {
                        alert(res.message);
                        await this.loadUsers();
                    } else {
                        alert('❌ Lỗi: ' + (res?.message || 'Không thể xóa tài khoản'));
                    }
                }
            }
        });
    }

    bindModalEvents() {
        const modal = document.getElementById('add-user-modal');
        if (!modal) return;

        const btnClose = modal.querySelector('#btn-close-modal');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.view.closeModal());
        }

        // Bấm ra ngoài để đóng
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.view.closeModal();
        });

        const form = modal.querySelector('#add-user-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = form.querySelector('#add-username').value;
                const password = form.querySelector('#add-password').value;
                const full_name = form.querySelector('#add-fullname').value;
                const email = form.querySelector('#add-email').value;
                const role = form.querySelector('#add-role').value;

                const res = await this.model.createUser({ username, password, full_name, email, role });
                if (res.success) {
                    this.view.closeModal();
                    await this.loadUsers();
                } else {
                    alert(res.message);
                }
            });
        }
    }

    destroy() {
        if (this.view.container) {
            this.view.container.innerHTML = '';
        }
    }
}
