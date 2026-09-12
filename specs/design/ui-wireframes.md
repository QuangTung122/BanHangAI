# Wireframe Giao diện Hệ thống - Dựa trên Thực tế

## 1. Màn hình Bán hàng - POS (`StaffPOSView`)

```text
+-----------------------------------------------------------------------------+
| TÌM KIẾM & PHÂN LOẠI                                                        |
| [🔍 Tìm kiếm sản phẩm nhanh... (Hỗ trợ quét mã vạch)                      ] |
| (Tất cả) (Tai nghe) (Điện thoại) (Phụ kiện) (Đồng hồ thông minh)            |
+-------------------------------------------------------+---------------------+
| DANH SÁCH SẢN PHẨM (Lưới lưới chia cột)               | GIỎ HÀNG            |
|                                                       |                     |
| +-------------------------+ +-----------------------+ | [ Tai nghe A1  [x]] |
| | [Hình ảnh SP]           | | [Hình ảnh SP]         | | 350,000 x 2       |
| | Tai nghe                | | Điện thoại            | | [-] 2 [+]         |
| | Tai nghe Sony WH-1000.. | | iPhone 15 Pro Max     | | ----------------- |
| | 6,500,000 VNĐ           | | 30,000,000 VNĐ        | | THÔNG TIN KHÁCH:  |
| | Kho: 10                 | | Kho: 15               | | [ Tên khách     ] |
| | [ Thêm vào đơn ]        | | [ Thêm vào đơn ]      | | [ Số điện thoại ] |
| +-------------------------+ +-----------------------+ | Loại thanh toán:  |
|                                                       | [ Trả thẳng / Góp ] |
| +-------------------------+ +-----------------------+ | Nhận tiền:        |
| | [Hình ảnh SP]           | | [Hình ảnh SP]         | | [ Tiền mặt / CK ] |
| | Phụ kiện                | | Đồng hồ               | | ----------------- |
| | Cáp sạc Anker Type-C    | | Apple Watch Series 9  | | Tổng: 700,000 VNĐ |
| | 350,000 VNĐ             | | 9,500,000 VNĐ         | | [ THANH TOÁN ]    |
| | Kho: 100                | | Kho: 18               | |                     |
| | [ Thêm vào đơn ]        | | [ Thêm vào đơn ]      | |                     |
| +-------------------------+ +-----------------------+ |                     |
+-------------------------------------------------------+---------------------+
```

## 2. Màn hình Dashboard Quản trị (`OwnerDashboardView`)

```text
+-----------------------------------------------------------------------------+
| DOANH THU                     | ĐƠN HÀNG                   | SẮP HẾT HÀNG   |
| Tổng doanh thu                | Đơn hàng hoàn thành        | Sản phẩm       |
| 15,400,000 VNĐ                | 12 đơn                     | 5 sản phẩm     |
+-------------------------------+----------------------------+----------------+
| BIỂU ĐỒ DOANH THU (7 ngày qua)| TOP BÁN CHẠY NHẤT                           |
| |                             |                                             |
| |      [||]                   | #1 Tai nghe Sony WH...        15 sản phẩm   |
| |  [|] [||]       [|]         | #2 Cáp sạc Anker...           10 sản phẩm   |
| |  [|] [||]  [|]  [|]         | #3 Ốp lưng Spigen...          8 sản phẩm    |
| +-------------------------    |                                             |
|   T2   T3   T4   T5           |                                             |
+-------------------------------+---------------------------------------------+
| AI INSIGHT                                         [ Phân Tích Dữ Liệu Thực]|
| --------------------------------------------------------------------------- |
| *Nhấn nút để AI phân tích số liệu mới nhất và đưa ra lời khuyên...*         |
| (Kết quả sẽ hiện ra ở đây, ví dụ: "Doanh thu đang tập trung vào phụ kiện,   |
| hãy nhập thêm sạc dự phòng để tối ưu lợi nhuận...")                         |
+-----------------------------------------------------------------------------+
```

## 3. Tính năng Trợ Lý Chat AI (Module Độc Lập)

Hệ thống sử dụng một nút Chat Floating góc dưới màn hình hoặc Tích hợp trong trang Landing Page (`index.html`).

```text
+------------------------------------+
| Trợ Lý AI                      [X] |
+------------------------------------+
| [AI]: Chào bạn, tôi là trợ lý AI   |
|       của cửa hàng, tôi có thể     |
|       giúp gì cho bạn?             |
|                                    |
| [Bạn]: Tôi muốn tìm điện thoại     |
|        chơi game tốt dưới 25tr.    |
|                                    |
| [AI]: Trong tầm giá dưới 25tr,     |
|       cửa hàng có Xiaomi 14 Pro    |
|       (22tr) rất phù hợp chơi game |
|       do cấu hình tản nhiệt tốt... |
+------------------------------------+
| [Nhập câu hỏi của bạn...]    [Gửi] |
+------------------------------------+
```
