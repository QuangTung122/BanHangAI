# Kịch bản & Nội dung Slide Thuyết trình (Presentation Slides)

**Đề tài:** Hệ thống Quản lý Bán hàng Tích hợp Trí tuệ Nhân tạo (BanHangAI / HTH Smart Sales)  
**Đơn vị:** Trường Đại học Công nghệ thông tin và Truyền thông (ICTU) — Khoa Công nghệ Thông tin  
**Lớp:** KTMT K23A — **Nhóm thực hiện:** Nhóm 02  
**Số lượng Slide:** 11 Slide (Phù hợp thời lượng thuyết trình & bảo vệ 10–15 phút)

---

## Slide 1: Trang Tiêu đề & Giới thiệu Đồ án
- **Tiêu đề chính:** HỆ THỐNG QUẢN LÝ BÁN HÀNG TÍCH HỢP TRÍ TUỆ NHÂN TẠO (BanHangAI)
- **Tiêu đề phụ:** Nền tảng Quản trị Bán lẻ Đa kênh kết hợp Agentic AI & Trợ lý Thông minh cho Doanh nghiệp Vừa và Nhỏ (SMEs)
- **Thông tin Nhóm thực hiện (Nhóm 02 - Lớp KTMT K23A):**
  - **Ngô Quang Tùng** (Trưởng nhóm)
  - **Thân Đức Hậu** (Phó nhóm)
  - **Nguyễn Văn Hữu** (Thành viên)
- **Giảng viên hướng dẫn:** (Bộ môn Công nghệ Máy tính & Hệ thống Nhúng)
- **Lời thuyết minh (Speaker Notes):**
  > "Kính chào quý Thầy/Cô trong Hội đồng chấm đồ án tốt nghiệp/cuối kỳ. Hôm nay, đại diện Nhóm 02 lớp KTMT K23A, em xin phép được trình bày đề tài: 'Hệ thống Quản lý Bán hàng Tích hợp Trí tuệ Nhân tạo - BanHangAI'. Đề tài của nhóm chúng em tập trung vào hai trụ cột chính: xây dựng một hệ thống quản lý bán lẻ lõi toàn diện, linh hoạt cho các SMEs và ứng dụng công nghệ Trí tuệ Nhân tạo tạo sinh (Generative AI & Agentic AI) vào cả hai vai trò: trực tiếp vận hành hệ thống và thúc đẩy toàn bộ vòng đời phát triển phần mềm (SDLC)."
- **Gợi ý hình ảnh / Minh họa:**
  - Logo BanHangAI kết hợp biểu tượng AI não bộ và giỏ hàng công nghệ.
  - Ảnh phối cảnh hiện đại giữa giao diện hệ thống quản lý nội bộ và cổng chatbot khách hàng trên thiết bị di động/máy tính bảng.

---

## Slide 2: Đặt Vấn đề & Thực trạng Quản lý Bán lẻ
- **Nội dung chính:**
  - **Nỗi đau quản trị kho & đơn hàng:** Các cửa hàng vừa và nhỏ vẫn thường xuyên sử dụng sổ sách hoặc bảng tính rời rạc; dễ nhập sai số liệu, thất thoát hàng hóa, khó đồng bộ tồn kho giữa các kênh.
  - **Nghiệp vụ trả góp & đổi trả phức tạp:** Khâu bán hàng trả góp, tính toán kỳ hạn, ghi nhận thu nợ và quy trình thẩm định bảo hành/đổi trả tốn nhiều giấy tờ và dễ xung đột thông tin với khách hàng.
  - **Áp lực tư vấn 24/7:** Nhân viên tư vấn phụ thuộc vào trí nhớ để nhớ thông số sản phẩm, giá bán, tồn kho thực tế; phản hồi chậm hoặc tư vấn sai sản phẩm đã hết hàng.
  - **Khoảng trống phân tích dữ liệu:** Chủ cửa hàng tốn nhiều giờ đồng hồ tổng hợp báo cáo doanh thu từ Excel, thiếu cái nhìn chiến lược kịp thời về sản phẩm bán chạy/bán chậm để ra quyết định nhập hàng.
- **Lời thuyết minh (Speaker Notes):**
  > "Qua khảo sát thực tế tại các cửa hàng bán lẻ điện máy, phụ kiện, chúng em nhận thấy các phần mềm POS truyền thống hiện nay chỉ dừng lại ở mức ghi nhận thanh toán cơ bản. Khi khách hàng hỏi về các chính sách phức tạp hoặc cần tư vấn sâu, nhân viên rất lúng túng. Đồng thời, chủ cửa hàng gần như không có một trợ lý dữ liệu thông minh để tóm tắt số liệu kinh doanh hàng ngày nếu không tự mày mò bảng tính."
- **Gợi ý hình ảnh / Minh họa:**
  - Đồ họa so sánh: Một bên là hình ảnh sổ sách ghi chép lộn xộn, khách hàng chờ đợi, bảng tính Excel rối rắm — một bên là hình ảnh số hóa tự động, tinh gọn.

---

## Slide 3: Tổng quan Giải pháp BanHangAI
- **Nội dung chính:**
  - **Hệ sinh thái quản trị lõi 12+ Module toàn diện:**
    - *Thu ngân & Bán hàng:* POS bán lẻ tức thì, Quản lý Bán hàng Trả góp (Installment) chia kỳ hạn linh hoạt.
    - *Vận hành kho & Dịch vụ:* Quản lý Tồn kho & Cảnh báo tồn thấp, Quản lý Đổi trả & Yêu cầu Bảo hành (Returns & Warranty).
    - *Dòng tiền & Tài chính:* Sổ quỹ Thu - Chi (Cashflow) tự động đối soát, Bảng điều khiển kinh doanh (Dashboard).
    - *Nhân sự & Bảo mật:* Chấm công nhân viên (Attendance), Chat nội bộ (Team Chat), Phân quyền 3 vai trò (RBAC), Nhật ký hệ thống (Audit Logs), Cấu hình hệ thống & AI.
  - **Hai kênh giao diện tách biệt (Dual Experience):**
    - *Hệ thống Quản trị Nội bộ (`index.html`):* Dành cho Quản trị viên (Admin), Chủ cửa hàng (Owner) và Nhân viên (Staff).
    - *Cổng Trợ lý AI Khách hàng Độc lập (`bot.html`):* Dành cho Khách vãng lai và Khách hàng thành viên tương tác 24/7.
  - **Đột phá 2 vai trò của Trí tuệ Nhân tạo:**
    - **AI in System:** Trợ lý Agentic bán hàng, OCR đọc biên lai chuyển khoản, AI sinh báo cáo doanh thu và phân tích xu hướng nhu cầu mua sắm.
    - **AI in SDLC:** AI đồng hành từ phân tích nghiệp vụ, thiết kế kiến trúc, sinh mã nguồn, tự động hóa kiểm thử đến đóng gói triển khai.
- **Lời thuyết minh (Speaker Notes):**
  > "BanHangAI không chỉ là một phần mềm POS đơn lẻ mà là một hệ sinh thái bán hàng đa kênh toàn diện. Điểm sáng của hệ thống là sự kết hợp nhịp nhàng giữa hơn 12 phân hệ nghiệp vụ chặt chẽ với các công nghệ AI tiên tiến, phục vụ đa đối tượng người dùng từ khách hàng bên ngoài cho đến nhân sự nội bộ."
- **Gợi ý hình ảnh / Minh họa:**
  - Sơ đồ hệ sinh thái tròn (Ecosystem Diagram) thể hiện trung tâm là BanHangAI Core kết nối tới 12 phân hệ và 2 giao diện người dùng.

---

## Slide 4: Kiến trúc Kỹ thuật & Công nghệ Hệ thống
- **Nội dung chính:**
  - **Backend (Node.js & Express.js - Layered Architecture):**
    - Phân tầng nghiêm ngặt: `routes/` (Định tuyến) $\rightarrow$ `middlewares/` (Xác thực JWT, RBAC, Upload ảnh, Audit) $\rightarrow$ `controllers/` (Điều phối) $\rightarrow$ `services/` (Xử lý nghiệp vụ lõi & AI).
  - **Frontend (Vanilla JavaScript MVC & Tailwind CSS):**
    - Không phụ thuộc framework cồng kềnh (No-Framework Bloat), áp dụng chuẩn kiến trúc MVC thuần trên trình duyệt (Models, Views, Controllers, ApiClient).
    - Tải trang tức thì (Single Page Application - SPA), giao diện chuẩn Tailwind CSS Mobile-First, mượt mà trên mọi thiết bị.
  - **Cơ sở dữ liệu (SQLite Raw Parameterized Queries):**
    - Lưu trữ tại `backend/database/ecom_ai.db`, định nghĩa schema chuẩn tại `init.sql`.
    - Sử dụng SQL Transactions bảo đảm tính toàn vẹn dữ liệu (ACID) khi trừ kho, tạo đơn, ghi sổ quỹ dòng tiền.
  - **Động cơ AI Đa nền tảng (Dual AI Engine):**
    - Tích hợp linh hoạt **Google Gemini API** (Cloud) và **Ollama LLM** (Local mạng nội bộ).
- **Lời thuyết minh (Speaker Notes):**
  > "Về mặt công nghệ, chúng em lựa chọn mô hình phân tầng chặt chẽ cho Backend với Node.js Express, sử dụng Parameterized SQL để miễn nhiễm hoàn toàn với tấn công SQL Injection. Ở phía Frontend, nhóm chủ động áp dụng mô hình Vanilla JS MVC thuần túy kết hợp Tailwind CSS nhằm đem lại tốc độ tải trang cực nhanh, tối ưu tài nguyên và dễ dàng làm chủ mã nguồn mà không gặp rủi ro 'vỡ thư viện' từ các framework bên thứ ba."
- **Gợi ý hình ảnh / Minh họa:**
  - Sơ đồ khối kiến trúc hệ thống (System Architecture Diagram): Trình duyệt Client $\leftrightarrow$ REST API Gateway $\leftrightarrow$ Controllers/Services $\leftrightarrow$ Database SQLite & AI Providers.

---

## Slide 5: Điểm nhấn AI 1 - Agentic Customer Assistant & RAG Tri thức
- **Nội dung chính:**
  - **Trợ lý AI theo cơ chế Agentic (LangChain Tool Calling):**
    - Không chỉ dừng lại ở việc sinh văn bản thông thường, Bot đóng vai trò là một **AI Agent** tự động gọi công cụ (Tools) theo ngữ cảnh người dùng:
      - `tim_san_pham`: Truy vấn thời gian thực danh mục, giá bán và số lượng tồn kho thực tế.
      - `tinh_phi_va_thoi_gian_ship`: Ước tính cước phí và thời gian giao hàng tự động.
      - `tinh_tra_gop_du_kien`: Tính khoản trả trước và số tiền góp từng tháng (kỳ hạn 3, 6, 9, 12 tháng).
      - `goi_y_ban_kem`: Gợi ý sản phẩm thường được mua cùng dựa trên phân tích giỏ hàng lịch sử.
  - **RAG Tri thức Doanh nghiệp (Zero Hallucination):**
    - Đồng bộ tự động tài liệu tri thức (`backend/knowledge/`) về chính sách bảo hành, chính sách đổi trả, hướng dẫn trả góp vào bộ nhớ vector qua Embeddings (`gemini-embedding-001` hoặc `nomic-embed-text`).
    - AI trả lời chính xác 100% dựa trên tài liệu thực tế của cửa hàng, loại bỏ hoàn toàn hiện tượng bịa đặt thông tin.
  - **Cơ chế Đặt giữ hàng (Bot Reservation Timer):**
    - Khách hàng có thể tạo đơn giữ hàng qua Bot; hệ thống tự động khóa giữ tồn kho trong 15 phút và có tiến trình quét tự động giải phóng kho nếu đơn hết hạn.
  - **Quy trình An toàn 2 bước (`CHO_XAC_NHAN`):**
    - Mọi thao tác ghi dữ liệu (đặt hàng, hủy đơn) bắt buộc phải qua bước tạo thẻ xác nhận trực quan (Human-in-the-loop).
- **Lời thuyết minh (Speaker Notes):**
  > "Trợ lý AI của BanHangAI được xây dựng theo kiến trúc Agentic hiện đại. Khi khách hàng hỏi 'Có tai nghe Bluetooth nào dưới 500k pin trâu không?', bot sẽ tự động gọi tool tra cứu database tồn kho thực rồi mới tổng hợp câu trả lời. Đặc biệt, nhờ cơ chế RAG, bot trả lời vanh vách các điều khoản bảo hành, đổi trả mà không sợ sai lệch chính sách."
- **Gợi ý hình ảnh / Minh họa:**
  - Ảnh chụp màn hình giao diện `bot.html` hiển thị cuộc hội thoại tìm sản phẩm, thẻ gợi ý sản phẩm kèm giá, tồn kho và nút xác nhận đặt hàng trực quan.

---

## Slide 6: Điểm nhấn AI 2 - Multimodal OCR & Live Support Desk
- **Nội dung chính:**
  - **Thị giác máy tính AI (Multimodal Vision / OCR):**
    - Khách hàng hoặc nhân viên có thể tải trực tiếp ảnh chụp biên lai chuyển khoản ngân hàng hoặc hóa đơn mua hàng lên cuộc trò chuyện.
    - AI tự động trích xuất thông tin: Số tiền giao dịch, ngân hàng, thời gian thanh toán theo bộ quy tắc chống giả mạo nghiêm ngặt (*Image Amount Rules*).
  - **Trung tâm Hỗ trợ Trực tiếp (Live Human Handoff):**
    - Khi khách hàng gặp sự cố phức tạp hoặc chủ động gõ yêu cầu gặp nhân viên, bot chuyển giao phiên chat tức thì sang màn hình **Support Desk** của nhân viên.
    - Nhân viên hỗ trợ có thể tiếp nhận (Accept), từ chối (Decline), chat trực tiếp hai chiều và gửi ảnh qua lại với khách hàng theo thời gian thực.
  - **AI Phân tích Xu hướng Thị hiếu (AI Demand Insights):**
    - Trong quá trình trò chuyện, Bot tự động ghi nhận nhu cầu, mức ngân sách mong muốn và thương hiệu khách quan tâm (`ghi_nhan_nhu_cau_mua_sam`) mà không lưu thông tin định danh (PII).
    - Cung cấp cho Chủ cửa hàng biểu đồ phân tích xu hướng mua sắm tiềm năng của thị trường.
- **Lời thuyết minh (Speaker Notes):**
  > "Một tính năng vô cùng thực tế là khả năng đọc ảnh biên lai chuyển khoản bằng công nghệ Multimodal AI, giúp nhân viên đối soát tiền về tài khoản nhanh chóng mà không cần gõ tay. Bên cạnh đó, hệ thống không bỏ rơi khách hàng: khi cần hỗ trợ chuyên sâu, bot sẽ kích hoạt cơ chế Handoff để nhân viên trực quầy vào tiếp quản ngay lập tức."
- **Gợi ý hình ảnh / Minh họa:**
  - Ảnh minh họa ảnh chụp màn hình chuyển khoản ngân hàng được AI bóc tách chính xác số tiền, bên cạnh là giao diện Live Chat hỗ trợ khách của nhân viên.

---

## Slide 7: Điểm nhấn AI 3 - Báo cáo & Phân tích Kinh doanh (AI Insight)
- **Nội dung chính:**
  - **Chuyển hóa Dữ liệu thành Ngôn ngữ (Data-to-Text Analytics):**
    - Thuật toán tổng hợp tự động số liệu thực tế từ Database: Doanh thu thực thu, giá trị hợp đồng, số lượng đơn hoàn tất, Top 5 sản phẩm bán chạy nhất, danh sách sản phẩm chạm ngưỡng tồn kho thấp và sản phẩm bán chậm trong tháng.
    - Đưa dữ liệu thành một bản JSON Snapshot chuẩn xác gửi đến AI Engine.
  - **Bản tin Quản trị Chiến lược:**
    - AI không chỉ lặp lại số liệu mà đưa ra phân tích sắc bén: so sánh doanh số, đánh giá hiệu quả nhóm hàng và đề xuất 1–2 hành động cụ thể (ví dụ: cần đẩy khuyến mãi xả hàng tồn hay gấp rút nhập thêm mã hàng hot).
  - **Cơ chế Dự phòng Thông minh (Rule-Based Fallback):**
    - Nếu mất kết nối mạng hoặc không có API Key, hệ thống tự động kích hoạt thuật toán sinh nhận xét quy chuẩn (Rule-based), đảm bảo Dashboard của Chủ cửa hàng luôn hiển thị thông tin thông suốt mà không bao giờ bị gián đoạn.
- **Lời thuyết minh (Speaker Notes):**
  > "Đối với Chủ cửa hàng, tính năng AI Insight trên Dashboard giống như một chuyên viên phân tích tài chính riêng. Thay vì phải tự soi từng dòng báo cáo, chỉ với một click, AI sẽ đọc dữ liệu kinh doanh tháng này và tóm tắt thành nhận xét chiến lược kèm khuyến nghị hành động cụ thể, giúp chủ shop ra quyết định nhập hàng ngay trong ngày."
- **Gợi ý hình ảnh / Minh họa:**
  - Ảnh chụp màn hình Owner Dashboard với biểu đồ doanh thu dạng cột và khung nhận xét 'AI Phân Tích Doanh Thu' nổi bật.

---

## Slide 8: Bảo mật, Quyền riêng tư & Cơ chế Dual-Engine
- **Nội dung chính:**
  - **Bảo vệ Dữ liệu Cá nhân (Data Sanitization & Guardrails):**
    - Cơ chế làm sạch dữ liệu trước khi gửi sang LLM: Tuyệt đối không gửi số định danh CCCD, số thẻ ngân hàng, mã OTP hay mật khẩu người dùng.
    - Nhắc nhở và từ chối xử lý thông tin tài chính nhạy cảm khi khách gửi trên chat.
  - **Kiểm soát Truy cập Dựa trên Vai trò (RBAC Security):**
    - Phân quyền 3 vai trò chặt chẽ: `admin`, `owner`, `staff`. Danh sách công cụ (Tools) được cấp phát động dựa trên token JWT từ closure backend, ngăn chặn hoàn toàn việc người dùng dùng prompt ép bot thực thi trái thẩm quyền.
  - **Kiến trúc Hybrid AI linh hoạt (Dual-Engine):**
    - **Google Gemini Cloud API:** Tích hợp cơ chế tự động chuyển đổi dự phòng (**Auto-Failover Pool**) qua các model: `gemini-3.8-flash` $\rightarrow$ `gemini-3.6-flash` $\rightarrow$ `gemini-3.1-flash-lite`. Khi dính lỗi 503 hoặc giới hạn tải, hệ thống tự chuyển model mà người dùng không hề bị ngắt quãng.
    - **Local Ollama LLM:** Hỗ trợ chạy các mô hình nguồn mở (Llama 3, Qwen) 100% trong mạng cục bộ nội bộ, chi phí API 0 đồng và bảo mật tuyệt đối cho dữ liệu doanh nghiệp.
- **Lời thuyết minh (Speaker Notes):**
  > "Vấn đề bảo mật và chi phí vận hành được nhóm đặc biệt chú trọng. Chúng em thiết kế cơ chế làm sạch dữ liệu PII trước khi gửi cho AI và kiểm soát quyền tool từ mã nguồn JWT. Đồng thời, kiến trúc Dual-Engine cho phép doanh nghiệp linh hoạt lựa chọn: dùng Gemini Cloud tốc độ cao có tự động failover, hoặc chạy Ollama Local hoàn toàn offline với chi phí bản quyền bằng không."
- **Gợi ý hình ảnh / Minh họa:**
  - Sơ đồ bảo mật: Lớp Data Sanitizer lọc bỏ PII $\rightarrow$ Bộ phân quyền JWT $\rightarrow$ Cơ chế chuyển đổi kép giữa Gemini Cloud và Local Ollama.

---

## Slide 9: Ứng dụng AI trong Vòng đời Phát triển Phần mềm (AI in SDLC)
- **Nội dung chính (Minh chứng xuyên suốt 4 giai đoạn đề tài):**
  - **Giai đoạn 1 (Phân tích Yêu cầu & Thiết kế Hệ thống - KT1):**
    - Dùng AI hỗ trợ phân tích luồng bán hàng, nhập kho, quản lý đổi trả.
    - Sinh tài liệu đặc tả yêu cầu phần mềm (SRS), ma trận truy vết (Traceability ID Matrix), sơ đồ ca sử dụng (Use Case) và thiết kế từ điển cơ sở dữ liệu (Database Dictionary).
  - **Giai đoạn 2 (Xây dựng Chức năng Quản lý Lõi - KT2):**
    - Dùng AI sinh cấu trúc thư mục phân tầng chuẩn MVC, scaffolding các Controller, Model và Routes cho Express.js.
    - Tối ưu các câu lệnh SQL Transaction phức tạp trong xử lý trừ kho đồng thời và tính toán dòng tiền trả góp.
  - **Giai đoạn 3 (Tích hợp AI & Kiểm thử Tự động - KT3):**
    - Thiết kế và tinh chỉnh kỹ thuật Prompt Engineering, xây dựng hệ thống LangChain Tools.
    - Dùng AI hỗ trợ viết bộ kiểm thử tự động toàn diện: `run_pos_tests.js`, `run_installment_tests.js`, `run_cashflow_tests.js`, `run_product_tests.js`, `run_staff_tests.js`.
  - **Giai đoạn 4 (Đóng gói, Triển khai & Hoàn thiện Tài liệu - KT4):**
    - Tự động sinh sổ tay hướng dẫn sử dụng chi tiết (`user_manual.md`), kịch bản demo (`demo-script.md`), tài liệu DevOps triển khai Docker (`deployment-guide.md`).
- **Lời thuyết minh (Speaker Notes):**
  > "Theo đúng tôn chỉ của đề tài, nhóm chúng em đã ứng dụng AI như một người bạn lập trình cặp (AI Pair Programmer) trong toàn bộ quy trình công nghệ phần mềm SDLC. Từ khâu lên ý tưởng SRS, viết code backend, tối ưu prompt cho tới việc sinh ra hàng loạt bộ kịch bản test tự động, AI đã giúp nhóm tăng tốc tiến độ phát triển lên gấp 3 lần mà vẫn đảm bảo tính chuẩn mực cao."
- **Gợi ý hình ảnh / Minh họa:**
  - Quy trình 4 bước SDLC (Phân tích $\rightarrow$ Thiết kế/Code $\rightarrow$ Tích hợp/Test $\rightarrow$ Triển khai) kèm các logo công cụ và bằng chứng tệp tin tài liệu tương ứng trong thư mục `ketqua/prompts/`.

---

## Slide 10: Kết quả Đạt được & Kịch bản Trình diễn (Demo)
- **Nội dung chính:**
  - **Kết quả nghiệm thu đồ án:**
    - Đã hoàn thành 100% các yêu cầu nghiệp vụ theo đề tài với hơn 12 phân hệ hoạt động ổn định.
    - Tích hợp thành công 3 năng lực AI vượt trội: Trợ lý bán hàng Agentic RAG, OCR đọc biên lai & Handoff nhân viên, AI phân tích dữ liệu kinh doanh.
    - Vượt qua 100% các kịch bản kiểm thử tự động (Unit Test / Integration Test) về tồn kho, đơn hàng và sổ quỹ.
    - Hệ thống đóng gói sẵn sàng chạy qua Node.js hoặc môi trường ảo hóa Docker Container.
  - **Kịch bản Demo trực tiếp (Thời lượng 10–12 phút):**
    - *Bước 1 (Khách hàng tương tác Bot - `bot.html`):* Khách hỏi tư vấn tai nghe $\rightarrow$ AI tra cứu kho hàng $\rightarrow$ Tính trả góp dự kiến $\rightarrow$ Chuẩn bị đơn giữ chỗ $\rightarrow$ Tải ảnh biên lai thanh toán $\rightarrow$ Thử nghiệm chuyển tiếp gặp nhân viên hỗ trợ trực tiếp.
    - *Bước 2 (Nhân viên bán hàng - Staff):* Đăng nhập giao diện nội bộ $\rightarrow$ Tiếp nhận yêu cầu hỗ trợ từ khách $\rightarrow$ Mở màn hình POS bán hàng tạo đơn trả góp $\rightarrow$ In hóa đơn $\rightarrow$ Kiểm tra chấm công ca làm việc.
    - *Bước 3 (Chủ cửa hàng - Owner):* Mở Dashboard xem biểu đồ doanh thu tức thì $\rightarrow$ Bấm nút kích hoạt 'AI Insight' phân tích số liệu kinh doanh $\rightarrow$ Vào phân hệ duyệt phiếu đổi trả hàng.
    - *Bước 4 (Quản trị viên - Admin):* Vào màn hình Cấu hình Hệ thống, chuyển đổi trực tiếp giữa Google Gemini và Local Ollama $\rightarrow$ Xem nhật ký kiểm toán (Audit Logs).
- **Lời thuyết minh (Speaker Notes):**
  > "Sau đây, em xin phép chuyển sang phần Demo trực tiếp trên hệ thống thực tế để Thầy/Cô cùng trải nghiệm các tính năng vừa trình bày theo đúng kịch bản nghiệp vụ khép kín từ khách hàng đến nhân viên, chủ shop và quản trị viên."
- **Gợi ý hình ảnh / Minh họa:**
  - Lộ trình luồng Demo (Demo Flow Diagram) 4 bước từ Khách hàng $\rightarrow$ Nhân viên POS $\rightarrow$ Chủ cửa hàng $\rightarrow$ Quản trị hệ thống.

---

## Slide 11: Định hướng Phát triển & Hỏi Đáp (Q&A)
- **Nội dung chính:**
  - **Định hướng phát triển tương lai:**
    - Tích hợp cổng thanh toán trực tuyến tự động qua mã VietQR động, cổng MoMo và VNPay với Webhook xác nhận tức thì.
    - Kết nối đa kênh (Omnichannel): Đồng bộ trợ lý AI lên Fanpage Facebook Messenger, Zalo OA và TikTok Shop.
    - Phát triển mô hình AI dự báo tồn kho thông minh (Predictive Stock Replenishment) dựa trên chuỗi thời gian lịch sử bán hàng theo mùa vụ.
  - **Lời Cảm Ơn:**
    - Chân thành cảm ơn quý Thầy/Cô trong Hội đồng đã lắng nghe bài thuyết trình của Nhóm 02!
    - Kính mời Thầy/Cô đặt câu hỏi và đóng góp ý kiến để nhóm hoàn thiện đồ án tốt hơn.
- **Lời thuyết minh (Speaker Notes):**
  > "Dự án BanHangAI vẫn còn nhiều tiềm năng mở rộng trong tương lai như kết nối cổng thanh toán QR động và mở rộng trợ lý lên Zalo, Facebook. Chúng em xin chân thành cảm ơn quý Thầy/Cô trong Hội đồng đã dành thời gian theo dõi. Rất mong nhận được những lời nhận xét, góp ý quý báu từ Thầy/Cô ạ!"
- **Gợi ý hình ảnh / Minh họa:**
  - Slide kết thúc trang trọng với thông tin liên hệ của Nhóm 02 (Email, GitHub Repo) và dòng chữ 'THANK YOU & Q&A'.
