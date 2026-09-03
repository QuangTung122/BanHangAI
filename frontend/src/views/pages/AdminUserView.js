export default class AdminUserView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(users) {
        let html = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <!-- Header -->
                <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                    <div>
                        <h2 class="text-xl font-bold text-slate-800">Quản lý Tài khoản Hệ thống</h2>
                        <p class="text-sm text-slate-500 mt-1">Quản lý và cấp quyền truy cập cho nhân sự hệ thống.</p>
                    </div>
                    <button id="btn-add-user" class="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Thêm tài khoản mới
                    </button>
                </div>
                
                <!-- Toolbar -->
                <div class="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between shrink-0">
                    <div class="relative w-full max-w-sm">
                        <svg class="w-4 h-4 absolute left-3 top-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <input type="text" id="search-input" placeholder="Tìm tên đăng nhập, họ tên, email..." class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                    </div>
                    <div class="flex items-center gap-3">
                        <select id="role-filter" class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 cursor-pointer">
                            <option value="">Tất cả vai trò</option>
                            <option value="admin">Admin</option>
                            <option value="owner">Chủ cửa hàng</option>
                            <option value="staff">Nhân viên bán hàng</option>
                            
                        </select>
                    </div>
                </div>

                <!-- Table -->
                <div class="flex-1 overflow-auto">
                    <table class="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr class="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                                <th class="p-4 font-medium">ID</th>
                                <th class="p-4 font-medium">Tên đăng nhập</th>
                                <th class="p-4 font-medium">Họ và tên</th>
                                <th class="p-4 font-medium">Email</th>
                                <th class="p-4 font-medium">Vai trò</th>
                                <th class="p-4 font-medium">Trạng thái</th>
                                <th class="p-4 font-medium">Ngày tạo</th>
                                <th class="p-4 font-medium text-center">Đổi quyền nhanh</th>
                                <th class="p-4 font-medium text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody id="user-table-body" class="divide-y divide-slate-100 text-sm">
                            ${this.renderTableRows(users)}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Modal Thêm Tài khoản -->
            <div id="add-user-modal" class="fixed inset-0 bg-slate-900/50 z-[100] hidden flex items-center justify-center p-4">
                <!-- Modal content injected via JS when needed -->
            </div>
        `;
        
        this.container.innerHTML = html;
    }

    renderTableRows(users) {
        if (!users || users.length === 0) {
            return `<tr><td colspan="9" class="p-8 text-center text-slate-400">Không có dữ liệu tài khoản</td></tr>`;
        }

        const roleLabels = {
            'admin': '<span class="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold">Admin</span>',
            'owner': '<span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">Chủ cửa hàng</span>',
            'staff': '<span class="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">Nhân viên bán hàng</span>',
            'customer': '<span class="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">Khách hàng</span>'
        };

        return users.map((u, index) => {
            const date = new Date(u.created_at).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });
            return `
                <tr class="hover:bg-slate-50/50 transition-colors group">
                    <td class="p-4 text-slate-500 font-medium">#${u.id}</td>
                    <td class="p-4 font-bold text-slate-800">${u.username}</td>
                    <td class="p-4 text-slate-600">${u.full_name || '-'}</td>
                    <td class="p-4 text-slate-500">${u.email || '-'}</td>
                    <td class="p-4">${roleLabels[u.role] || u.role}</td>
                    <td class="p-4">
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="sr-only peer toggle-status" data-id="${u.id}" ${u.is_active ? 'checked' : ''}>
                            <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                            <span class="ml-2 text-xs font-medium ${u.is_active ? 'text-emerald-600' : 'text-slate-400'}">${u.is_active ? 'Hoạt động' : 'Đã khóa'}</span>
                        </label>
                    </td>
                    <td class="p-4 text-slate-500 text-xs">${date}</td>
                    <td class="p-4 text-center">
                        <select class="quick-role-select text-xs font-medium border border-slate-200 rounded p-1 outline-none focus:border-indigo-500 cursor-pointer text-slate-700 bg-slate-50 hover:bg-white" data-id="${u.id}">
                            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="owner" ${u.role === 'owner' ? 'selected' : ''}>Chủ cửa hàng</option>
                            <option value="staff" ${u.role === 'staff' ? 'selected' : ''}>Nhân viên</option>
                            
                        </select>
                    </td>
                    <td class="p-4 text-center">
                        <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button class="btn-reset-pwd p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded" data-id="${u.id}" title="Đặt lại mật khẩu">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                            </button>
                            <button class="btn-delete-user p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded" data-id="${u.id}" title="Xóa tài khoản">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderAddModal() {
        const modal = document.getElementById('add-user-modal');
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md transform scale-95 opacity-0 transition-all duration-300" id="add-modal-content">
                <div class="flex items-center justify-between p-5 border-b border-slate-100">
                    <h3 class="text-lg font-bold text-slate-800">Thêm tài khoản mới</h3>
                    <button id="btn-close-modal" class="text-slate-400 hover:text-slate-600"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                </div>
                <form id="add-user-form" class="p-5 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập <span class="text-red-500">*</span></label>
                        <input type="text" id="add-username" required class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Mật khẩu <span class="text-red-500">*</span></label>
                        <input type="password" id="add-password" required class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                        <input type="text" id="add-fullname" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" id="add-email" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
                            <select id="add-role" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                                <option value="staff">Nhân viên</option>
                                <option value="owner">Chủ cửa hàng</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div class="pt-2">
                        <button type="submit" class="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">Tạo tài khoản</button>
                    </div>
                </form>
            </div>
        `;
        
        modal.classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('add-modal-content').classList.remove('scale-95', 'opacity-0');
        }, 10);
    }

    closeModal() {
        const modal = document.getElementById('add-user-modal');
        if (modal) {
            const content = document.getElementById('add-modal-content');
            if (content) content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    }

    updateTable(users) {
        const tbody = document.getElementById('user-table-body');
        if (tbody) tbody.innerHTML = this.renderTableRows(users);
    }
}
