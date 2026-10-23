import AdminSystemView from '../views/pages/AdminSystemView.js';
import SystemModel from '../models/SystemModel.js';

export default class AdminSystemController {
    constructor() {
        this.view = new AdminSystemView();
        this.model = new SystemModel();
        
        this.init();
    }

    async init() {
        // Tải cấu hình từ Backend
        await this.model.fetchConfigs();
        
        // Vẽ giao diện
        this.view.render(this.model.configs);

        // Gắn sự kiện
        this.bindEvents();
    }

    bindEvents() {
        const container = this.view.container;

        // 1. Kiểm tra kết nối Ollama
        const btnCheck = container.querySelector('#btn-check-ollama');
        if (btnCheck) {
            btnCheck.addEventListener('click', async () => {
                const host = container.querySelector('#cfg-ollama-host').value;
                if (!host) return alert('Vui lòng nhập địa chỉ Ollama Host');
                
                btnCheck.innerText = 'Đang kiểm tra...';
                const res = await this.model.checkOllamaConnection(host);
                btnCheck.innerHTML = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Kiểm tra kết nối`;

                if (res.success) {
                    this.view.setOllamaStatus(true, `✅ Kết nối thành công! Tải được ${res.models.length} mô hình.`);
                    const currentModel = this.model.configs.ollama_model || (!this.model.configs.ai_model?.startsWith('gemini') ? this.model.configs.ai_model : '');
                    this.view.updateModelDropdown(res.models, currentModel);
                } else {
                    this.view.setOllamaStatus(false, `❌ ${res.message}`);
                }
            });
        }

        // 2. Sao lưu DB
        const btnBackup = container.querySelector('#btn-backup-db');
        if (btnBackup) {
            btnBackup.addEventListener('click', async () => {
                const res = await this.model.downloadBackup();
                if (!res.success) alert(res.message);
            });
        }

        // 2.5 Dọn dẹp dữ liệu (Reset Data)
        const btnReset = container.querySelector('#btn-reset-data');
        if (btnReset) {
            btnReset.addEventListener('click', async () => {
                const confirmMsg = "CẢNH BÁO NGUY HIỂM: \nHành động này sẽ XÓA SẠCH toàn bộ Hóa đơn, Giao dịch Thu Chi, Chấm công, và Cả DANH MỤC SẢN PHẨM.\n\nChỉ giữ lại Tài khoản nhân viên và Cấu hình hệ thống.\n\nNếu bạn chắc chắn muốn xóa, hãy gõ đúng dòng chữ: XAC NHAN XOA";
                const userInput = window.prompt(confirmMsg);
                
                if (userInput === 'XAC NHAN XOA') {
                    btnReset.disabled = true;
                    btnReset.innerText = 'Đang dọn dẹp...';
                    try {
                        const res = await this.model.resetData(userInput);
                        if (res && res.success) {
                            alert('✅ Đã dọn dẹp dữ liệu thành công!');
                            window.location.reload(); // Tải lại trang để xóa cache hiển thị
                        } else {
                            alert('❌ Lỗi: ' + (res?.message || 'Không thể xóa dữ liệu'));
                        }
                    } catch (err) {
                        alert('❌ Lỗi kết nối');
                    }
                    btnReset.disabled = false;
                    btnReset.innerHTML = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>Dọn dẹp Dữ liệu (Reset)`;
                } else if (userInput !== null) {
                    alert('Bạn đã nhập sai mã xác nhận. Việc xóa dữ liệu đã bị hủy.');
                }
            });
        }

        // 3. Lưu cấu hình
        const btnSave = container.querySelector('#btn-save-config');
        if (btnSave) {
            btnSave.addEventListener('click', async () => {
                const provider = container.querySelector('#cfg-ai-provider').value;
                const modelMode = container.querySelector('[data-ai-model-mode][aria-pressed="true"]')?.getAttribute('data-ai-model-mode') || 'auto';
                const newConfigs = {
                    ai_provider: provider,
                    ai_model_mode: modelMode,
                    gemini_model: container.querySelector('#cfg-gemini-model').value,
                    ollama_host: container.querySelector('#cfg-ollama-host').value,
                    ollama_model: container.querySelector('#cfg-ollama-model').value,
                    ai_model: provider === 'gemini' ? container.querySelector('#cfg-gemini-model').value : container.querySelector('#cfg-ollama-model').value,
                    ai_host: container.querySelector('#cfg-ollama-host').value,
                    ai_max_tokens: container.querySelector('#cfg-ai-tokens').value,
                    ai_system_prompt: container.querySelector('#cfg-ai-prompt').value,
                    ai_temperature: container.querySelector('#cfg-ai-temp').value,
                    bgm_url: container.querySelector('#cfg-bgm-url').value
                };

                const res = await this.model.saveConfigs(newConfigs);
                if (res && res.success) {
                    alert('Lưu cấu hình hệ thống thành công!');
                    window.dispatchEvent(new CustomEvent('bgm-updated', { detail: newConfigs.bgm_url }));
                } else {
                    alert('Có lỗi xảy ra khi lưu cấu hình');
                }
            });
        }
        
        // 4. Thay đổi Provider (UI Toggle)
        const providerSelect = container.querySelector('#cfg-ai-provider');
        const geminiSection = container.querySelector('#gemini-config-section');
        const ollamaSection = container.querySelector('#ollama-config-section');
        
        if (providerSelect) {
            const updateProviderView = () => {
                if (providerSelect.value === 'gemini') {
                    geminiSection.style.opacity = '1';
                    geminiSection.style.pointerEvents = 'auto';
                    geminiSection.style.filter = 'none';
                    
                    ollamaSection.style.opacity = '0.4';
                    ollamaSection.style.pointerEvents = 'none';
                    ollamaSection.style.filter = 'grayscale(100%)';
                } else {
                    ollamaSection.style.opacity = '1';
                    ollamaSection.style.pointerEvents = 'auto';
                    ollamaSection.style.filter = 'none';
                    
                    geminiSection.style.opacity = '0.4';
                    geminiSection.style.pointerEvents = 'none';
                    geminiSection.style.filter = 'grayscale(100%)';
                }
            };
            
            providerSelect.addEventListener('change', updateProviderView);
            updateProviderView();
        }

        const modelModeButtons = container.querySelectorAll('[data-ai-model-mode]');
        modelModeButtons.forEach((button) => {
            button.addEventListener('click', () => {
                modelModeButtons.forEach((candidate) => {
                    const selected = candidate === button;
                    candidate.setAttribute('aria-pressed', String(selected));
                    candidate.className = `px-4 py-2 rounded-lg text-sm font-black transition-colors ${selected ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`;
                });
            });
        });
    }

    destroy() {
        if (this.view.container) {
            this.view.container.innerHTML = '';
        }
    }
}
