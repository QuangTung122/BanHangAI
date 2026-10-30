export default class AdminAuditView {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'h-full flex flex-col gap-5 p-1 max-w-[1600px] mx-auto w-full';
    }

    render() {
        this.container.innerHTML = `
            <!-- Main Card -->
            <div class="bg-white rounded-xl shadow-xs border border-[#e7eaf2] overflow-hidden flex flex-col flex-1">
                <!-- Toolbar Filters Tinh gọn -->
                <div class="p-2.5 bg-[#fafbfd] border-b border-[#e7eaf2] flex gap-2 items-center flex-wrap">
                    <div class="w-36">
                        <select id="filter-type" class="w-full px-2.5 py-1.5 rounded-lg border border-[#e7eaf2] bg-white text-xs font-bold text-[#182033] focus:border-[#5745f5] outline-none cursor-pointer">
                            <option value="">Tất cả loại</option>
                            <option value="AUTH">Xác thực (AUTH)</option>
                            <option value="SYSTEM">Hệ thống (SYSTEM)</option>
                            <option value="DATA">Dữ liệu (DATA)</option>
                        </select>
                    </div>
                    <div class="w-36">
                        <input type="date" id="filter-from" class="w-full px-2.5 py-1.5 rounded-lg border border-[#e7eaf2] text-xs font-semibold text-[#182033] outline-none focus:border-[#5745f5] bg-white">
                    </div>
                    <div class="w-36">
                        <input type="date" id="filter-to" class="w-full px-2.5 py-1.5 rounded-lg border border-[#e7eaf2] text-xs font-semibold text-[#182033] outline-none focus:border-[#5745f5] bg-white">
                    </div>
                    <div class="w-24">
                        <input type="text" id="filter-uid" placeholder="User ID" class="w-full px-2.5 py-1.5 rounded-lg border border-[#e7eaf2] text-xs font-semibold text-[#182033] outline-none focus:border-[#5745f5] bg-white">
                    </div>
                    <button id="btn-filter" class="px-3.5 py-1.5 bg-[#5745f5] hover:bg-[#4736e8] text-white font-bold rounded-lg shadow-xs transition-all text-xs cursor-pointer flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                        <span>Lọc</span>
                    </button>
                </div>

                <!-- Table Content -->
                <div class="flex-1 overflow-auto">
                    <table class="w-full text-left border-collapse min-w-[800px]">
                        <thead class="bg-[#fafbfd] text-[#7b8499] text-xs uppercase font-black tracking-wider border-b border-[#e7eaf2]">
                            <tr>
                                <th class="p-4">Thời gian</th>
                                <th class="p-4">Tài khoản</th>
                                <th class="p-4">Phân loại</th>
                                <th class="p-4">Mô tả hành động</th>
                                <th class="p-4 text-center">Chi tiết payload</th>
                            </tr>
                        </thead>
                        <tbody id="log-table-body" class="text-xs text-[#182033] divide-y divide-[#e7eaf2] font-medium">
                            <tr><td colspan="5" class="text-center py-12 text-[#7b8499] font-medium">Đang tải nhật ký...</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- Phân trang -->
                <div class="p-4 border-t border-[#e7eaf2] flex justify-between items-center bg-[#fafbfd]">
                    <span class="text-xs text-[#7b8499] font-bold" id="page-info">Trang 1 / 1</span>
                    <div class="flex gap-2">
                        <button id="btn-prev" class="px-3.5 py-1.5 bg-white border border-[#e7eaf2] rounded-lg text-xs font-bold text-[#182033] hover:bg-[#f5f6fa] disabled:opacity-40 transition-colors cursor-pointer">Trước</button>
                        <button id="btn-next" class="px-3.5 py-1.5 bg-white border border-[#e7eaf2] rounded-lg text-xs font-bold text-[#182033] hover:bg-[#f5f6fa] disabled:opacity-40 transition-colors cursor-pointer">Sau</button>
                    </div>
                </div>
            </div>
            
            <!-- Modal xem JSON -->
            <div id="json-modal" class="fixed inset-0 bg-[#182033]/60 backdrop-blur-sm z-[100] hidden items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl border border-[#e7eaf2] w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
                    <div class="px-6 py-4 border-b border-[#e7eaf2] flex justify-between items-center bg-[#fafbfd]">
                        <div class="flex items-center gap-2">
                            <span class="w-8 h-8 rounded-lg bg-[#f0edff] text-[#5745f5] flex items-center justify-center font-bold text-xs">{}</span>
                            <h3 class="font-black text-sm text-[#182033]">Chi tiết Payload Nhật ký (JSON)</h3>
                        </div>
                        <button id="btn-close-modal" class="text-[#7b8499] hover:text-[#182033] p-1 rounded-lg cursor-pointer">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <div class="p-5 overflow-auto bg-[#182033] flex-1">
                        <pre id="json-content" class="text-xs text-emerald-400 font-mono leading-relaxed"></pre>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('content-area').appendChild(this.container);
    }

    renderLogs(logs, meta) {
        const tbody = this.container.querySelector('#log-table-body');
        
        if (!logs || logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-12 text-[#7b8499] font-medium">Không tìm thấy nhật ký phù hợp với điều kiện lọc</td></tr>`;
        } else {
            tbody.innerHTML = logs.map(l => {
                const time = new Date(l.created_at).toLocaleString('vi-VN');
                const badgeColor = l.action_type === 'AUTH' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 
                                  (l.action_type === 'SYSTEM' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200');
                                  
                return `
                    <tr class="hover:bg-[#f8f9fc] transition-colors">
                        <td class="py-3.5 px-4 font-mono text-[11px] text-[#7b8499] font-medium">${time}</td>
                        <td class="py-3.5 px-4">
                            ${l.username ? `<span class="font-bold text-[#182033]">${l.username}</span> <span class="text-[10px] font-bold text-[#7b8499]">#${l.user_id}</span>` : '<span class="italic text-[#7b8499]">Khách vãng lai / Hệ thống</span>'}
                        </td>
                        <td class="py-3.5 px-4">
                            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${badgeColor}">${l.action_type}</span>
                        </td>
                        <td class="py-3.5 px-4 font-semibold text-[#182033]">${l.action_desc}</td>
                        <td class="py-3.5 px-4 text-center">
                            ${l.details ? `<button class="btn-view-json text-[#5745f5] hover:text-[#4736e8] font-bold text-xs bg-[#f0edff] hover:bg-[#e6e0ff] border border-[#d8d0fc] px-2.5 py-1 rounded-lg transition-colors cursor-pointer" data-json='${l.details.replace(/'/g, "&#39;")}'>Xem JSON</button>` : '-'}
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Pagination info
        this.container.querySelector('#page-info').innerText = `Trang ${meta.page} / ${meta.totalPages} (Tổng: ${meta.total} bản ghi)`;
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
