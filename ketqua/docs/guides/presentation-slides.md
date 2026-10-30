# Cấu trúc Tóm tắt Slide Thuyết trình (Presentation Slides)

**Đề tài:** Hệ thống Quản lý Bán hàng Tích hợp Trí tuệ Nhân tạo (BanHangAI / HTH Smart Sales)  
**Nhóm thực hiện:** Nhóm 02 — Lớp: KTMT K23A — Trường Đại học Công nghệ thông tin và Truyền thông (ICTU)  
**Thành viên:** Ngô Quang Tùng (Trưởng nhóm), Thân Đức Hậu (Phó nhóm), Nguyễn Văn Hữu  
**Số lượng Slide:** 11 Slide

---

## Slide 1: Trang Tiêu đề & Thông tin Đồ án
- **Nội dung:** 
  - Hệ thống Quản lý Bán hàng Tích hợp Trí tuệ Nhân tạo (BanHangAI / HTH Smart Sales).
  - Nền tảng Quản trị Bán lẻ Đa kênh kết hợp Agentic AI & Trợ lý Thông minh cho Doanh nghiệp Vừa và Nhỏ (SMEs).
  - Nhóm 02: Ngô Quang Tùng, Thân Đức Hậu, Nguyễn Văn Hữu — Lớp KTMT K23A — ICTU.
- **Notes:** Chào Hội đồng, giới thiệu mục đích đề tài giải quyết bài toán quản trị bán lẻ thực tế cho SMEs bằng việc kết hợp hệ thống lõi với AI thế hệ mới.

## Slide 2: Vấn đề & Thực trạng Quản lý Bán lẻ
- **Nội dung:**
  - Tồn kho thủ công, dễ thất thoát và lệch số liệu giữa sổ sách và thực tế.
  - Nghiệp vụ trả góp, đổi trả bảo hành phức tạp, tốn thời gian xử lý thủ công.
  - Quá trình tư vấn bán hàng phụ thuộc hoàn toàn vào trí nhớ của nhân viên.
  - Thiếu công cụ phân tích tự động: Chủ cửa hàng mất nhiều giờ tổng hợp Excel để ra quyết định kinh doanh.
- **Notes:** Nhấn mạnh phần mềm POS hiện nay thiếu tính "thông minh" và tương tác ngôn ngữ tự nhiên hỗ trợ nhân sự và khách hàng.

## Slide 3: Tổng quan Giải pháp BanHangAI
- **Nội dung:**
  - Hệ thống quản trị lõi 12+ Module: POS thu ngân, Quản lý Bán hàng Trả góp, Đổi trả & Bảo hành, Sổ quỹ Thu - Chi, Quản lý Tồn kho, Dashboard, Chấm công, Chat nội bộ, Phân quyền RBAC, Audit Logs...
  - Hai kênh giao diện chuyên biệt: Giao diện Quản trị nội bộ (`index.html`) & Cổng Trợ lý AI Khách hàng (`bot.html`).
  - Đột phá với 2 vai trò của AI: AI vận hành trong hệ thống (AI in System) và AI thúc đẩy toàn bộ vòng đời phát triển phần mềm (AI in SDLC).
- **Notes:** Giới thiệu tổng quan giải pháp toàn diện, kết nối đa kênh giữa khách hàng và bộ máy vận hành nội bộ.

## Slide 4: Kiến trúc Kỹ thuật & Công nghệ
- **Nội dung:**
  - Backend: Node.js & Express.js theo kiến trúc phân tầng (Layered Architecture: routes, middlewares, controllers, services).
  - Frontend: Vanilla JavaScript MVC thuần túy, Tailwind CSS Responsive, SPA tải trang tức thì, hiệu năng cao.
  - CSDL: SQLite với Parameterized SQL Queries & Transactions ACID đảm bảo toàn vẹn dữ liệu kho và dòng tiền.
  - Động cơ AI kép (Dual-Engine): Google Gemini API (Cloud) & Ollama LLM (Local mạng nội bộ).
- **Notes:** Nhấn mạnh việc nhóm tự xây dựng kiến trúc MVC thuần túy ở frontend để tối ưu hiệu năng và làm chủ mã nguồn, kết hợp backend phân tầng bảo mật.

## Slide 5: Điểm nhấn AI 1 - Agentic Customer Assistant & RAG Tri thức
- **Nội dung:**
  - LangChain Tool-Calling Agent: Tự động phân tích ý định và gọi công cụ tra cứu tồn kho thực (`tim_san_pham`), tính cước giao hàng (`tinh_phi_va_thoi_gian_ship`), tính trả góp dự kiến (`tinh_tra_gop_du_kien`), gợi ý mua kèm...
  - RAG Tri thức Doanh nghiệp: Tích hợp tài liệu chính sách đổi trả, bảo hành, thanh toán với Vector Embeddings $\rightarrow$ Không bịa đặt thông tin (Zero Hallucination).
  - Đặt giữ hàng tự động (Bot Reservation): Khóa giữ kho trong 15 phút, tự giải phóng nếu quá hạn.
  - Cơ chế thẻ xác nhận 2 bước trực quan (`CHO_XAC_NHAN`).
- **Notes:** Giải thích sự khác biệt giữa bot sinh văn bản thông thường và Agentic AI có khả năng truy vấn dữ liệu thực tế và hành động có kiểm soát.

## Slide 6: Điểm nhấn AI 2 - Multimodal Vision (OCR) & Live Support Desk
- **Nội dung:**
  - Multimodal AI (Vision/OCR): Đọc ảnh chụp biên lai chuyển khoản ngân hàng và hóa đơn bán hàng, bóc tách chính xác số tiền theo quy tắc strict rules.
  - Trung tâm Hỗ trợ Trực tiếp (Live Human Handoff): Chuyển tiếp tức thì phiên chat từ Bot sang bàn trực của nhân viên khi cần khiếu nại hoặc hỗ trợ sâu, hỗ trợ gửi ảnh hai chiều.
  - AI Demand Insights: Tự động tổng hợp nhu cầu, tầm giá và thương hiệu khách quan tâm để hỗ trợ chủ shop hoạch định nhập hàng.
- **Notes:** Nhấn mạnh tính thực chiến của việc đọc ảnh hóa đơn/chuyển khoản và cơ chế không bao giờ bỏ rơi khách hàng khi chuyển tiếp người thật.

## Slide 7: Điểm nhấn AI 3 - Báo cáo Kinh doanh Thông minh (AI Insight)
- **Nội dung:**
  - Data-to-Text Analytics: Backend tự động trích xuất snapshot JSON (doanh thu, tiền đã thu, top bán chạy, hàng tồn thấp, hàng bán chậm).
  - Báo cáo chiến lược: AI tổng hợp nhận xét quản trị bằng ngôn ngữ tự nhiên và khuyến nghị 1–2 hành động cụ thể cho chủ cửa hàng ngay trên Dashboard.
  - Rule-based Fallback: Cơ chế tự động chuyển sang sinh nhận xét chuẩn theo thuật toán nếu mất kết nối AI, đảm bảo hệ thống không bao giờ lỗi.
- **Notes:** Trợ lý ảo cho chủ cửa hàng thay thế chuyên viên phân tích dữ liệu, biến số liệu khô khan thành hành động kinh doanh thực tế.

## Slide 8: Bảo mật, Quyền riêng tư & Cơ chế Dual-Engine
- **Nội dung:**
  - Data Sanitization & Guardrails: Tự động lọc bỏ thông tin định danh cá nhân (CCCD, SĐT, OTP, tài chính) trước khi gọi LLM.
  - Bảo mật phân quyền RBAC: Phân quyền công cụ theo JWT token, ngăn chặn LLM thực thi trái thẩm quyền.
  - Dual-Engine AI:
    - Gemini Cloud với Auto-Failover pool (`gemini-3.8-flash` $\rightarrow$ `gemini-3.6-flash` $\rightarrow$ `gemini-3.1-flash-lite`) chống gián đoạn dịch vụ.
    - Local Ollama LLM chạy nội bộ, chi phí API $0, bảo mật tuyệt đối cho dữ liệu doanh nghiệp.
- **Notes:** Điểm cộng lớn về tính an toàn và tính khả thi triển khai trong môi trường kinh doanh thực tế.

## Slide 9: Ứng dụng AI trong Toàn bộ Vòng đời Phần mềm (AI in SDLC)
- **Nội dung:**
  - Giai đoạn 1 (Phân tích & Thiết kế - KT1): AI hỗ trợ viết SRS, User Stories, ma trận truy vết, sơ đồ Use Case và thiết kế từ điển CSDL ERD.
  - Giai đoạn 2 (Xây dựng Chức năng Quản lý - KT2): AI sinh cấu trúc phân tầng MVC, API Express, tối ưu SQL Transaction trừ kho và dòng tiền.
  - Giai đoạn 3 (Tích hợp AI & Kiểm thử - KT3): AI hỗ trợ kỹ thuật Prompt Engineering, Agent Tools, sinh bộ kiểm thử tự động (POS, Installment, Cashflow, Stock tests).
  - Giai đoạn 4 (Triển khai & Báo cáo - KT4): AI sinh tài liệu User Manual, kịch bản Demo, Deployment Guide và slide thuyết trình.
- **Notes:** Trình bày rõ minh chứng việc nhóm đã áp dụng AI xuyên suốt 4 giai đoạn phát triển phần mềm theo yêu cầu đề tài.

## Slide 10: Kết quả Nghiệm thu & Kịch bản Trình diễn (Demo)
- **Nội dung:**
  - Hoàn thiện 100% các chức năng quản trị bán lẻ lõi (12+ module) và 3 chức năng AI tiên tiến. Vượt qua toàn bộ kịch bản kiểm thử tự động.
  - Kịch bản Demo trực tiếp (10–12 phút):
    1. Khách hàng trải nghiệm Bot AI: Tư vấn sản phẩm, tính trả góp, gửi ảnh biên lai và chuyển tiếp nhân viên.
    2. Nhân viên bán hàng (Staff): Bán hàng POS trả góp, in hóa đơn, tiếp nhận live chat hỗ trợ khách.
    3. Chủ cửa hàng (Owner): Xem Dashboard biểu đồ doanh thu, kích hoạt AI Insight phân tích báo cáo và duyệt phiếu đổi trả.
    4. Quản trị viên (Admin): Đổi mô hình AI (Gemini/Ollama) trực tiếp từ giao diện, xem Audit logs.
- **Notes:** Chuyển sang phần chiếu màn hình thực tế để chứng minh tính năng hoạt động trơn tru.

## Slide 11: Định hướng Phát triển & Q&A
- **Nội dung:**
  - Tích hợp cổng thanh toán trực tuyến tự động qua VietQR động, MoMo, VNPay.
  - Mở rộng đa kênh (Omnichannel): Đồng bộ Bot lên Facebook Messenger, Zalo OA, TikTok Shop.
  - Nâng cấp mô hình AI dự báo tồn kho theo mùa vụ (Predictive Inventory).
  - Lời Cảm Ơn & Q&A cùng Hội đồng chấm thi.
- **Notes:** Cảm ơn Thầy/Cô đã lắng nghe và sẵn sàng trả lời các câu hỏi từ Hội đồng.
