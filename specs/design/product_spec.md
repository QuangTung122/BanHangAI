# Đặc Tả Thiết Kế (Design Specs): Module Quản lý Sản Phẩm

## 1. Wireframe Giao Diện (Owner Product View)

**Màn hình chính: Danh sách Sản phẩm**
```text
[ Quản lý Kho hàng & Sản phẩm ]                       [ + Thêm sản phẩm mới ]
-----------------------------------------------------------------------------
 [🔍 Tìm kiếm SP...   ]  [--Tất cả danh mục--] [Lọc] | [Tất cả] [Dồi dào] [Sắp hết]
-----------------------------------------------------------------------------
 ID   TÊN SẢN PHẨM        DANH MỤC     GIÁ NHẬP      GIÁ BÁN      TỒN KHO  THAO TÁC
-----------------------------------------------------------------------------
 1    [Ảnh] iPhone 15     Điện thoại   25,000,000    29,000,000   15       [Sửa][Xóa]
 2    [Ảnh] Ốp lưng       Phụ kiện     50,000        150,000      2        [Sửa][Xóa]
                                                                (Báo đỏ)
-----------------------------------------------------------------------------
```

**Popup Modal: Thêm / Sửa Sản Phẩm**
```text
+-------------------------------------------------------------+
|  Thêm sản phẩm mới                   [ ✨ AI Gợi ý ]   [X]  |
|-------------------------------------------------------------|
|  1. Thông tin chung                                         |
|  - Mã SP (SKU)*: [......................] [Tạo mã tự động]  |
|  - Tên SP*:      [......................]                   |
|  - Danh mục*:    [-- Chọn danh mục -- v ]                   |
|                                                             |
|  2. Giá & Kho                                               |
|  - Giá nhập:     [......................]                   |
|  - Giá bán:      [......................]                   |
|  - Tồn kho:      [......]  - Ngưỡng sắp hết: [..5...]       |
|                                                             |
|                          [ Hủy ]       [ LƯU SẢN PHẨM ]     |
+-------------------------------------------------------------+
```

## 2. Database Schema

- **Bảng `products`**: `id` (PK), `sku` (Mã SP/Barcode), `name`, `slug` (Unique), `category_id` (FK), `unit`, `import_price`, `price`, `image_url`, `stock_quantity`, `low_stock_threshold`, `is_active` (Mặc định 1).
- **Bảng `categories`**: `id`, `name`, `slug`, `is_active`.

## 3. API Specs

**`GET /api/product`**
- Hỗ trợ truyền Query Params: `search` (Tìm tên SP) và `category` (Lọc theo slug danh mục).
- Trả về danh sách SP với điều kiện `is_active = 1`, join thêm trường `category_name`.

**`POST /api/product` & `PUT /api/product/:id`**
- Nhận payload chứa các trường trên form.
- *Logic tự động:* Từ `name` chuyển thành `slug` không dấu. Nếu bị trùng `slug`, tự động nối thêm số `-1`, `-2`.

**`DELETE /api/product/:id`**
- Xóa mềm (Soft Delete). Update `is_active = 0` để không hiển thị ra lưới nhưng vẫn giữ lịch sử cho các hóa đơn cũ.
