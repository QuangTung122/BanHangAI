# HTH Smart Sales (BanHangAI) 🚀
> **Nền tảng Quản trị Bán lẻ & Vận hành Tinh gọn Trợ lực bởi Trí tuệ Nhân tạo (AI)**

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-v4.18-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Database](https://img.shields.io/badge/Database-SQLite3-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![Frontend](https://img.shields.io/badge/Frontend-Vanilla_JS_MVC-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![AI Engine](https://img.shields.io/badge/AI_Engine-Gemini_%2F_Ollama-5745F5?logo=google&logoColor=white)](https://ai.google.dev)
[![Test Suite](https://img.shields.io/badge/Test_Suite-100%25_PASS-149C79?logo=checkmarx&logoColor=white)](#-kiểm-thử-tự-động-automated-tests)

---

## 📖 Mục lục
- [Giới thiệu tổng quan](#-giới-thiệu-tổng-quan)
- [Điểm nổi bật của HTH Smart Sales](#-điểm-nổi-bật-của-hth-smart-sales)
- [Hệ sinh thái 11 Phân hệ Chức năng](#-hệ-sinh-thái-11-phân-hệ-chức-năng)
- [Động cơ Trí tuệ Nhân tạo (Dual AI Engine)](#-động-cơ-trí-tuệ-nhân-tạo-dual-ai-engine)
- [Kiến trúc & Công nghệ (Tech Stack)](#-kiến-trúc--công-nghệ-tech-stack)
- [Cấu trúc Thư mục Dự án](#-cấu-trúc-thư-mục-dự-án)
- [Hướng dẫn Khởi chạy Nhanh (Quick Start)](#-hướng-dẫn-khởi-chạy-nhanh-quick-start)
- [Cấu hình Biến Môi trường Nâng cao](#️-cấu-hình-biến-môi-trường-nâng-cao-tùy-chọn)
- [Tài khoản Demo Hệ thống](#-tài-khoản-demo-hệ-thống)
- [Kiểm thử Tự động (Automated Tests)](#-kiểm-thử-tự-động-automated-tests)
- [Kỷ luật Kiến trúc & Đóng góp](#-kỷ-luật-kiến-trúc--đóng-góp)

---

## 🌟 Giới thiệu tổng quan

**HTH Smart Sales** là hệ thống phần mềm quản lý bán lẻ hiện đại được thiết kế theo kiến trúc **Layered MVC**, hướng tới trải nghiệm làm việc tinh gọn, mượt mà và tối ưu hóa diện tích hiển thị trên mọi thiết bị màn hình.

Hệ thống nhúng trực tiếp Trí tuệ Nhân tạo vào các quy trình nghiệp vụ cốt lõi: từ tư vấn bán hàng tự động, đề xuất sản phẩm theo ngữ cảnh giỏ hàng, nhận diện nhu cầu khách hàng, hỗ trợ quyết định nhập hàng, cho đến phân tích hiệu quả kinh doanh thời gian thực.

Dự án phân quyền độc lập, chặt chẽ cho 4 vai trò chính:
1. **Quản trị viên (Admin):** Quản lý tài khoản, giám sát hoạt động qua Audit Logs, cấu hình động cơ AI (Ollama/Gemini).
2. **Chủ cửa hàng (Owner):** Theo dõi KPI doanh thu, biểu đồ tài chính, quản lý dòng tiền sổ quỹ, duyệt xuất/nhập kho và tính lương nhân sự.
3. **Nhân viên bán hàng (Staff):** Thao tác lập hóa đơn POS tốc độ cao, tra cứu tồn kho, xử lý đơn trả góp, tiếp nhận đổi trả/bảo hành, chấm công cá nhân và chat hỗ trợ khách hàng.
4. **Khách hàng (Customer / Bot User):** Tìm kiếm sản phẩm, đặt hàng tự động, theo dõi đơn hàng và tương tác với Trợ lý AI Bot.

---

## 💡 Điểm nổi bật của HTH Smart Sales

- ⚡ **Giao diện Modern Light SaaS siêu tinh gọn:** Thiết kế chuẩn mực theo tông màu hiện đại (`#5745f5` Primary, `#fafbfd` Thead, `#e7eaf2` Border). Không gian làm việc được tối ưu hóa tối đa (**Workspace Maximized**), loại bỏ các thành phần lặp lại, thanh điều hướng sidebar và topbar nhỏ gọn giúp hiển thị nhiều dữ liệu nhất trên một màn hình.
- 🚀 **Hiệu năng vượt trội với Vanilla JS MVC:** Không phụ thuộc vào framework nặng, tốc độ nạp trang tức thì, phản hồi DOM thời gian thực, kiến trúc phân tách rành mạch giữa Model, View và Controller.
- 🤖 **Động cơ kép linh hoạt (Dual AI Engine):** Cho phép linh hoạt chuyển đổi giữa **Google Gemini Cloud** (mô hình lớn, thông minh) và **Ollama Local** (chạy trực tiếp máy chủ nội bộ mạng LAN, offline, bảo mật tuyệt đối và hoàn toàn miễn phí).
- 🧾 **Quy trình bán hàng đa năng:** Hỗ trợ bán thẳng (Tiền mặt, VietQR, Thẻ POS), tích hợp luồng xử lý hồ sơ trả góp mô phỏng liên kết đối tác tài chính (Home Credit, FE Credit, Ngân hàng) từ 3 đến 24 tháng.
- 💬 **Trung tâm giao tiếp đa kênh:** Tích hợp cả Live Chat hỗ trợ khách từ Bot và Team Chat trao đổi công việc nội bộ có hỗ trợ gửi hình ảnh đính kèm.

---

## 📦 Hệ sinh thái 11 Phân hệ Chức năng

```
                              ┌──────────────────────────────────┐
                              │       HTH Smart Sales POS        │
                              └────────────────┬─────────────────┘
                                               │
       ┌───────────────────────┬───────────────┴───────────────┬───────────────────────┐
       ▼                       ▼                               ▼                       ▼
┌──────────────┐       ┌──────────────┐                ┌──────────────┐        ┌──────────────┐
│  Thu Ngân &  │       │  Hàng Hóa &  │                │ Tài Chính &  │        │  Vận Hành &  │
│  Bán Hàng    │       │  Kho Bãi     │                │ Dòng Tiền    │        │  Hệ Thống    │
└──────┬───────┘       └──────┬───────┘                └──────┬───────┘        └──────┬───────┘
       │                      │                               │                       │
       ├─ POS Lập hóa đơn     ├─ Tra cứu tồn kho              ├─ Quản lý dòng tiền    ├─ Quản lý nhân sự
       ├─ Quản lý trả góp     ├─ Quản lý sản phẩm             ├─ Sổ quỹ Thu/Chi       ├─ Bảng chấm công
       ├─ Đơn hàng & Bot      ├─ Quản lý nhập hàng            ├─ Thống kê doanh thu   ├─ Quản trị User
       └─ Đổi trả & Bảo hành  └─ Đề xuất nhập AI              └─ Biểu đồ KPI          └─ Nhật ký Audit
```

| STT | Phân hệ | Vai trò | Chức năng chi tiết |
|:---:|:---|:---:|:---|
| **1** | **POS Lập Hóa Đơn** | `Staff` | Tìm kiếm tức thì, quét mã SKU, chọn danh mục, giỏ hàng động, gợi ý bundle bán kèm (AI), xuất hóa đơn và in bill. |
| **2** | **Quản Lý Bán Trả Góp** | `Staff` | Lập hồ sơ trả góp, chọn đối tác tài chính mô phỏng, kỳ hạn 3–24 tháng, tính khoản trả trước và tiền giải ngân. |
| **3** | **Đổi Trả & Bảo Hành** | `Staff` / `Owner` | Tra cứu hóa đơn gốc, tạo phiếu đổi hàng hoặc tiếp nhận bảo hành hãng, tính phí chênh lệch, theo dõi timeline tiến độ. |
| **4** | **Tra Cứu & Quản Lý Kho** | `Staff` / `Owner` | Tra cứu tồn kho real-time, 5 chỉ số kho, cảnh báo hàng sắp hết, nhập hàng nhiều sản phẩm, xem lịch sử phiếu nhập. |
| **5** | **Đơn Hàng & Duyệt Đơn Bot** | `Staff` | Tiếp nhận đơn khách đặt qua Bot AI, kiểm duyệt số lượng, xác nhận đơn hàng, thu tiền và in phiếu giao. |
| **6** | **Quản Lý Dòng Tiền & Sổ Quỹ** | `Owner` | Phân loại dòng tiền (Tiền mặt tại quầy, Tài khoản ngân hàng, Quẹt thẻ POS), lập phiếu Thu/Chi, lọc theo kỳ kế toán. |
| **7** | **Thống Kê & Báo Cáo Doanh Thu** | `Owner` | KPI doanh thu tổng quan, biểu đồ tăng trưởng doanh số theo khoảng ngày, bảng xếp hạng Top sản phẩm bán chạy. |
| **8** | **Chấm Công & Quản Lý Nhân Sự** | `Staff` / `Owner` | Check-in/Check-out thời gian thực, bảng công theo tháng, tự động tính giờ chuẩn & giờ tăng ca (OT), tính lương tạm tính, xuất Excel. |
| **9** | **Live Chat Hỗ Trợ Khách Từ Bot** | `Staff` | Nhận phiên hỗ trợ khi khách cần gặp nhân viên tư vấn, gửi tin nhắn và hình ảnh đính kèm, hoàn tất hoặc từ chối phiên. |
| **10**| **Team Chat Nội Bộ** | `Tất cả` | Khung chat nội bộ tức thì giữa các nhân sự hoặc phát thông báo chung toàn cửa hàng, hỗ trợ gửi ảnh minh họa. |
| **11**| **Quản Trị Hệ Thống & Kiểm Toán** | `Admin` | Quản lý tài khoản, phân quyền vai trò, mở/khóa user, đặt lại mật khẩu nhanh, nhật ký Audit Logs lưu vết payload JSON, cấu hình AI. |

---

## 🧠 Động cơ Trí tuệ Nhân tạo (Dual AI Engine)

Hệ thống sở hữu kiến trúc AI độc lập tại `backend/src/services/aiService.js` và `backend/src/services/botAgentService.js`:

### 1. Động cơ Google Gemini Cloud
- Hỗ trợ các dòng mô hình mới nhất: `gemini-3.8-flash` (mặc định), `gemini-3.6-flash`, `gemini-3.1-flash-lite`.
- **Cơ chế Auto Failover:** Tự động phát hiện lỗi quá tải hoặc giới hạn rate-limit để chuyển tiếp mượt mà sang mô hình dự phòng mà không làm gián đoạn trải nghiệm người dùng.
- Tích hợp kỹ thuật **Retrieval-Augmented Generation (RAG)** dựa trên tài liệu nghiệp vụ tại `backend/knowledge/` (chính sách đổi trả, bảo hành, trả góp).

### 2. Động cơ Ollama Local (Mạng Nội Bộ)
- Kết nối trực tiếp tới máy chủ Ollama chạy cục bộ (mặc định `http://127.0.0.1:11434`).
- Tự động nạp danh sách mô hình hiện có (`llama3`, `qwen2.5`, `mistral`, `gemma2`,...).
- Hoạt động 100% offline, miễn phí chi phí token, bảo mật tuyệt đối dữ liệu nội bộ cửa hàng.

---

## 🛠️ Kiến trúc & Công nghệ (Tech Stack)

### Backend
- **Nền tảng:** Node.js (ES Modules `import/export`).
- **Web Framework:** Express.js 4.x.
- **Cơ sở dữ liệu:** SQLite 3 (`backend/database/ecom_ai.db`) với parameterized queries an toàn chống SQL Injection.
- **Xác thực & Bảo mật:** JSON Web Token (JWT) + Bcrypt băm mật khẩu + Activity Notification Middleware.
- **File Upload:** Multer xử lý ảnh đính kèm (hóa đơn, chứng từ, chat) kiểm soát dung lượng và định dạng an toàn.

### Frontend
- **Kiến trúc:** Vanilla JavaScript MVC thuần túy.
  - `models/`: Giao tiếp API qua `ApiClient` (fetch bọc Axios-like).
  - `views/`: Kết xuất HTML ngữ nghĩa, phân tách view shells và view pages độc lập.
  - `controllers/`: Điều phối sự kiện DOM, vòng đời view và kết nối nghiệp vụ.
- **Styling:** Tailwind CSS tích hợp tùy biến Design Tokens HTH Smart Sales.
- **Hiển thị biểu đồ:** HTML5 Canvas tương thích cao.

---

## 📁 Cấu trúc Thư mục Dự án

```text
BanHangAI/
├── backend/
│   ├── database/
│   │   ├── ecom_ai.db                 # SQLite database chính
│   │   ├── init.sql                   # Schema khởi tạo các bảng
│   │   └── scripts/                   # Migration & Seed scripts
│   ├── knowledge/                     # Tài liệu RAG cho Trợ lý AI
│   ├── src/
│   │   ├── controllers/               # 14 controllers xử lý nghiệp vụ API
│   │   ├── middlewares/               # JWT Auth, Activity Audit Log
│   │   ├── routes/                    # Định tuyến REST API
│   │   ├── services/                  # AI service, Bot agent, DB connection
│   │   └── server.js                  # Entry point máy chủ Express
│   ├── tests/                         # Bộ kiểm thử tự động
│   └── package.json
│
├── frontend/
│   ├── assets/images/                 # Logo AI & nhận diện hệ thống
│   ├── src/
│   │   ├── core/                      # Router, ApiClient, EventBus
│   │   ├── controllers/               # 16 Controllers MVC Frontend
│   │   ├── models/                    # Data models
│   │   ├── views/
│   │   │   ├── layouts/               # Master LayoutView, ChatModule, InternalChat
│   │   │   └── pages/                 # 12 Màn hình nghiệp vụ chính
│   │   └── app.js                     # Khởi tạo ứng dụng & routing
│   └── index.html                     # Trang chủ & điểm gắn kết DOM
│
├── prompts/                           # Quy chuẩn kỹ thuật & codebasemap
├── specs/                             # Đặc tả yêu cầu phần mềm (SRS, Design)
└── README.md
```

---

## 🚀 Hướng dẫn Khởi chạy Nhanh (Quick Start)

### 1. Yêu cầu tiên quyết
- **Node.js:** Phiên bản `>= 18.0.0`.
- **Trình quản lý gói:** `npm` đi kèm Node.js.
- Một trình duyệt web hiện đại (Chrome, Edge, Firefox).

### 2. Khởi động Máy chủ Backend (Cổng 5000)
Mở Terminal tại thư mục gốc của dự án:

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt các gói phụ thuộc (chỉ cần chạy lần đầu)
npm install

# Khởi chạy máy chủ (sử dụng cấu hình mặc định sẵn có)
npm start

# Hoặc chạy ở chế độ phát triển (tự động reload khi sửa mã)
npm run dev
```
> Backend API sẽ sẵn sàng lắng nghe tại: `http://localhost:5000`  
> 💡 *Hệ thống tích hợp cơ chế Zero-Config: File `backend/.env` đã có sẵn cấu hình mặc định để khởi chạy ngay mà không bắt buộc phải đăng ký key AI bên ngoài.*

### 3. Khởi động Giao diện Frontend (Cổng 5500)
Mở một cửa sổ Terminal mới:

```bash
# Khởi chạy máy chủ tĩnh phục vụ frontend (dùng npx serve hoặc Live Server)
npx serve frontend -l 5500
```
> Truy cập ứng dụng tại trình duyệt: **`http://localhost:5500`**

---

### ⚙️ Cấu hình Biến Môi trường Nâng cao (Tùy chọn)

File cấu hình đặt tại: `backend/.env` (tham khảo mẫu tại `backend/.env.example`). Nếu bạn muốn tùy biến khóa bảo mật hoặc tích hợp Google Gemini Cloud:

| Biến môi trường | Bắt buộc | Giá trị mặc định / Fallback | Mục đích & Mô tả chi tiết |
|:---|:---:|:---|:---|
| `JWT_SECRET` | Không | `fallback_secret_banhangai` | Khóa bí mật ký token xác thực người dùng. Khuyến nghị thay đổi khi deploy production. |
| `GEMINI_API_KEY` | Không | *(Để trống)* | Khóa API Google Gemini từ [Google AI Studio](https://aistudio.google.com/). Nếu để trống, hệ thống tự động ưu tiên động cơ **Ollama Local** (miễn phí, offline) hoặc chạy chế độ cơ bản. |
| `BOT_OTP_MODE` | Không | `demo` | Chế độ xác thực OTP cho Bot khách hàng: `demo` (tự động duyệt) hoặc `sms` (yêu cầu gửi qua SMS Gateway). |
| `SMS_GATEWAY_URL` | Không | *(Để trống)* | Địa chỉ webhook cổng gửi SMS khi chạy chế độ SMS. |
| `SMS_GATEWAY_TOKEN` | Không | *(Để trống)* | Token xác thực gửi kèm webhook SMS Gateway. |
| `BOT_OTP_SECRET` | Không | *(Để trống)* | Khóa bí mật riêng (tối thiểu 32 ký tự) dùng cho luồng OTP SMS. |

> 📌 *Nếu cần sao chép file cấu hình mẫu:*
> - **Windows (PowerShell / CMD):** `copy backend\.env.example backend\.env`
> - **Linux / macOS:** `cp backend/.env.example backend/.env`

---

## 🔑 Tài khoản Demo Hệ thống

Mọi tài khoản mẫu đã được khởi tạo sẵn trong cơ sở dữ liệu với mật khẩu mặc định là: **`123456`**

| Vai trò | Tên đăng nhập (Username) | Mật khẩu | Quyền hạn chính |
|:---|:---:|:---:|:---|
| **Admin** | `admin` | `123456` | Toàn quyền cấu hình AI, quản trị user, kiểm toán logs. |
| **Owner** | `owner` | `123456` | Xem báo cáo tài chính, quản lý sổ quỹ, kho hàng và duyệt lương. |
| **Staff** | `staff` | `123456` | Lập hóa đơn POS, tra cứu kho, chấm công và chat hỗ trợ khách. |
| **Customer** | Khách vãng lai | *Tự do* | Tương tác qua Trợ lý Bot trên trang chủ, đặt hàng. |

---

## 🧪 Kiểm thử Tự động (Automated Tests)

Hệ thống tích hợp sẵn bộ kiểm thử tự động kiểm tra tính đúng đắn của toàn bộ luồng nghiệp vụ bán hàng (POS, Giỏ hàng, Bán thẳng, Bán trả góp đối tác tài chính):

```bash
# Chạy bộ test POS từ thư mục gốc
node backend/tests/run_pos_tests.js
```

**Kết quả kiểm thử chuẩn:**
```text
=== BẮT ĐẦU THỰC THI KIỂM THỬ TỰ ĐỘNG ===
✅ POS-UI-01: Thanh toán khi giỏ hàng trống -> PASS (Bảo vệ dữ liệu rỗng)
✅ POS-FULL-01: Bán đứt thành công -> PASS (Tạo hóa đơn, trừ kho, ghi nhận doanh thu)
✅ POS-INST-02: Tạo đơn trả góp thành công -> PASS (Liên kết đối tác, tính khoản vay)
=== TỔNG KẾT ===
Tổng số test: 3 | PASS: 3 | FAIL: 0 (100% SUCCESS)
```

---

## 📐 Kỷ luật Kiến trúc & Đóng góp

Để duy trì chất lượng mã nguồn và tính toàn vẹn của dự án, vui lòng tuân thủ các nguyên tắc được định nghĩa trong [prompts/ANTIGRAVITY.md](file:///D:/BanHangAI/prompts/ANTIGRAVITY.md):

1. **Bảo tồn tính toàn vẹn MVC:** Không viết trực tiếp logic database vào routes hay views. Luôn đi qua luồng `Route -> Middleware -> Controller -> Service/DB`.
2. **Bảo tồn Selector DOM:** Khi cập nhật giao diện, giữ nguyên 100% các `id`, `data-*` attributes và cấu trúc liên kết đã được controllers ánh xạ.
3. **Workspace Maximized Rule:** Luôn ưu tiên độ thoáng đãng, tinh gọn, tránh thêm các khối tiêu đề lặp lại hoặc padding quá khổ gây chiếm dụng không gian làm việc của nhân viên thu ngân.
4. **Bảo mật:** Luôn tham số hóa câu truy vấn SQL (`?`), băm mật khẩu bằng `bcrypt`, và lưu thông tin nhạy cảm trong biến môi trường `.env`.

---

<div align="center">
  <sub>Phát triển và duy trì bởi đội ngũ <strong>HTH Smart Sales Team</strong> • Bản quyền © 2026</sub>
</div>
