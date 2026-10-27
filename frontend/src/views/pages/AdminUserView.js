export default class AdminUserView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(users) {
        let html = `
            <div class="h-full flex flex-col p-1 max-w-[1600px] mx-auto w-full">
                <!-- Main Card -->
                <div class="bg-white rounded-xl shadow-xs border border-[#e7eaf2] overflow-hidden flex flex-col flex-1">
                    <!-- Toolbar Tinh gọn -->
                    <div class="p-2.5 bg-[#fafbfd] border-b border-[#e7eaf2] flex flex-wrap gap-2.5 items-center justify-between">
                        <div class="flex items-center gap-2">
                            <div class="relative w-72">
                                <svg class="w-4 h-4 absolute left-3 top-2.5 text-[#7b8499]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                <input type="text" id="search-input" placeholder="Tìm tên đăng nhập, họ tên, email..." class="w-full pl-9 pr-3 py-1.5 bg-white border border-[#e7eaf2] rounded-lg text-xs font-medium text-[#182033] placeholder-[#7b8499] focus:outline-none focus:border-[#5745f5]">
                            </div>
                            <select id="role-filter" class="px-2.5 py-1.5 bg-white border border-[#e7eaf2] rounded-lg text-xs font-bold text-[#182033] outline-none focus:border-[#5745f5] cursor-pointer">
                                <option value="">Tất cả vai trò</option>
                                <option value="admin">Quản trị viên (Admin)</option>
                                <option value="owner">Chủ cửa hàng (Owner)</option>
                                <option value="staff">Nhân viên bán hàng (Staff)</option>
                            </select>
                        </div>

                        <button id="btn-add-user" class="px-3.5 py-1.5 bg-[#5745f5] hover:bg-[#4736e8] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
                            <span>Thêm tài khoản</span>
                        </button>
                    </div>

                    <!-- Table -->
                    <div class="flex-1 overflow-auto custom-scrollbar">
                        <table class="w-full text-left border-collapse min-w-[1000px]">
                            <thead class="bg-[#fafbfd] text-[#7b8499] text-[11px] uppercase font-black tracking-wider border-b border-[#e7eaf2] sticky top-0">
                                <tr>
                                    <th class="p-4">ID</th>
                                    <th class="p-4">Tên đăng nhập</th>
                                    <th class="p-4">Họ và tên</th>
                                    <th class="p-4">Email</th>
                                    <th class="p-4">Vai trò</th>
                                    <th class="p-4">Trạng thái</th>
                                    <th class="p-4">Ngày tạo</th>
                                    <th class="p-4 text-center">Đổi quyền nhanh</th>
                                    <th class="p-4 text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody id="user-table-body" class="divide-y divide-[#e7eaf2] text-xs font-medium">
                                ${this.renderTableRows(users)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Modal Thêm Tài khoản -->
            <div id="add-user-modal" class="fixed inset-0 bg-[#182033]/60 backdrop-blur-sm z-[100] hidden flex items-center justify-center p-4">
                <!-- Modal content injected via JS when needed -->
            </div>

            <!-- Modal Cập nhật Tài khoản & Cấp lại mật khẩu -->
            <div id="edit-user-modal" class="fixed inset-0 bg-[#182033]/60 backdrop-blur-sm z-[100] hidden flex items-center justify-center p-4">
                <!-- Modal content injected via JS when needed -->
            </div>

            <!-- Modal Xác nhận Xóa Tài khoản -->
            <div id="delete-user-modal" class="fixed inset-0 bg-[#182033]/60 backdrop-blur-sm z-[100] hidden flex items-center justify-center p-4">
                <!-- Modal content injected via JS when needed -->
            </div>
        `;
        
        this.container.innerHTML = html;
    }

    renderTableRows(users) {
        if (!users || users.length === 0) {
            return `<tr><td colspan="9" class="p-12 text-center">
            <div class="flex flex-col items-center justify-center">
                <div class="w-14 h-14 rounded-2xl bg-[#f0edff] flex items-center justify-center text-[#5745f5] mb-3">
                    <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                </div>
                <span class="text-[#182033] font-bold text-sm">Không có dữ liệu tài khoản</span>
                <span class="text-xs text-[#7b8499] mt-1">Không tìm thấy tài khoản phù hợp với điều kiện tìm kiếm</span>
            </div>
        </td></tr>`;
        }

        const roleLabels = {
            'admin': '<span class="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold">Admin</span>',
            'owner': '<span class="px-2.5 py-1 bg-[#f0edff] text-[#5745f5] border border-[#d8d0fc] rounded-lg text-[11px] font-bold">Chủ cửa hàng</span>',
            'staff': '<span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold">Nhân viên</span>',
            'customer': '<span class="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-[11px] font-bold">Khách hàng</span>'
        };

        return users.map((u, index) => {
            const date = new Date(u.created_at).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });
            return `
                <tr class="hover:bg-[#f8f9fc] transition-colors group">
                    <td class="p-4 text-[#7b8499] font-mono font-bold">#${u.id}</td>
                    <td class="p-4 font-bold text-[#182033]">
                        <div class="flex items-center gap-2">
                            <span class="w-7 h-7 rounded-lg bg-[#f0edff] text-[#5745f5] flex items-center justify-center font-black text-xs uppercase">
                                ${u.username ? u.username.charAt(0) : 'U'}
                            </span>
                            <span>${u.username}</span>
                        </div>
                    </td>
                    <td class="p-4 font-bold text-[#182033]">${u.full_name || '-'}</td>
                    <td class="p-4 text-[#7b8499]">${u.email || '-'}</td>
                    <td class="p-4">${roleLabels[u.role] || u.role}</td>
                    <td class="p-4">
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="sr-only peer toggle-status" data-id="${u.id}" ${u.is_active ? 'checked' : ''}>
                            <div class="w-9 h-5 bg-[#e7eaf2] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e7eaf2] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#149c79]"></div>
                            <span class="ml-2 text-[11px] font-bold ${u.is_active ? 'text-[#149c79]' : 'text-[#7b8499]'}">${u.is_active ? 'Hoạt động' : 'Đã khóa'}</span>
                        </label>
                    </td>
                    <td class="p-4 text-[#7b8499] text-[11px] font-mono">${date}</td>
                    <td class="p-4 text-center">
                        <select class="quick-role-select text-xs font-bold border border-[#e7eaf2] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all cursor-pointer text-[#182033] bg-[#f5f6fa]" data-id="${u.id}">
                            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="owner" ${u.role === 'owner' ? 'selected' : ''}>Chủ cửa hàng</option>
                            <option value="staff" ${u.role === 'staff' ? 'selected' : ''}>Nhân viên</option>
                        </select>
                    </td>
                    <td class="p-4 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button type="button" class="btn-reset-pwd btn-edit-user p-2 text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all flex items-center justify-center cursor-pointer border border-amber-200" data-id="${u.id}" data-username="${u.username}" title="Cập nhật tài khoản & Cấp lại mật khẩu">
                                <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                            </button>
                            <button type="button" class="btn-delete-user p-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all flex items-center justify-center cursor-pointer border border-rose-200" data-id="${u.id}" data-username="${u.username}" title="Xóa tài khoản người dùng">
                                <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
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
            <div class="bg-white rounded-2xl shadow-2xl border border-[#e7eaf2] w-full max-w-md transform scale-95 opacity-0 transition-all duration-300 overflow-hidden" id="add-modal-content">
                <div class="flex items-center justify-between p-5 border-b border-[#e7eaf2] bg-[#fafbfd]">
                    <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-xl bg-[#f0edff] text-[#5745f5] flex items-center justify-center font-bold">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
                        </div>
                        <h3 class="text-base font-black text-[#182033]">Thêm tài khoản mới</h3>
                    </div>
                    <button id="btn-close-modal" class="text-[#7b8499] hover:text-[#182033] p-1.5 rounded-lg transition-colors cursor-pointer"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                </div>
                <form id="add-user-form" class="p-5 space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Tên đăng nhập <span class="text-rose-500">*</span></label>
                        <input type="text" id="add-username" required placeholder="ví dụ: nv_kho_01" class="w-full px-3.5 py-2.5 bg-white border border-[#e7eaf2] rounded-xl text-xs text-[#182033] font-medium focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Mật khẩu ban đầu <span class="text-rose-500">*</span></label>
                        <input type="password" id="add-password" required placeholder="Tối thiểu 6 ký tự" class="w-full px-3.5 py-2.5 bg-white border border-[#e7eaf2] rounded-xl text-xs text-[#182033] font-medium focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Họ và tên</label>
                        <input type="text" id="add-fullname" placeholder="Nguyễn Văn A" class="w-full px-3.5 py-2.5 bg-white border border-[#e7eaf2] rounded-xl text-xs text-[#182033] font-medium focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Email</label>
                            <input type="email" id="add-email" placeholder="email@domain.com" class="w-full px-3.5 py-2.5 bg-white border border-[#e7eaf2] rounded-xl text-xs text-[#182033] font-medium focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Vai trò</label>
                            <select id="add-role" class="w-full px-3.5 py-2.5 bg-white border border-[#e7eaf2] rounded-xl text-xs font-bold text-[#182033] focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all cursor-pointer">
                                <option value="staff">Nhân viên</option>
                                <option value="owner">Chủ cửa hàng</option>
                                <option value="admin">Quản trị viên (Admin)</option>
                            </select>
                        </div>
                    </div>
                    <div class="pt-2">
                        <button type="submit" class="w-full py-2.5 bg-[#5745f5] hover:bg-[#4736e8] text-white font-bold rounded-xl shadow-sm shadow-[#5745f5]/20 text-xs transition-colors cursor-pointer">Tạo tài khoản</button>
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

    renderEditModal(user) {
        const modal = document.getElementById('edit-user-modal');
        if (!modal) return;

        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl border border-[#e7eaf2] w-full max-w-lg transform scale-95 opacity-0 transition-all duration-300 overflow-hidden" id="edit-modal-content">
                <!-- Header -->
                <div class="flex items-center justify-between p-5 border-b border-[#e7eaf2] bg-[#fafbfd]">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                        </div>
                        <div>
                            <h3 class="text-base font-black text-[#182033]">Cập nhật tài khoản</h3>
                            <p class="text-xs font-medium text-[#7b8499]">Chỉnh sửa hồ sơ hoặc cấp lại mật khẩu cho <span class="font-bold text-amber-700">@${user.username}</span></p>
                        </div>
                    </div>
                    <button type="button" id="btn-close-edit-modal" class="text-[#7b8499] hover:text-[#182033] p-1.5 rounded-lg transition-colors cursor-pointer">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <!-- Form -->
                <form id="edit-user-form" class="p-5 space-y-4">
                    <input type="hidden" id="edit-user-id" value="${user.id}">

                    <!-- Username & Role -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Tên đăng nhập</label>
                            <div class="relative">
                                <input type="text" value="${user.username}" disabled class="w-full px-3.5 py-2 bg-[#f5f6fa] border border-[#e7eaf2] rounded-xl text-xs text-[#7b8499] font-bold cursor-not-allowed">
                                <span class="absolute right-2.5 top-2 text-[10px] text-[#7b8499] font-bold">Cố định</span>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Vai trò hệ thống <span class="text-rose-500">*</span></label>
                            <select id="edit-role" class="w-full px-3.5 py-2 bg-white border border-[#e7eaf2] rounded-xl text-xs font-bold text-[#182033] focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all cursor-pointer">
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin (Quản trị viên)</option>
                                <option value="owner" ${user.role === 'owner' ? 'selected' : ''}>Chủ cửa hàng</option>
                                <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>Nhân viên bán hàng</option>
                            </select>
                        </div>
                    </div>

                    <!-- Full Name & Phone -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Họ và tên</label>
                            <input type="text" id="edit-fullname" value="${user.full_name || ''}" placeholder="Nhập họ và tên..." class="w-full px-3.5 py-2 bg-white border border-[#e7eaf2] rounded-xl text-xs text-[#182033] font-medium focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Số điện thoại</label>
                            <input type="text" id="edit-phone" value="${user.phone || ''}" placeholder="Nhập số điện thoại..." class="w-full px-3.5 py-2 bg-white border border-[#e7eaf2] rounded-xl text-xs text-[#182033] font-medium focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all">
                        </div>
                    </div>

                    <!-- Email & Status -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Email</label>
                            <input type="email" id="edit-email" value="${user.email || ''}" placeholder="example@store.com" class="w-full px-3.5 py-2 bg-white border border-[#e7eaf2] rounded-xl text-xs text-[#182033] font-medium focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-[#182033] uppercase mb-1">Trạng thái tài khoản</label>
                            <select id="edit-status" class="w-full px-3.5 py-2 bg-white border border-[#e7eaf2] rounded-xl text-xs font-bold text-[#182033] focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all cursor-pointer">
                                <option value="1" ${user.is_active ? 'selected' : ''}>✅ Đang hoạt động</option>
                                <option value="0" ${!user.is_active ? 'selected' : ''}>🔒 Đã khóa tài khoản</option>
                            </select>
                        </div>
                    </div>

                    <!-- Box: Cấp lại mật khẩu -->
                    <div class="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="text-amber-800 font-bold text-xs uppercase tracking-wider">🔑 Cấp lại mật khẩu</span>
                                <span class="text-xs text-amber-700">(Tùy chọn)</span>
                            </div>
                            <button type="button" id="btn-quick-fill-pwd" class="text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer" title="Điền sẵn 123456 vào ô">
                                ⚡ Điền 123456
                            </button>
                        </div>
                        <div class="relative">
                            <input type="text" id="edit-password" placeholder="Để trống nếu không muốn đổi mật khẩu" class="w-full pl-3.5 pr-32 py-2 bg-white border border-amber-300 rounded-xl text-xs text-[#182033] font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all">
                            <button type="button" id="btn-quick-reset-pwd-direct" data-id="${user.id}" data-username="${user.username}" class="absolute right-1.5 top-1.5 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all cursor-pointer" title="Đặt lại mật khẩu về 123456 ngay lập tức">
                                Cấp lại 123456
                            </button>
                        </div>
                        <p class="text-[11px] text-amber-800 leading-snug">
                            Nhập mật khẩu mới (tối thiểu 6 ký tự) hoặc bấm <strong>"Cấp lại 123456"</strong> để đặt mật khẩu mặc định ngay.
                        </p>
                    </div>

                    <!-- Buttons -->
                    <div class="flex items-center justify-end gap-3 pt-2">
                        <button type="button" id="btn-cancel-edit-modal" class="px-4 py-2 border border-[#e7eaf2] hover:bg-[#f5f6fa] text-[#182033] text-xs font-bold rounded-xl transition-colors cursor-pointer">
                            Hủy bỏ
                        </button>
                        <button type="submit" class="px-5 py-2 bg-[#5745f5] hover:bg-[#4736e8] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#5745f5]/20 transition-all cursor-pointer">
                            Lưu cập nhật
                        </button>
                    </div>
                </form>
            </div>
        `;

        modal.classList.remove('hidden');
        setTimeout(() => {
            const content = document.getElementById('edit-modal-content');
            if (content) content.classList.remove('scale-95', 'opacity-0');
        }, 10);
    }

    closeEditModal() {
        const modal = document.getElementById('edit-user-modal');
        if (modal) {
            const content = document.getElementById('edit-modal-content');
            if (content) content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    }

    renderDeleteModal(user) {
        const modal = document.getElementById('delete-user-modal');
        if (!modal) return;

        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl border border-[#e7eaf2] w-full max-w-md transform scale-95 opacity-0 transition-all duration-300 overflow-hidden" id="delete-modal-content">
                <div class="p-6 text-center space-y-4">
                    <div class="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shadow-inner">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    
                    <div>
                        <h3 class="text-base font-black text-[#182033]">Xác nhận xóa tài khoản</h3>
                        <p class="text-xs text-[#7b8499] mt-1">
                            Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản <strong class="text-rose-600 font-bold">"${user.username}"</strong> (#${user.id}) không?
                        </p>
                    </div>

                    <div class="bg-rose-50/70 border border-rose-200 rounded-xl p-3 text-left">
                        <p class="text-[11px] text-rose-800 leading-relaxed font-medium">
                            ⚠️ <strong>Cảnh báo:</strong> Toàn bộ tin nhắn và dữ liệu phụ trợ liên quan sẽ được xóa. Tài khoản đã phát sinh đơn hàng hoặc giao dịch tài chính sẽ không thể xóa (vui lòng chọn Khóa tài khoản thay thế).
                        </p>
                    </div>

                    <div class="flex items-center justify-center gap-3 pt-2">
                        <button type="button" id="btn-cancel-delete-modal" class="w-1/2 py-2.5 border border-[#e7eaf2] hover:bg-[#f5f6fa] text-[#182033] text-xs font-bold rounded-xl transition-colors cursor-pointer">
                            Hủy bỏ
                        </button>
                        <button type="button" id="btn-confirm-delete-modal" data-id="${user.id}" data-username="${user.username}" class="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer">
                            Xác nhận xóa
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        setTimeout(() => {
            const content = document.getElementById('delete-modal-content');
            if (content) content.classList.remove('scale-95', 'opacity-0');
        }, 10);
    }

    closeDeleteModal() {
        const modal = document.getElementById('delete-user-modal');
        if (modal) {
            const content = document.getElementById('delete-modal-content');
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
