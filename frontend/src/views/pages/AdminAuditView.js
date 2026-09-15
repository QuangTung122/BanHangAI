export default class AdminAuditView {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'h-full flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden';
    }

    render() {
        this.container.innerHTML = `
            <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-800">Nhật ký hoạt động</h2>
                    <p class="text-sm text-slate-500 font-medium mt-1">Lưu vết thao tác người dùng & hệ thống</p>
                </div>
            </div>
            
            <div class="p-6 bg-white border-b border-slate-100 flex gap-4 items-end flex-wrap">
                <div class="w-48">
                    <label class="block text-xs font-bold text-slate-700 mb-1">Loại hành động</label>
                    <select id="filter-type" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="">Tất cả</option>
                        <option value="AUTH">Xác thực (Auth)</option>
                        <option value="SYSTEM">Hệ thống (System)</option>
                        <option value="DATA">Dữ liệu (Data)</option>
                    </select>
                </div>
                <div class="w-40">
                    <label class="block text-xs font-bold text-slate-700 mb-1">Từ ngày</label>
                    <input type="date" id="filter-from" class="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div class="w-40">
                    <label class="block text-xs font-bold text-slate-700 mb-1">Đến ngày</label>
                    <input type="date" id="filter-to" class="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div class="w-32">
                    <label class="block text-xs font-bold text-slate-700 mb-1">User ID</label>
                    <input type="text" id="filter-uid" placeholder="ID..." class="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <button id="btn-filter" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors text-sm h-[42px]">
                    Lọc Logs
                </button>
            </div>

            <div class="flex-1 overflow-auto p-6">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                            <th class="pb-3 px-4">Thời gian</th>
                            <th class="pb-3 px-4">User</th>
                            <th class="pb-3 px-4">Loại</th>
                            <th class="pb-3 px-4">Hành động</th>
                            <th class="pb-3 px-4 text-center">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody id="log-table-body" class="text-sm text-slate-700">
                        <tr><td colspan="5" class="text-center py-10 text-slate-500">Đang tải...</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- Phân trang -->
            <div class="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                <span class="text-sm text-slate-500 font-medium" id="page-info">Trang 1 / 1</span>
                <div class="flex gap-2">
                    <button id="btn-prev" class="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Trước</button>
                    <button id="btn-next" class="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Sau</button>
                </div>
            </div>
            
            <!-- Modal xem JSON -->
            <div id="json-modal" class="fixed inset-0 bg-slate-900/50 z-[100] hidden items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
                    <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 class="font-bold text-slate-800">Chi tiết Log (JSON)</h3>
                        <button id="btn-close-modal" class="text-slate-400 hover:text-rose-500">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <div class="p-6 overflow-auto bg-slate-900 flex-1">
                        <pre id="json-content" class="text-xs text-emerald-400 font-mono"></pre>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('content-area').appendChild(this.container);
    }

    renderLogs(logs, meta) {
        const tbody = this.container.querySelector('#log-table-body');
        
        if (!logs || logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-slate-500 font-medium">Không tìm thấy nhật ký nào</td></tr>`;
        } else {
            tbody.innerHTML = logs.map(l => {
                const time = new Date(l.created_at).toLocaleString('vi-VN');
                const badgeColor = l.action_type === 'AUTH' ? 'bg-blue-100 text-blue-700' : 
                                  (l.action_type === 'SYSTEM' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700');
                                  
                return `
                    <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td class="py-3 px-4 font-medium text-slate-600">${time}</td>
                        <td class="py-3 px-4">
                            ${l.username ? `<span class="font-bold text-slate-800">${l.username}</span> <span class="text-xs text-slate-400">#${l.user_id}</span>` : '<span class="italic text-slate-400">Khách/Hệ thống</span>'}
                        </td>
                        <td class="py-3 px-4">
                            <span class="px-2.5 py-1 rounded-md text-[11px] font-bold ${badgeColor}">${l.action_type}</span>
                        </td>
                        <td class="py-3 px-4 font-medium text-slate-700">${l.action_desc}</td>
                        <td class="py-3 px-4 text-center">
                            ${l.details ? `<button class="btn-view-json text-indigo-600 hover:text-indigo-800 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-lg" data-json='${l.details.replace(/'/g, "&#39;")}'>Xem JSON</button>` : '-'}
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Pagination info
        this.container.querySelector('#page-info').innerText = `Trang ${meta.page} / ${meta.totalPages} (Tổng: ${meta.total})`;
        this.container.querySelector('#btn-prev').disabled = meta.page <= 1;
        this.container.querySelector('#btn-next').disabled = meta.page >= meta.totalPages;
    }

    showJsonModal(jsonString) {
        try {
            const obj = JSON.parse(jsonString);
            this.container.querySelector('#json-content').innerText = JSON.stringify(obj, null, 2);
        } catch {
            this.container.querySelector('#json-content').innerText = jsonString;
        }
        this.container.querySelector('#json-modal').classList.remove('hidden');
        this.container.querySelector('#json-modal').classList.add('flex');
    }

    hideJsonModal() {
        this.container.querySelector('#json-modal').classList.add('hidden');
        this.container.querySelector('#json-modal').classList.remove('flex');
    }
}
