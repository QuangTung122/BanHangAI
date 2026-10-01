# Hướng dẫn Sử dụng Trợ lý AI (Chatbot BanHangAI)

Trợ lý AI của BanHangAI được thiết kế tối ưu để hỗ trợ cả nhân viên (Staff) và quản lý (Admin/Owner) trong quá trình tư vấn bán hàng, tra cứu thông tin và phân tích số liệu.

Để chatbot hoạt động với **tốc độ siêu tốc (dưới 2 giây)** và độ chính xác tuyệt đối (không bị ảo giác/nhầm lẫn số liệu), bạn nên ưu tiên sử dụng hệ thống **Tổ hợp lệnh nhanh (Slash Commands)**.

---

## 1. CÁC TỔ HỢP LỆNH CHÍNH (SLASH COMMANDS)

Thay vì gõ những câu hỏi dài dòng, bạn chỉ cần gõ ký tự `/` (dấu gạch chéo) vào khung chat. Một menu tiện ích hiện ra để bạn click chọn các lệnh sau:

### 💰 `/giá [tên sản phẩm / mã SKU]`

- **Mục đích:** Tra cứu nhanh giá bán hiện tại và phần trăm chiết khấu của sản phẩm.
- **Đối tượng:** Staff, Owner, Admin.
- **Cách dùng:** Gõ `/giá tai nghe bluetooth` hoặc `/giá iphone 15`.

### 📦 `/tồn kho [tên sản phẩm / mã SKU]`

- **Mục đích:** Kiểm tra số lượng hàng còn trong kho và xem hệ thống có đang cảnh báo hết hàng không để thông báo cho khách.
- **Đối tượng:** Staff, Owner, Admin.
- **Cách dùng:** Gõ `/tồn kho ốp lưng`.

### 👤 `/khách hàng [số điện thoại hoặc tên]`

- **Mục đích:** Lấy lịch sử 3 đơn mua hàng gần nhất và các phiếu bảo hành của khách đó để tiện theo dõi và chăm sóc.
- **Đối tượng:** Staff, Owner, Admin.
- **Cách dùng:** Gõ `/khách hàng 0912345678` hoặc `/khách hàng Nguyễn Văn A`.

### 📊 `/báo cáo [hôm nay / tháng này / năm nay]`

- **Mục đích:** Xem nhanh báo cáo tổng doanh thu và tổng số đơn hàng đã hoàn tất.
- **Đối tượng:** Staff, Owner, Admin.
- **Cách dùng:** Gõ `/báo cáo hôm nay`, `/báo cáo tháng này`.

### 📋 `/liệt kê [danh mục / đơn hàng / sản phẩm...]`

- **Mục đích:** Trích xuất và liệt kê nhanh các cơ sở dữ liệu (ví dụ: các loại danh mục, các đơn hàng gần đây, hoặc danh sách sản phẩm khớp với điều kiện).
- **Đối tượng:** Staff, Owner, Admin.
- **Cách dùng:** Gõ `/liệt kê danh mục`, `/liệt kê đơn hàng`, hoặc `/liệt kê tai nghe`.

### 💡 `/tư vấn [từ khóa nhu cầu]`

- **Mục đích:** Khi khách hàng đưa ra yêu cầu chung chung, hệ thống sẽ tự động đối chiếu các thẻ (tags) và mô tả trong kho để lọc ra 3 sản phẩm tốt nhất cho AI tư vấn.
- **Đối tượng:** Staff.
- **Cách dùng:** Gõ `/tư vấn laptop sinh viên` hoặc `/tư vấn điện thoại pin trâu`.

---

## 2. MẸO NHẮN TIN HIỆU QUẢ VỚI CHATBOT

Để biến Chatbot thành cánh tay phải đắc lực, hãy lưu ý các mẹo sau:

1. **Sử dụng Menu thông minh (Click thay vì Gõ):** Bạn không cần gõ thủ công toàn bộ câu lệnh. Hãy bấm vào **biểu tượng Menu (góc trái thanh chat)** hoặc chỉ cần gõ một dấu `/`, bảng chọn lệnh sẽ xuất hiện. Bấm chọn lệnh, sau đó chỉ việc điền phần [từ khóa] là xong.
2. **Luôn ưu tiên dùng lệnh `/`:** Các lệnh có dấu `/` sẽ bỏ qua bước "suy nghĩ" dò dẫm của AI và truy vấn thẳng vào CSDL máy chủ. Nhờ vậy, AI sẽ trả lời bạn gần như ngay lập tức và chính xác 100%.
3. **Gõ từ khóa rõ ràng:** Truy vấn của hệ thống dựa trên từ khóa. Nếu bạn gõ `/giá iphone`, hệ thống sẽ trả về nhiều loại. Hãy gõ chi tiết hơn như `/giá iphone 15 pro max` nếu bạn muốn biết kết quả ngay trong 1 nốt nhạc.
4. **Chat tự nhiên (Native Tools Fallback):** Nếu bạn vô tình quên lệnh và hỏi theo cách thông thường (Ví dụ: *"Doanh thu hôm nay được bao nhiêu vậy bot?"*), Chatbot vẫn đủ thông minh để tự phân tích câu hỏi và truy xuất cơ sở dữ liệu. Tuy nhiên, cách hỏi này bắt buộc AI phải "suy nghĩ" vòng vèo nên sẽ làm bạn đợi lâu hơn từ 2-3 giây so với việc dùng lệnh `/thống kê`.

---

## 3. LƯU Ý VỀ BẢO MẬT & PHÂN QUYỀN

Hệ thống AI được áp dụng các lớp bảo mật rất chặt chẽ:

- **Quyền truy cập:** Hiện tại hệ thống đã gỡ bỏ các giới hạn phân quyền, do đó tất cả các vai trò (Staff, Owner, Admin) đều có thể sử dụng tất cả các hàm truy vấn của chatbot, bao gồm cả việc tra cứu doanh thu và báo cáo kinh doanh.
- **Cấm bịa đặt (Zero Hallucination):** Chatbot bị ép buộc chỉ được phép trả lời dựa trên những dữ liệu sản phẩm đang thực sự TỒN TẠI TRONG HỆ THỐNG. Bot không có quyền bịa đặt các thông số kỹ thuật, cũng không được tự hứa hẹn các chính sách giảm giá ngoài luồng với khách hàng.

---

## 4. HƯỚNG DẪN DÀNH CHO LẬP TRÌNH VIÊN: CÁCH THÊM HÀM TRUY VẤN MỚI CHO CHATBOT

Hệ thống hỗ trợ 2 cơ chế hoạt động cho Chatbot: gọi hàm tự động qua AI (Function Calling/Tools) và lệnh gõ nhanh (Slash Commands). Dựa vào cấu trúc tại `aiTool.js` và `aiService.js`, dưới đây là quy trình để thêm một truy vấn mới:

### 4.1. Thêm công cụ (Function Calling) để AI tự động suy luận

Khi bạn muốn AI tự động hiểu câu hỏi của người dùng và gọi hàm lấy dữ liệu, bạn cần thực hiện 3 bước tại file `backend/src/services/aiTool.js`:

1. **Viết hàm xử lý logic (`aiFunctions`):**

   - Thêm một hàm mới bên trong đối tượng `aiFunctions`.
   - Hàm nhận tham số `args` (từ AI truyền vào) và `userRole` (để kiểm tra phân quyền hoặc bảo mật nếu cần).
   - Truy vấn CSDL thông qua `db.query()`.
   - Đảm bảo bọc logic trong khối `try...catch` và luôn trả về một object (có thể chứa kết quả mảng, hoặc các thuộc tính `message` / `error` rõ ràng).
2. **Khai báo cấu trúc Tool cho AI (`geminiToolDeclarations`):**

   - Tại mảng `geminiToolDeclarations`, thêm khai báo cấu trúc cho hàm: Tên hàm (`name`), mô tả chức năng (`description`) và định nghĩa các tham số (`parameters`) theo định dạng JSON Schema.
   - Mô tả càng chi tiết, AI càng hiểu đúng thời điểm cần gọi hàm.
   - *(Hệ thống đã có luồng tự động chuyển đổi định dạng này sang chuẩn Ollama qua `ollamaToolDeclarations` nên bạn không cần khai báo lại)*.
3. **Cập nhật bộ định tuyến (Router - `executeAiTool`):**

   - Trong hàm `executeAiTool`, thêm một trường hợp (`case`) tương ứng vào vòng `switch` để thực thi và return kết quả từ hàm vừa tạo.

> **Luồng chạy ở `aiService.js`:**
> Khi sử dụng Gemini hay Ollama, hàm `generateChatStream` sẽ gửi các danh sách Tools. Nếu AI nhận thấy cần dùng tool, nó sẽ phản hồi bằng một "Function Call". `aiService.js` sẽ gọi `executeAiTool` nhận kết quả, sau đó trả trực tiếp cho AI để AI dựa vào đó sinh ra văn bản cuối cùng trả cho người dùng.

### 4.2. Thêm tổ hợp lệnh nhanh (Slash Commands)

Nếu bạn muốn chatbot truy xuất tức thời không thông qua quá trình suy luận của mô hình AI, giúp tăng tốc độ phản hồi (< 2s) và xuất trực tiếp UI đẹp mắt. Bạn cập nhật tại `processSlashCommand` trong `aiTool.js`:

1. Thêm một nhánh điều kiện `else if (lowerMsg.startsWith('/lenh_moi'))`.
2. Xử lý phần từ khóa (loại bỏ phần lệnh `/lenh_moi` trong câu). Có thể kết hợp bóc tách regex tương tự hàm `parsePriceCondition`.
3. Gọi hàm truy vấn SQL trực tiếp để lấy dữ liệu.
4. Gán đối tượng chứa kết quả về biến `commandData` (Ví dụ: `commandData = { type: 'Tên Lệnh', keyword, data: results };`).
5. Trả về `commandData` để cho phép Frontend bắt lấy và tự định dạng giao diện hiển thị phù hợp.

�
�#�#� �5�.� �C���C�H� �V�I��T� �S�Y�S�T�E�M� �P�R�O�M�P�T� �� �I��U� �H���N�G� �B�O�T� �G��I� �H���M� �V��� �T�� �V��N�
�
�� �B�o�t� �h�o��t� ��n�g� ���n�g� �v�a�i� �t�r��� �(�v��a� �t�r�u�y� �v��n� �d�� �l�i��u� �c�h���n�h� �x���c�,� �v��a� �s�i�n�h� �l��i� �t�� �v��n� �h�a�y�)�,� �S�y�s�t�e�m� �P�r�o�m�p�t� �c��a� �C�h�a�t�b�o�t� �c��n� �t�u���n� �t�h�� �c��u� �t�r���c� �s�a�u�:�
�
�-� �*�*�Q�u�y� �t��c� �1�:� �H���m� �c�h�� �l��y� �d�� �l�i��u� �t�h���.�*�*� �K�h�i� �n�g���i� �d���n�g� �h��i� �m�u�a� �h���n�g�,� �B�o�t� �P�H��I� �g��i� �h���m� �\�	�i�m�_�k�i�e�m�_�s�a�n�_�p�h�a�m�\� �� �l��y� �d�� �l�i��u� �t��n� �k�h�o� �v��� �g�i��� �c��.� �K�H���N�G� �t�� �b��a� �r�a� �t�h���n�g� �t�i�n�.�
�-� �*�*�Q�u�y� �t��c� �2�:� �B�o�t� �l��� �n�g���i� �s�i�n�h� �l��i� �t�� �v��n�.�*�*� �H���m� �c�h�� �t�r�� �v�� �J�S�O�N�.� �T�r���c�h� �n�h�i��m� �c��a� �B�o�t� �l��� ��c� �J�S�O�N� ���,� �v��� �v�i��t� �r�a� �o��n� �t�� �v��n� �m��m� �m��n�g�,� �t�� �n�h�i���n�,� �t�h�u�y��t� �p�h��c� �k�h���c�h� �h���n�g� �m�u�a�.� �K�h���n�g� �b�a�o� �g�i�� �h�i��n� �t�h�� �n�g�u�y���n� �x�i� �c�h�u��i� �J�S�O�N� �c�h�o� �k�h���c�h�.�
�-� �*�*�Q�u�y� �t��c� �3�:� �T��n� �d��n�g� �d�� �l�i��u� �a� �d��n�g�.�*�*� �K�h�i� �t�h��y� �k�h���c�h� �m���n�g� �l�u�n�g�,� �g��i� �h���m� �\�x�e�m�_�d�a�n�h�_�m�u�c�\� �� �x�e�m� �c��� �g��� �r��i� �g��i� ���.� �K�h�i� �k�h���c�h� �h��i� �s�� �l�i��u� �b���n� �h���n�g�,� �g��i� �\��a�o�_�c�a�o�_�k�i�n�h�_�d�o�a�n�h�\� �r��i� �t��n�g� �h��p� �t�h���n�h� �o��n� �b���o� �c���o� �m��c�h� �l��c�.�
�
�
