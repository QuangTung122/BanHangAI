export default class AdminSystemView {
    constructor() {
        this.container = document.getElementById('content-area');
    }

    render(configs) {
        let html = `
            <div class="h-full flex flex-col p-1 max-w-[1200px] mx-auto w-full">
                <!-- Main Card -->
                <div class="bg-white rounded-xl shadow-xs border border-[#e7eaf2] overflow-hidden flex flex-col flex-1">
                    <!-- Card Top Header Tinh gọn -->
                    <div class="p-2.5 px-4 bg-[#fafbfd] border-b border-[#e7eaf2] flex items-center justify-between">
                        <span class="text-xs font-black text-[#182033] uppercase tracking-wider">Cấu hình Động cơ AI (Ollama / Gemini)</span>
                        <button id="btn-save-config" class="px-3.5 py-1.5 bg-[#5745f5] hover:bg-[#4736e8] text-white font-bold rounded-lg text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
                            <span>Lưu cấu hình</span>
                        </button>
                    </div>

                    <!-- Form Body -->
                    <div class="p-4 md:p-5 space-y-4 flex-1 overflow-auto custom-scrollbar">
                        <!-- Khối 0: Chọn Provider -->
                        <div class="p-5 bg-[#f0edff] border border-[#d8d0fc] rounded-2xl">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="w-2 h-2 rounded-full bg-[#5745f5] animate-ping"></span>
                                <label class="text-xs font-black text-[#182033] uppercase tracking-wider">Động cơ AI Đang Kích Hoạt (Active Engine)</label>
                            </div>
                            <select id="cfg-ai-provider" class="w-full md:w-1/2 px-4 py-2.5 bg-white border border-[#d8d0fc] rounded-xl text-xs font-bold text-[#182033] focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/20 shadow-sm transition-all cursor-pointer">
                                <option value="ollama" ${configs.ai_provider === 'ollama' || !configs.ai_provider ? 'selected' : ''}>Ollama (Chạy máy chủ nội bộ - Miễn phí)</option>
                                <option value="gemini" ${configs.ai_provider === 'gemini' ? 'selected' : ''}>Google Gemini (Cloud AI thông minh)</option>
                            </select>
                            <p class="text-[11px] font-medium text-[#5745f5] mt-2">Hệ thống sẽ chuyển tiếp tin nhắn hội thoại và đơn hàng thông minh qua động cơ đã chọn.</p>
                        </div>

                        <!-- Khối 1: Cấu hình Gemini -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 border-t border-[#e7eaf2] transition-opacity duration-300" id="gemini-config-section">
                            <div class="col-span-1 md:col-span-2 flex items-center justify-between">
                                <h3 class="text-sm font-black text-[#182033] flex items-center gap-2">
                                    <span class="w-7 h-7 rounded-lg bg-[#f0edff] text-[#5745f5] flex items-center justify-center font-bold">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                                    </span>
                                    <span>Cấu hình Google Gemini Cloud</span>
                                </h3>
                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f5f6fa] text-[#7b8499] border border-[#e7eaf2]">Official SDK</span>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-[#182033] uppercase mb-1.5">Mô hình Gemini</label>
                                <select id="cfg-gemini-model" class="w-full px-3.5 py-2.5 bg-white border border-[#e7eaf2] rounded-xl text-xs font-bold text-[#182033] focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all cursor-pointer">
                                    <option value="gemini-3.8-flash" ${!configs.gemini_model && !configs.ai_model || configs.gemini_model === 'gemini-3.8-flash' || configs.ai_model === 'gemini-3.8-flash' ? 'selected' : ''}>gemini-3.8-flash (Khuyến nghị)</option>
                                    <option value="gemini-3.6-flash" ${configs.gemini_model === 'gemini-3.6-flash' || configs.ai_model === 'gemini-3.6-flash' ? 'selected' : ''}>gemini-3.6-flash (Dự phòng)</option>
                                    <option value="gemini-3.1-flash-lite" ${configs.gemini_model === 'gemini-3.1-flash-lite' || configs.ai_model === 'gemini-3.1-flash-lite' ? 'selected' : ''}>gemini-3.1-flash-lite (Tiết kiệm)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-[#182033] uppercase mb-1.5">Chế độ chọn mô hình</label>
                                <div class="inline-flex rounded-xl border border-[#e7eaf2] bg-[#f5f6fa] p-1">
                                    <button type="button" data-ai-model-mode="auto" aria-pressed="${(configs.ai_model_mode || 'auto') === 'auto'}" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${(configs.ai_model_mode || 'auto') === 'auto' ? 'bg-[#5745f5] text-white shadow-sm' : 'text-[#7b8499] hover:text-[#182033]'}">Auto</button>
                                    <button type="button" data-ai-model-mode="manual" aria-pressed="${configs.ai_model_mode === 'manual'}" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${configs.ai_model_mode === 'manual' ? 'bg-[#5745f5] text-white shadow-sm' : 'text-[#7b8499] hover:text-[#182033]'}">Thủ công</button>
                                </div>
                                <p class="mt-1.5 text-[11px] text-[#7b8499]">Auto tự chuyển sang model dự phòng nếu model chính gặp lỗi tải.</p>
                                <p id="ai-runtime-model" class="mt-1 text-[11px] font-bold text-[#5745f5]">${configs.ai_last_model ? `Model gần nhất: ${configs.ai_last_model}${configs.ai_last_model_reason === 'failover' ? ' (tự động chuyển)' : ''}` : 'Chưa có lượt gọi AI nào sau lần lưu cấu hình.'}</p>
                            </div>
                            <div class="col-span-1 md:col-span-2">
                                <label class="block text-xs font-bold text-[#182033] uppercase mb-1.5">Khóa API (Gemini API Key)</label>
                                <input type="text" disabled value="Đã được bảo mật an toàn qua biến môi trường .env" class="w-full px-3.5 py-2.5 bg-[#f5f6fa] border border-[#e7eaf2] rounded-xl text-xs font-semibold text-[#7b8499] cursor-not-allowed">
                            </div>
                        </div>

                        <!-- Khối 2: Cấu hình Ollama -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 border-t border-[#e7eaf2] transition-opacity duration-300" id="ollama-config-section">
                            <div class="col-span-1 md:col-span-2 flex items-center justify-between">
                                <h3 class="text-sm font-black text-[#182033] flex items-center gap-2">
                                    <span class="w-7 h-7 rounded-lg bg-[#f5f6fa] text-[#182033] flex items-center justify-center font-bold">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                                    </span>
                                    <span>Cấu hình Ollama Local (Mạng Nội Bộ)</span>
                                </h3>
                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f5f6fa] text-[#7b8499] border border-[#e7eaf2]">Self-hosted</span>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-[#182033] uppercase mb-1.5">Địa chỉ Ollama Host</label>
                                <div class="flex gap-2">
                                    <input type="text" id="cfg-ollama-host" value="${configs.ollama_host || 'http://127.0.0.1:11434'}" class="flex-1 px-3.5 py-2.5 bg-white border border-[#e7eaf2] rounded-xl text-xs text-[#182033] font-medium placeholder-[#7b8499] focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all" placeholder="http://127.0.0.1:11434">
                                    <button id="btn-check-ollama" class="px-3.5 py-2.5 bg-[#f0edff] border border-[#d8d0fc] text-[#5745f5] font-bold rounded-xl text-xs hover:bg-[#e6e0ff] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                        <span>Kiểm tra</span>
                                    </button>
                                </div>
                                <p id="ollama-status" class="text-xs font-bold mt-2 hidden"></p>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-bold text-[#182033] uppercase mb-1.5">Mô hình Ollama hiện hữu</label>
                                <select id="cfg-ollama-model" class="w-full px-3.5 py-2.5 bg-white border border-[#e7eaf2] rounded-xl text-xs font-bold text-[#182033] focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all cursor-pointer">
                                    <option value="${configs.ollama_model || (!configs.ai_model?.startsWith('gemini') ? configs.ai_model : '') || ''}">${configs.ollama_model || (!configs.ai_model?.startsWith('gemini') ? configs.ai_model : '') || 'Bấm Kiểm tra để tải danh sách model...'}</option>
                                </select>
                            </div>
                        </div>

                        <!-- Khối 3: Tham số điều khiển chung -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 border-t border-[#e7eaf2]">
                            <div>
                                <label class="block text-xs font-bold text-[#182033] uppercase mb-1.5">Giới hạn Tokens phản hồi (Max Tokens)</label>
                                <select id="cfg-ai-tokens" class="w-full px-3.5 py-2.5 bg-white border border-[#e7eaf2] rounded-xl text-xs font-bold text-[#182033] focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all cursor-pointer">
                                    <option value="1024" ${configs.ai_max_tokens == '1024' ? 'selected' : ''}>1024 (Ngắn gọn, phản hồi nhanh)</option>
                                    <option value="2048" ${configs.ai_max_tokens == '2048' ? 'selected' : ''}>2048 (Tiêu chuẩn đề xuất)</option>
                                    <option value="4096" ${configs.ai_max_tokens == '4096' ? 'selected' : ''}>4096 (Tư vấn chuyên sâu)</option>
                                    <option value="8192" ${configs.ai_max_tokens == '8192' ? 'selected' : ''}>8192 (Tối đa văn bản)</option>
                                </select>
                            </div>
                            <div>
                                <div class="flex justify-between items-end mb-1.5">
                                    <label class="block text-xs font-bold text-[#182033] uppercase">Độ sáng tạo (Temperature)</label>
                                    <span id="temp-display" class="text-xs font-black text-[#5745f5] bg-[#f0edff] px-2 py-0.5 rounded-md">${configs.ai_temperature || '0.7'}</span>
                                </div>
                                <input type="range" id="cfg-ai-temp" min="0" max="1" step="0.1" value="${configs.ai_temperature || '0.7'}" class="w-full h-2 bg-[#e7eaf2] rounded-lg appearance-none cursor-pointer accent-[#5745f5] mt-3">
                            </div>
                        </div>

                        <!-- Khối 4: Cấu hình Prompt -->
                        <div class="pt-5 border-t border-[#e7eaf2]">
                            <label class="block text-xs font-bold text-[#182033] uppercase mb-1.5">Prompt Hệ Thống (Định hình tính cách & Kịch bản bán hàng)</label>
                            <textarea id="cfg-ai-prompt" rows="4" placeholder="Nhập ngữ cảnh đào tạo cho bot..." class="w-full px-3.5 py-2.5 bg-white border border-[#e7eaf2] rounded-xl text-xs font-medium text-[#182033] focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all resize-y">${configs.ai_system_prompt || ''}</textarea>
                        </div>

                        <!-- Khối 5: Cấu hình Nhạc nền -->
                        <div class="pt-5 border-t border-[#e7eaf2]">
                            <label class="block text-xs font-bold text-[#182033] uppercase mb-1.5">Link nhạc nền hệ thống (BGM URL)</label>
                            <input type="text" id="cfg-bgm-url" value="${configs.bgm_url || ''}" class="w-full px-3.5 py-2.5 bg-white border border-[#e7eaf2] rounded-xl text-xs text-[#182033] font-medium placeholder-[#7b8499] focus:outline-none focus:border-[#5745f5] focus:ring-2 focus:ring-[#5745f5]/15 transition-all" placeholder="https://domain.com/nhac.mp3">
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div class="p-5 bg-[#fafbfd] border-t border-[#e7eaf2] flex flex-wrap gap-3 justify-between items-center">
                        <div class="flex gap-2.5">
                            <button id="btn-reset-data" class="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 font-bold rounded-xl text-xs hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                <span>Reset Dữ Liệu Demo</span>
                            </button>
                            <button id="btn-backup-db" class="px-4 py-2 bg-white border border-[#e7eaf2] text-[#182033] font-bold rounded-xl text-xs hover:bg-[#f5f6fa] transition-colors flex items-center gap-1.5 cursor-pointer">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                <span>Sao lưu SQLite (.db)</span>
                            </button>
                        </div>
                    </div>
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
