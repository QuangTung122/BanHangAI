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

        // Sự kiện trên bảng (Dùng Event Delegation với hàm lưu tham chiếu để dọn dẹp)
        this.handleChange = async (e) => {
            // Đổi quyền
            if (e.target.classList.contains('quick-role-select')) {
                const id = e.target.dataset.id;
                const newRole = e.target.value;
                const res = await this.model.updateRole(id, newRole);
                if (res && res.success) {
                    if (window.showToast) {
                        window.showToast(res.message || 'Cập nhật quyền thành công', 'success');
                    }
                    await this.loadUsers(); // reload
                } else {
                    const msg = res?.message || 'Lỗi cập nhật quyền';
                    if (window.showToast) {
                        window.showToast(msg, 'error');
                    } else {
                        alert(msg);
                    }
                    const foundUser = this.model.users.find(u => u.id == id);
                    if (foundUser) e.target.value = foundUser.role; // reset
                }
            }

            // Đổi trạng thái (Toggle status)
            if (e.target.classList.contains('toggle-status')) {
                const id = e.target.dataset.id;
                const is_active = e.target.checked;
                const res = await this.model.toggleStatus(id, is_active);
                if (res && res.success) {
                    if (window.showToast) {
                        window.showToast(res.message || (is_active ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản'), 'success');
                    }
                    await this.loadUsers();
                } else {
                    const msg = res?.message || 'Lỗi thay đổi trạng thái tài khoản';
                    if (window.showToast) {
                        window.showToast(msg, 'error');
                    } else {
                        alert(msg);
                    }
                    e.target.checked = !is_active;
                }
            }
        };

        this.handleClick = async (e) => {
            // Nút Key: Cập nhật tài khoản & Cấp lại mật khẩu
            const btnEdit = e.target.closest('.btn-reset-pwd, .btn-edit-user');
            if (btnEdit) {
                const id = btnEdit.dataset.id;
                const user = this.model.users.find(u => u.id == id);
                if (user) {
                    this.view.renderEditModal(user);
                    this.bindEditModalEvents(user);
                } else {
                    alert('Không tìm thấy dữ liệu người dùng để cập nhật');
                }
                return;
            }

            // Nút Thùng rác: Xóa tài khoản người dùng
            const btnDelete = e.target.closest('.btn-delete-user');
            if (btnDelete) {
                const id = btnDelete.dataset.id;
                const user = this.model.users.find(u => u.id == id);
                const username = btnDelete.dataset.username || (user ? user.username : `#${id}`);

                // Chặn người dùng tự xóa tài khoản của chính mình
                const currentUser = this.authModel.user;
                if (currentUser && (currentUser.id == id || currentUser.username === username)) {
                    const warnMsg = 'Bạn không thể tự xóa tài khoản đang đăng nhập của chính mình!';
                    if (window.showToast) {
                        window.showToast(warnMsg, 'warning');
                    } else {
                        alert(warnMsg);
                    }
                    return;
                }

                this.view.renderDeleteModal(user || { id, username });
                this.bindDeleteModalEvents();
                return;
            }
        };

        container.addEventListener('change', this.handleChange);
        container.addEventListener('click', this.handleClick);
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
                if (res && res.success) {
                    if (window.showToast) {
                        window.showToast(res.message || 'Tạo tài khoản thành công', 'success');
                    }
                    this.view.closeModal();
                    await this.loadUsers();
                } else {
                    const errMsg = res?.message || 'Lỗi khi tạo tài khoản';
                    if (window.showToast) {
                        window.showToast(errMsg, 'error');
                    } else {
                        alert(errMsg);
                    }
                }
            });
        }
    }

    bindEditModalEvents(user) {
        const modal = document.getElementById('edit-user-modal');
        if (!modal) return;

        const btnClose = modal.querySelector('#btn-close-edit-modal');
        const btnCancel = modal.querySelector('#btn-cancel-edit-modal');
        const closeHandler = () => this.view.closeEditModal();

        if (btnClose) btnClose.addEventListener('click', closeHandler);
        if (btnCancel) btnCancel.addEventListener('click', closeHandler);

        // Bấm backdrop để đóng
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.view.closeEditModal();
        });

        // Nút điền sẵn mật khẩu 123456
        const btnQuickFill = modal.querySelector('#btn-quick-fill-pwd');
        const pwdInput = modal.querySelector('#edit-password');
        if (btnQuickFill && pwdInput) {
            btnQuickFill.addEventListener('click', () => {
                pwdInput.value = '123456';
                pwdInput.focus();
                if (window.showToast) {
                    window.showToast('Đã điền mật khẩu mặc định 123456', 'info');
                }
            });
        }

        // Nút cấp lại mật khẩu trực tiếp (1 cú click)
        const btnResetDirect = modal.querySelector('#btn-quick-reset-pwd-direct');
        if (btnResetDirect) {
            btnResetDirect.addEventListener('click', async () => {
                const targetPwd = (pwdInput && pwdInput.value.trim()) ? pwdInput.value.trim() : '123456';
                if (confirm(`Bạn có chắc muốn cấp lại mật khẩu cho tài khoản "${user.username}" thành "${targetPwd}"?`)) {
                    const res = await this.model.resetPassword(user.id, targetPwd);
                    if (res && res.success) {
                        if (window.showToast) {
                            window.showToast(res.message, 'success');
                        } else {
                            alert(res.message);
                        }
                        this.view.closeEditModal();
                        await this.loadUsers();
                    } else {
                        const errMsg = res?.message || 'Không thể cấp lại mật khẩu';
                        if (window.showToast) {
                            window.showToast(errMsg, 'error');
                        } else {
                            alert('❌ ' + errMsg);
                        }
                    }
                }
            });
        }

        // Form Submit cập nhật thông tin tài khoản
        const form = modal.querySelector('#edit-user-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = form.querySelector('#edit-user-id').value;
                const full_name = form.querySelector('#edit-fullname').value;
                const email = form.querySelector('#edit-email').value;
                const phone = form.querySelector('#edit-phone').value;
                const role = form.querySelector('#edit-role').value;
                const is_active = form.querySelector('#edit-status').value === '1';
                const password = form.querySelector('#edit-password').value;

                const payload = {
                    full_name,
                    email,
                    phone,
                    role,
                    is_active
                };

                if (password && password.trim().length > 0) {
                    payload.password = password.trim();
                }

                const res = await this.model.updateUser(id, payload);
                if (res && res.success) {
                    if (window.showToast) {
                        window.showToast(res.message || 'Cập nhật tài khoản thành công', 'success');
                    } else {
                        alert(res.message);
                    }
                    this.view.closeEditModal();
                    await this.loadUsers();
                } else {
                    const errMsg = res?.message || 'Lỗi khi cập nhật tài khoản';
                    if (window.showToast) {
                        window.showToast(errMsg, 'error');
                    } else {
                        alert('❌ ' + errMsg);
                    }
                }
            });
        }
    }

    bindDeleteModalEvents() {
        const modal = document.getElementById('delete-user-modal');
        if (!modal) return;

        const btnCancel = modal.querySelector('#btn-cancel-delete-modal');
        if (btnCancel) {
            btnCancel.addEventListener('click', () => this.view.closeDeleteModal());
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.view.closeDeleteModal();
        });

        const btnConfirm = modal.querySelector('#btn-confirm-delete-modal');
        if (btnConfirm) {
            btnConfirm.addEventListener('click', async () => {
                const id = btnConfirm.dataset.id;
                const username = btnConfirm.dataset.username;

                btnConfirm.disabled = true;
                btnConfirm.innerText = 'Đang xóa...';

                const res = await this.model.deleteUser(id);
                if (res && res.success) {
                    if (window.showToast) {
                        window.showToast(res.message || `Đã xóa tài khoản "${username}" thành công`, 'success');
                    } else {
                        alert(res.message);
                    }
                    this.view.closeDeleteModal();
                    await this.loadUsers();
                } else {
                    const errMsg = res?.message || 'Không thể xóa tài khoản';
                    if (window.showToast) {
                        window.showToast(errMsg, 'error');
                    } else {
                        alert('❌ Lỗi: ' + errMsg);
                    }
                    this.view.closeDeleteModal();
                }
            });
        }
    }

    destroy() {
        if (this.view) {
            if (this.view.closeEditModal) this.view.closeEditModal();
            if (this.view.closeDeleteModal) this.view.closeDeleteModal();
            if (this.view.closeModal) this.view.closeModal();
        }
        if (this.view && this.view.container) {
            if (this.handleClick) {
                this.view.container.removeEventListener('click', this.handleClick);
            }
            if (this.handleChange) {
                this.view.container.removeEventListener('change', this.handleChange);
            }
            this.view.container.innerHTML = '';
        }
    }
}
