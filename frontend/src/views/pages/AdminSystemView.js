export default class AdminSystemView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(configs) {
        let html = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col max-w-4xl mx-auto">
                <!-- Header -->
                <div class="p-6 border-b border-slate-100 shrink-0">
                    <h2 class="text-xl font-bold text-slate-800">Thiết lập Hệ thống AI (Ollama Engine)</h2>
                    <p class="text-sm text-slate-500 mt-1">Cấu hình kết nối với Mô hình Ngôn ngữ Lớn để xử lý tác vụ tự nhiên.</p>
                </div>
                
                <!-- Form Body -->
                <div class="p-8 space-y-8 flex-1 overflow-auto bg-slate-50/30">
                    
                    <!-- Khối 1: Kết nối Ollama -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">Địa chỉ Ollama Host</label>
                            <div class="flex gap-3">
                                <input type="text" id="cfg-ollama-host" value="${configs.ollama_host || ''}" class="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="http://localhost:11434">
                                <button id="btn-check-ollama" class="px-4 py-2.5 bg-white border border-slate-200 text-indigo-600 font-semibold rounded-xl text-sm hover:bg-indigo-50 hover:border-indigo-200 transition-colors flex items-center gap-2 shrink-0">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                    Kiểm tra kết nối
                                </button>
                            </div>
                            <p id="ollama-status" class="text-xs font-medium mt-2 hidden"></p>
                        </div>
                    </div>

                    <!-- Khối 2: Cấu hình Model -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">Mô hình AI đang chạy</label>
                            <select id="cfg-ai-model" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 cursor-pointer">
                                <option value="${configs.ai_model || ''}">${configs.ai_model || 'Vui lòng kiểm tra kết nối...'}</option>
                            </select>
                            <p class="text-xs text-slate-500 mt-2">Bấm 'Kiểm tra kết nối' để tải danh sách mô hình từ máy.</p>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">Giới hạn số Token (Max Tokens)</label>
                            <select id="cfg-ai-tokens" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 cursor-pointer">
                                <option value="1024" ${configs.ai_max_tokens == '1024' ? 'selected' : ''}>1024</option>
                                <option value="2048" ${configs.ai_max_tokens == '2048' ? 'selected' : ''}>2048</option>
                                <option value="4096" ${configs.ai_max_tokens == '4096' ? 'selected' : ''}>4096</option>
                                <option value="8192" ${configs.ai_max_tokens == '8192' ? 'selected' : ''}>8192</option>
                            </select>
                        </div>
                    </div>

                    <!-- Khối 3: Cấu hình Prompt -->
                    <div class="pt-4 border-t border-slate-100">
                        <label class="block text-sm font-bold text-slate-700 mb-2">Prompt Hệ Thống (Tính cách AI)</label>
                        <textarea id="cfg-ai-prompt" rows="4" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y">${configs.ai_system_prompt || ''}</textarea>
                    </div>

                    <!-- Khối 4: Cấu hình Temperature -->
                    <div>
                        <div class="flex justify-between items-end mb-2">
                            <label class="block text-sm font-bold text-slate-700">Temperature (Độ sáng tạo 0.0 - 1.0)</label>
                            <span id="temp-display" class="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">${configs.ai_temperature || '0.7'}</span>
                        </div>
                        <input type="range" id="cfg-ai-temp" min="0" max="1" step="0.1" value="${configs.ai_temperature || '0.7'}" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600">
                    </div>

                    <!-- Khối 5: Cấu hình Nhạc nền -->
                    <div class="pt-4 border-t border-slate-100">
                        <label class="block text-sm font-bold text-slate-700 mb-2">Link nhạc nền (Mini Player cho toàn hệ thống)</label>
                        <input type="text" id="cfg-bgm-url" value="${configs.bgm_url || ''}" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="https://domain.com/nhac.mp3">
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
                    <div class="flex gap-3">
                        <button id="btn-reset-data" class="px-5 py-2.5 bg-white border border-rose-200 text-rose-600 font-bold rounded-xl text-sm hover:bg-rose-50 transition-colors flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            Dọn dẹp Dữ liệu (Reset)
                        </button>
                        <button id="btn-backup-db" class="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-100 transition-colors flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            Sao lưu Dữ liệu (.db)
                        </button>
                    </div>
                    <button id="btn-save-config" class="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-lg transition-all flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
                        Lưu cấu hình hệ thống
                    </button>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
        this.bindSlider();
    }

    bindSlider() {
        const slider = document.getElementById('cfg-ai-temp');
        const display = document.getElementById('temp-display');
        if (slider && display) {
            slider.addEventListener('input', (e) => {
                display.innerText = parseFloat(e.target.value).toFixed(1);
            });
        }
    }

    updateModelDropdown(models, currentSelected) {
        const select = document.getElementById('cfg-ai-model');
        if (!select) return;

        if (models.length === 0) {
            select.innerHTML = '<option value="">Không tìm thấy mô hình nào trong Ollama</option>';
            return;
        }

        select.innerHTML = models.map(m => 
            `<option value="${m.name}" ${m.name === currentSelected ? 'selected' : ''}>${m.name}</option>`
        ).join('');
    }

    setOllamaStatus(success, message) {
        const p = document.getElementById('ollama-status');
        if (!p) return;
        p.classList.remove('hidden', 'text-emerald-600', 'text-rose-600');
        p.classList.add(success ? 'text-emerald-600' : 'text-rose-600');
        p.innerText = message;
    }
}
