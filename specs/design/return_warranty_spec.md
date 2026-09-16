# Đặc Tả Thiết Kế (Design Specs): Module Đổi Trả Hàng & Bảo Hành Cho Staff

## 1. Wireframe Giao Diện (Staff Return & Warranty View)

**Màn hình chính: Xử lý Đổi trả & Bảo hành**
```text
+-------------------------------------------------------------------------------------------+
| [Đổi trả] [Bảo hành] [Lịch sử xử lý]                            [Nhân viên: NV01 - Lan] |
+-------------------------------------------------------------------------------------------+
|                                                                                           |
| TÌM KIẾM HÓA ĐƠN / KHÁCH HÀNG                                                            |
| Mã hóa đơn: [HD-20260916-001]   SĐT: [0912....]   [Tìm hóa đơn] [Khách hàng mới]       |
|                                                                                           |
| +-----------------------------+   +-----------------------------------------------+
| | HÓA ĐƠN ĐÃ MUA             |   | CHI TIẾT XỬ LÝ                               |
| |---------------------------|   |-----------------------------------------------|
| | HD-001 | 10/09/2026       |   | Sản phẩm: iPhone 15 Pro                     |
| | Khách: Nguyễn Văn A       |   | Hạng mục: Đổi sản phẩm | Trả hàng | Bảo hành |
| |-----------------------------------------------| | Lý do: Hỏng màn hình / Không phù hợp /     |
| | [✓] iPhone 15 Pro 1x     |   |        Sai sản phẩm / Khác...             |
| |   Màu: Titan, Mã SN: N12  |   | Thời hạn: 12 tháng, còn 6 tháng            |
| |   Giá: 29,990,000đ        |   | Điều kiện đổi trả: Hợp lệ                 |
| | [✓] Cáp sạc 1x            |   | Số tiền hoàn: 0đ | Chênh lệch: 4,500,000đ |
| |   Giá: 500,000đ           |   | Sản phẩm thay thế: [iPhone 16 Pro ▼]      |
| | [✓] Ốp lưng 1x            |   | Xử lý: [Đổi hàng] [Trả tiền] [Bảo hành]   |
| |   Giá: 350,000đ           |   | Trạng thái: [Đã xác nhận]                 |
| |___________________________|   | Ghi chú: [.............................] |
| | [Chọn tất cả] [Bỏ chọn]   |   | [Hủy] [Lưu xử lý] [Duyệt]                |
| +-----------------------------+   +-----------------------------------------------+
|                                                                                           |
| THÔNG TIN XÁC MINH                                                                       |
| Hàng còn nguyên vẹn: [ ] Có   [x] Không   | Hóa đơn kèm theo: [x] Có   [ ] Không       |
| Tình trạng sản phẩm: [Mới 95%] [Hỏng men] [Hư do khách] [Khác]                        |
| Nhân viên xử lý: [Lan]   Thời gian: 17:35 16/09/2026                                   |
|                                                                                           |
+-------------------------------------------------------------------------------------------+
```

### Mô tả chức năng chính
- Staff nhập mã hóa đơn hoặc SĐT để tìm kiếm đơn hàng đã bán.
- Hệ thống lọc ra các sản phẩm thuộc đơn hàng, hiển thị trạng thái mua và thời gian bảo hành còn lại.
- Staff chọn 1 hoặc nhiều sản phẩm, sau đó chọn loại xử lý:
  - Đổi hàng: đổi sang sản phẩm khác hoặc cùng loại với chênh lệch giá.
  - Trả hàng: hoàn tiền hoặc trừ vào tài khoản mua tiếp.
  - Bảo hành: tạo phiếu bảo hành, ghi nhận lỗi và tiến độ xử lý.
- Hệ thống kiểm tra các điều kiện chính sách tự động: thời hạn, tình trạng hàng, hóa đơn, số lượng, tồn kho, khiếu nại do lỗi nhà cung cấp.
- Sau khi staff xác nhận, hệ thống sinh yêu cầu và cập nhật kho, doanh thu, log auditor.

## 2. Database Schema

### 2.1 Bảng `returns`
Lưu trữ yêu cầu đổi/trả tổng thể.

```sql
CREATE TABLE returns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  customer_id INTEGER,
  customer_name TEXT,
  customer_phone TEXT,
  return_type TEXT NOT NULL CHECK(return_type IN ('exchange', 'refund', 'store_credit')),
  reason TEXT,
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','completed','cancelled')),
  approved_by INTEGER,
  refund_amount REAL DEFAULT 0,
  exchange_product_id INTEGER,
  notes TEXT,
  created_by INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1,

  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (exchange_product_id) REFERENCES products(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 2.2 Bảng `return_items`
Lưu từng sản phẩm trong yêu cầu đổi/trả.

```sql
CREATE TABLE return_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  return_id INTEGER NOT NULL,
  order_item_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL,
  condition_status TEXT NOT NULL CHECK(condition_status IN ('new','used','damaged','defective','wrong_item')),
  defect_type TEXT,
  warranty_remaining_days INTEGER DEFAULT 0,
  refund_amount REAL DEFAULT 0,
  exchange_to_product_id INTEGER,
  exchange_delta_amount REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','completed')),

  FOREIGN KEY (return_id) REFERENCES returns(id),
  FOREIGN KEY (order_item_id) REFERENCES order_items(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (exchange_to_product_id) REFERENCES products(id)
);
```

### 2.3 Bảng `warranty_claims`
Lưu yêu cầu bảo hành theo sản phẩm / hóa đơn.

```sql
CREATE TABLE warranty_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  order_item_id INTEGER,
  product_id INTEGER NOT NULL,
  customer_id INTEGER,
  customer_name TEXT,
  customer_phone TEXT,
  serial_number TEXT,
  warranty_start_date DATETIME,
  warranty_end_date DATETIME,
  warranty_months INTEGER NOT NULL,
  claim_type TEXT NOT NULL CHECK(claim_type IN ('repair','replace','refund','inspection')),
  issue_description TEXT,
  issue_code TEXT,
  claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_review','approved','repairing','repaired','rejected','completed','cancelled')),
  approved_by INTEGER,
  created_by INTEGER NOT NULL,
  notes TEXT,
  resolution_notes TEXT,
  is_active INTEGER DEFAULT 1,

  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (order_item_id) REFERENCES order_items(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 2.4 Bảng `warranty_claim_details` (nếu cần chi tiết theo bước xử lý)

```sql
CREATE TABLE warranty_claim_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  warranty_claim_id INTEGER NOT NULL,
  step_no INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  staff_id INTEGER,
  action_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending',

  FOREIGN KEY (warranty_claim_id) REFERENCES warranty_claims(id),
  FOREIGN KEY (staff_id) REFERENCES users(id)
);
```

### 2.5 Gợi ý bổ sung cho bảng `products`
Với module bảo hành, nên có các trường sau trên `products` hoặc `product_serials`:

```sql
ALTER TABLE products ADD COLUMN warranty_months INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN warranty_type TEXT DEFAULT 'manufacturer';
ALTER TABLE products ADD COLUMN is_returnable INTEGER DEFAULT 1;
```

Nếu hệ thống dùng serial number chi tiết cho từng sản phẩm:

```sql
CREATE TABLE product_serials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  order_id INTEGER,
  order_item_id INTEGER,
  warranty_start_date DATETIME,
  warranty_end_date DATETIME,
  status TEXT DEFAULT 'sold',

  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (order_item_id) REFERENCES order_items(id)
);
```

## 3. API Specs

### 3.1 `POST /api/returns`
Tạo yêu cầu đổi/trả hàng.

**Quyền:** Staff, Admin, Manager.

**Request body:**
```json
{
  "order_id": 101,
  "customer_id": 42,
  "customer_name": "Nguyễn Văn A",
  "customer_phone": "0912345678",
  "return_type": "exchange",
  "reason": "Sản phẩm bị lỗi màn hình",
  "exchange_product_id": 18,
  "notes": "Khách muốn đổi sang model cao hơn",
  "items": [
    {
      "order_item_id": 55,
      "product_id": 12,
      "quantity": 1,
      "condition_status": "defective",
      "defect_type": "screen_broken",
      "refund_amount": 0,
      "exchange_to_product_id": 18,
      "exchange_delta_amount": 4500000
    }
  ]
}
```

**Logic xử lý:**
- Kiểm tra đơn hàng tồn tại và thuộc khách hàng.
- Kiểm tra sản phẩm trong đơn hàng có bị hủy/đổi trước đó chưa.
- Xác định trạng thái hợp lệ theo chính sách cửa hàng:
  - `return_type = exchange` => cho phép đổi hàng trong thời hạn quy định.
  - `return_type = refund` => hoàn tiền theo giá thực tế còn lại.
  - `return_type = store_credit` => tạo credit cho lần mua sau.
- Nếu đổi hàng, kiểm tra tồn kho của sản phẩm mới.
- Lưu `return_items` và `returns`.
- Ghi log audit.

**Response:**
```json
{
  "success": true,
  "return_id": 3001,
  "status": "pending",
  "message": "Yêu cầu đổi trả đã được tạo thành công"
}
```

---

### 3.2 `GET /api/returns`
Danh sách yêu cầu đổi trả.

**Query params:**
- `status` (`pending|approved|rejected|completed|cancelled`)
- `customer_id`
- `order_id`
- `created_by`
- `from_date`, `to_date`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3001,
      "order_id": 101,
      "customer_name": "Nguyễn Văn A",
      "return_type": "exchange",
      "status": "pending",
      "requested_at": "2026-09-16T17:30:00Z",
      "refund_amount": 0,
      "items": [
        {
          "product_id": 12,
          "product_name": "iPhone 15 Pro",
          "condition_status": "defective",
          "exchange_to_product_id": 18,
          "exchange_delta_amount": 4500000
        }
      ]
    }
  ]
}
```

---

### 3.3 `PUT /api/returns/:id/approve`
Xử lý phê duyệt / từ chối yêu cầu đổi trả.

**Request body:**
```json
{
  "status": "approved",
  "approved_by": 7,
  "refund_amount": 0,
  "notes": "Đã xác nhận lỗi màn hình và chấp nhận đổi sang iPhone 16 Pro",
  "action": "exchange"
}
```

**Logic xử lý:**
- Nếu `status = approved`, cập nhật trạng thái yêu cầu và item.
- Nếu `action = refund`, trừ tiền tương ứng khỏi doanh thu hoặc tạo refund ledger.
- Nếu `action = exchange`, giảm tồn kho của sản phẩm mới; cập nhật `stock_quantity`.
- Nếu `status = rejected`, ghi rõ lý do từ chối.
- Ghi log kiểm toán theo `created_by` và `approved_by`.

---

### 3.4 `POST /api/warranty-claims`
Tạo yêu cầu bảo hành.

**Request body:**
```json
{
  "order_id": 101,
  "order_item_id": 55,
  "product_id": 12,
  "customer_id": 42,
  "customer_name": "Nguyễn Văn A",
  "customer_phone": "0912345678",
  "serial_number": "IP15P-000122",
  "warranty_months": 12,
  "warranty_start_date": "2026-01-10T00:00:00Z",
  "warranty_end_date": "2027-01-10T00:00:00Z",
  "claim_type": "repair",
  "issue_description": "Màn hình hiển thị sọc màu sau 5 tháng sử dụng",
  "issue_code": "DISPLAY_FAULT",
  "created_by": 8
}
```

**Logic xử lý:**
- Kiểm tra serial number và thời gian bảo hành còn hiệu lực.
- Nếu sản phẩm đã quá thời hạn bảo hành, từ chối ngay.
- Nếu lỗi thuộc phạm vi bảo hành, tạo phiếu xử lý với trạng thái `pending`.
- Nếu cần, gắn `approved_by` và chuyển sang `repairing` / `in_review`.

**Response:**
```json
{
  "success": true,
  "warranty_claim_id": 7001,
  "status": "pending",
  "message": "Yêu cầu bảo hành đã được tạo"
}
```

---

### 3.5 `GET /api/warranty-claims`
Danh sách bảo hành theo khách hàng / sản phẩm / trạng thái.

**Query params:**
- `status`
- `customer_id`
- `product_id`
- `serial_number`
- `from_date`, `to_date`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 7001,
      "product_id": 12,
      "product_name": "iPhone 15 Pro",
      "serial_number": "IP15P-000122",
      "warranty_end_date": "2027-01-10T00:00:00Z",
      "status": "repairing",
      "claim_type": "repair",
      "issue_description": "Màn hình hiển thị sọc màu" 
    }
  ]
}
```

---

### 3.6 `PUT /api/warranty-claims/:id/status`
Cập nhật trạng thái bảo hành.

**Request body:**
```json
{
  "status": "repaired",
  "approved_by": 9,
  "resolution_notes": "Đã thay màn hình LCD mới, kiểm tra xong",
  "notes": "Khách đã nhận hàng"
}
```

**Logic xử lý:**
- Cho phép cập nhật `pending -> in_review -> approved -> repairing -> repaired -> completed`.
- Nếu từ chối: `rejected` và lưu lý do.
- Ghi lại `resolution_notes` để truy vết sau này.

---

## 4. Quy tắc nghiệp vụ chính

### 4.1 Chính sách đổi trả
- Đổi/trả trong vòng 7 ngày kể từ ngày mua với đơn hàng tại cửa hàng.
- Sản phẩm phải còn nguyên hộp, phụ kiện, tem, chưa qua sửa chữa và không hư hỏng do người dùng.
- Nếu sản phẩm sai, lỗi từ nhà sản xuất, hoặc hỏng do vận chuyển: cho phép đổi/trả ngay mà không cần chịu phí kiểm tra.
- Nếu sản phẩm không còn hàng, có thể đổi sang sản phẩm tương đương hoặc hoàn tiền tương ứng.

### 4.2 Chính sách bảo hành
- Bảo hành theo thời hạn từ nhà sản xuất / chính sách cửa hàng.
- Trường hợp lỗi do nhà sản xuất: hỗ trợ sửa chữa hoặc đổi mới theo cam kết.
- Trường hợp lỗi do vận hành / va đập / rơi vỡ: không nằm trong bảo hành, cần thanh toán chi phí sửa chữa.
- Tất cả yêu cầu bảo hành phải có.serial_number/ hóa đơn và không được xóa khỏi lịch sử.

### 4.3 Kiểm toán và audit log
- Mỗi thao tác đổi trả / bảo hành phải lưu:
  - thời gian
  - nhân viên xử lý
  - trạng thái trước/sau
  - lý do chấp nhận/từ chối
  - người phê duyệt
- Bảng audit log được dùng để quản lý và tra cứu sau này.

## 5. Gợi ý UX / lưu ý thiết kế cho Staff

- Nút tìm kiếm nên ưu tiên theo mã hóa đơn, SĐT, tên khách hàng.
- Mỗi sản phẩm trong hóa đơn nên có tag: `Có thể đổi`, `Có thể trả`, `Trong bảo hành`, `Hết thời hạn`.
- Staff không nên xử lý trực tiếp hoàn tiền lớn nếu vượt ngưỡng quyền hạn; cần chuyển sang Manager/Admin.
- Chỉ cho phép tạo bảo hành khi đúng `serial_number` và `warranty_end_date > now`.
- Màn hình nên dùng trạng thái rõ ràng: `Chờ xử lý`, `Đang xét`, `Đã duyệt`, `Hoàn tất`, `Từ chối`.

## 6. Kết luận

Module đổi trả hàng và bảo hành cho Staff cần gắn chặt với đơn hàng, sản phẩm, thời hạn bảo hành và quy trình kiểm toán. Việc thiết kế theo hướng kết hợp dữ liệu `orders`, `order_items`, `returns`, `warranty_claims` giúp cửa hàng quản lý được cả khía cạnh bán hàng lẫn hậu mãi sau bán hàng mà không làm rối dữ liệu hiện có.
