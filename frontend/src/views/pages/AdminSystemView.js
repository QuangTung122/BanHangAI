export default class AdminSystemView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(configs) {
        let html = `
            <div class="bg-white rounded-[24px] shadow-sm border border-slate-200/80 overflow-hidden flex flex-col max-w-4xl mx-auto">
                <!-- Header -->
                <div class="p-6 border-b border-slate-200 shrink-0 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 class="text-xl font-black text-slate-900">Thiết lập Hệ thống AI (Ollama / Gemini Engine)</h2>
                        <p class="text-sm font-medium text-slate-600 mt-1">Cấu hình kết nối với Mô hình Ngôn ngữ Lớn để xử lý tác vụ thông minh.</p>
                    </div>
                    <img src="assets/images/logo-system.png" alt="Server" class="w-16 h-16 object-contain drop-shadow-md hidden sm:block">
                </div>
                
                <!-- Form Body -->
                <div class="p-8 space-y-8 flex-1 overflow-auto bg-slate-50/30">
                    <!-- Khối 0: Chọn Provider -->
                    <div class="p-5 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl">
                        <label class="block text-sm font-black text-indigo-950 mb-2">Động cơ AI Đang Kích Hoạt (Active Provider)</label>
                        <select id="cfg-ai-provider" class="w-full md:w-1/2 px-4 py-2.5 bg-white border border-indigo-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all cursor-pointer">
                            <option value="ollama" ${configs.ai_provider === 'ollama' || !configs.ai_provider ? 'selected' : ''}>Ollama (Chạy nội bộ - Miễn phí)</option>
                            <option value="gemini" ${configs.ai_provider === 'gemini' ? 'selected' : ''}>Google Gemini (Cloud AI)</option>
                        </select>
                        <p class="text-xs font-semibold text-indigo-800 mt-2">Hệ thống sẽ sử dụng cấu hình của động cơ được chọn ở trên để xử lý hội thoại.</p>
                    </div>

                    <!-- Khối 1: Cấu hình Gemini -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200 transition-opacity duration-300" id="gemini-config-section">
                        <div class="col-span-1 md:col-span-2">
                            <h3 class="text-base font-black text-slate-900 flex items-center gap-2">
                                <svg class="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                                Cấu hình Google Gemini
                            </h3>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase mb-2">Mô hình Gemini</label>
                            <select id="cfg-gemini-model" class="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all cursor-pointer">
                                <option value="gemini-3.8-flash" ${!configs.gemini_model && !configs.ai_model || configs.gemini_model === 'gemini-3.8-flash' || configs.ai_model === 'gemini-3.8-flash' ? 'selected' : ''}>gemini-3.8-flash (Khuyến nghị)</option>
                                <option value="gemini-3.6-flash" ${configs.gemini_model === 'gemini-3.6-flash' || configs.ai_model === 'gemini-3.6-flash' ? 'selected' : ''}>gemini-3.6-flash (Dự phòng)</option>
                                <option value="gemini-3.1-flash-lite" ${configs.gemini_model === 'gemini-3.1-flash-lite' || configs.ai_model === 'gemini-3.1-flash-lite' ? 'selected' : ''}>gemini-3.1-flash-lite (Tiết kiệm)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase mb-2">Chế độ chọn mô hình</label>
                            <div class="inline-flex rounded-xl border border-slate-300 bg-white p-1 shadow-sm">
                                <button type="button" data-ai-model-mode="auto" aria-pressed="${(configs.ai_model_mode || 'auto') === 'auto'}" class="px-4 py-2 rounded-lg text-sm font-black transition-colors ${(configs.ai_model_mode || 'auto') === 'auto' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}">Auto</button>
                                <button type="button" data-ai-model-mode="manual" aria-pressed="${configs.ai_model_mode === 'manual'}" class="px-4 py-2 rounded-lg text-sm font-black transition-colors ${configs.ai_model_mode === 'manual' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}">Thủ công</button>
                            </div>
                            <p class="mt-2 text-xs font-medium text-slate-600">Auto thử model Gemini dự phòng khi model đã chọn lỗi hoặc quá tải. Thủ công chỉ gọi model đã chọn.</p>
                            <p id="ai-runtime-model" class="mt-1 text-xs font-bold text-indigo-700">${configs.ai_last_model ? `Model gần nhất: ${configs.ai_last_model}${configs.ai_last_model_reason === 'failover' ? ' (tự động chuyển)' : ''}` : 'Chưa có lượt gọi AI nào sau lần lưu cấu hình.'}</p>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase mb-2">API Key</label>
                            <input type="text" disabled value="Đã cấu hình an toàn trong file .env" class="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 cursor-not-allowed">
                        </div>
                    </div>

                    <!-- Khối 2: Cấu hình Ollama -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200 transition-opacity duration-300" id="ollama-config-section">
                        <div class="col-span-1 md:col-span-2">
                            <h3 class="text-base font-black text-slate-900 flex items-center gap-2">
                                <svg class="w-5 h-5 text-slate-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                                Cấu hình Ollama Local
                            </h3>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase mb-2">Địa chỉ Ollama Host</label>
                            <div class="flex gap-3">
                                <input type="text" id="cfg-ollama-host" value="${configs.ollama_host || 'http://127.0.0.1:11434'}" class="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all" placeholder="http://127.0.0.1:11434">
                                <button id="btn-check-ollama" class="px-4 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-lg text-sm hover:bg-indigo-100 transition-colors flex items-center gap-2 shrink-0 shadow-sm">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                    Kiểm tra kết nối
                                </button>
                            </div>
                            <p id="ollama-status" class="text-xs font-bold mt-2 hidden"></p>
                        </div>
                        
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase mb-2">Mô hình Ollama đang chạy</label>
                            <select id="cfg-ollama-model" class="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all cursor-pointer">
                                <option value="${configs.ollama_model || (!configs.ai_model?.startsWith('gemini') ? configs.ai_model : '') || ''}">${configs.ollama_model || (!configs.ai_model?.startsWith('gemini') ? configs.ai_model : '') || 'Vui lòng kiểm tra kết nối để tải danh sách...'}</option>
                            </select>
                        </div>
                    </div>

                    <!-- Khối 3: Cấu hình Chung -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase mb-2">Giới hạn số Token (Max Tokens)</label>
                            <select id="cfg-ai-tokens" class="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all cursor-pointer">
                                <option value="1024" ${configs.ai_max_tokens == '1024' ? 'selected' : ''}>1024</option>
                                <option value="2048" ${configs.ai_max_tokens == '2048' ? 'selected' : ''}>2048</option>
                                <option value="4096" ${configs.ai_max_tokens == '4096' ? 'selected' : ''}>4096</option>
                                <option value="8192" ${configs.ai_max_tokens == '8192' ? 'selected' : ''}>8192</option>
                            </select>
                        </div>
                        <div>
                            <div class="flex justify-between items-end mb-2">
                                <label class="block text-xs font-bold text-slate-700 uppercase">Temperature (Độ sáng tạo 0.0 - 1.0)</label>
                                <span id="temp-display" class="text-sm font-black text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-md">${configs.ai_temperature || '0.7'}</span>
                            </div>
                            <input type="range" id="cfg-ai-temp" min="0" max="1" step="0.1" value="${configs.ai_temperature || '0.7'}" class="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-3">
                        </div>
                    </div>

                    <!-- Khối 4: Cấu hình Prompt -->
                    <div class="pt-6 border-t border-slate-200">
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-2">Prompt Hệ Thống (Tính cách AI)</label>
                        <textarea id="cfg-ai-prompt" rows="4" class="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all resize-y">${configs.ai_system_prompt || ''}</textarea>
                    </div>

                    <!-- Khối 5: Cấu hình Nhạc nền -->
                    <div class="pt-6 border-t border-slate-200">
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-2">Link nhạc nền (Mini Player cho toàn hệ thống)</label>
                        <input type="text" id="cfg-bgm-url" value="${configs.bgm_url || ''}" class="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all" placeholder="https://domain.com/nhac.mp3">
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
                    <div class="flex gap-3">
                        <button id="btn-reset-data" class="px-5 py-2.5 bg-white border border-rose-300 text-rose-700 font-bold rounded-xl text-sm hover:bg-rose-50 transition-colors flex items-center gap-2 shadow-sm">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            Dọn dẹp Dữ liệu (Reset)
                        </button>
                        <button id="btn-backup-db" class="px-5 py-2.5 bg-white border border-slate-300 text-slate-800 font-bold rounded-xl text-sm hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-sm">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            Sao lưu Dữ liệu (.db)
                        </button>
                    </div>
                    <button id="btn-save-config" class="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2">
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
        const select = document.getElementById('cfg-ollama-model');
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
