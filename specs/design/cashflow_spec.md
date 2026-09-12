# Đặc Tả Thiết Kế (Design Specs): Module Sổ Quỹ (Cashflow)

## 1. Wireframe Giao Diện (Owner Cashflow View)

**Khối Thống kê Nhanh (Summary)**
```text
+-------------------+ +-------------------+ +--------------------------------+
| TỔNG THU (THÁNG)  | | TỔNG CHI (THÁNG)  | | TỔNG TỒN QUỸ                   |
| 150,000,000 đ     | | 20,000,000 đ      | | 130,000,000 đ                  |
|                   | |                   | | - Tiền mặt tại két: 50M        |
|                   | |                   | | - Chuyển khoản (NH): 70M       |
|                   | |                   | | - Nhân viên cầm:               |
|                   | |                   | |   + NV A: 5M [Thu]             |
|                   | |                   | |   + NV B: 5M [Thu]             |
+-------------------+ +-------------------+ +--------------------------------+
```

**Bảng Sổ Quỹ (Transaction Table)**
```text
[Sổ Quỹ Thu Chi]    [🔍 Tìm mã HĐ...] [Bộ Lọc v] [Tháng 9 v] [ + Lập Phiếu ]
---------------------------------------------------------------------------------
 THỜI GIAN       LOẠI     MÃ HĐ / DIỄN GIẢI      SỐ TIỀN       P.THỨC   NGUỒN
---------------------------------------------------------------------------------
 10/09 14:00     [THU]    INV-2409-12            + 5,000,000đ  T.Mặt    Tự động
                          Bán hàng                                      (NV A)
---------------------------------------------------------------------------------
 09/09 09:00     [CHI]    --                     - 2,000,000đ  C.Khoản  Thủ công
                          Tiền điện tháng 8                             (Owner)
---------------------------------------------------------------------------------
```

## 2. Database Schema

**Bảng `transactions`**
- `id` (INTEGER, PK, AI)
- `type` (TEXT) - 'income' (Thu) hoặc 'expense' (Chi)
- `amount` (REAL) - Số tiền
- `category` (TEXT) - Nhóm (Bán hàng, Thu tiền trả góp, Chi phí, Khác)
- `description` (TEXT) - Lý do/Diễn giải
- `user_id` (INTEGER, FK) - Người thực hiện giao dịch
- `payment_method` (TEXT) - 'cash' (Tiền mặt), 'transfer' (Chuyển khoản), 'card'
- `source` (TEXT) - 'auto' (Sinh từ hệ thống POS/Trả góp) hoặc 'manual' (Lập tay)
- `invoice_id` (TEXT) - Mã hóa đơn nếu source = auto (VD: INV-2409-12)
- `created_at` (DATETIME)

## 3. API Specs

**`GET /api/transaction/summary`**
- **Quyền:** Owner/Admin.
- **Xử lý:** 
  1. Tính `total_income`, `total_expense` trong tháng hiện tại.
  2. Tính `total_transfer` (số dư qua NH).
  3. Tính `total_cash_staff` (tiền mặt do từng thu ngân thu nhưng chưa nộp lại cho chủ).
  4. Trả về `cash_breakdown`.

**`GET /api/transaction`**
- Hỗ trợ các query params: `month` (YYYY-MM), `type`, `source`, `payment_method`, `user_id`.

**`POST /api/transaction`**
- **Body:** `{ "type": "expense", "amount": 2000000, "category": "Chi phí", "description": "Tiền điện", "payment_method": "transfer" }`
- **Xử lý:** Tạo phiếu thủ công (`source='manual'`). 

**`POST /api/transaction/collect`**
- **Body:** `{ "staff_id": 2, "amount": 5000000 }`
- **Xử lý:** Chuyển tiền từ túi nhân viên (cash) sang két của chủ (safe). Thực chất là tạo phiếu nộp tiền/bàn giao ca.
