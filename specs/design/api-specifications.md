# Đặc tả API (RESTful API Specifications)

Tài liệu này mô tả các API Endpoints của hệ thống Quản lý Bán hàng, kết nối giữa Frontend SPA và Backend Express.JS.

*Tất cả API response đều có định dạng chuẩn:*
```json
{
  "success": true,
  "message": "Thông báo trạng thái",
  "data": { ... }
}
```

## 1. System & Auth API (Xác thực và Hệ thống)
| Method | Endpoint | Role | Mô tả chức năng |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Đăng nhập hệ thống, trả về Token và User Info. |
| GET | `/api/auth/me` | All | Lấy thông tin user đang đăng nhập hiện tại từ Token. |
| GET | `/api/system/config` | All | Lấy các cấu hình hệ thống (như thông tin cửa hàng). |
| POST | `/api/system/config` | Admin | Cập nhật cấu hình hệ thống (Host AI, Model AI, Prompt). |

## 2. Users API (Tài khoản)
| Method | Endpoint | Role | Mô tả chức năng |
|---|---|---|---|
| GET | `/api/users` | Admin | Lấy danh sách tài khoản (Nhân viên, Chủ cửa hàng...). |
| POST | `/api/users` | Admin | Tạo tài khoản mới. |
| PUT | `/api/users/:id` | Admin | Cập nhật thông tin/Phân quyền tài khoản. |

## 3. Products API (Sản phẩm)
| Method | Endpoint | Role | Mô tả chức năng |
|---|---|---|---|
| GET | `/api/products` | All | Lấy danh sách sản phẩm (có query lọc `?category=` và search). |
| POST | `/api/products` | Owner | Thêm sản phẩm mới. |
| PUT | `/api/products/:id` | Owner | Sửa thông tin sản phẩm (giá, tồn kho). |
| DELETE| `/api/products/:id` | Owner | Xóa hoặc ẩn sản phẩm. |

## 4. Orders API (Đơn hàng & Giao dịch)
| Method | Endpoint | Role | Mô tả chức năng |
|---|---|---|---|
| GET | `/api/orders` | Staff, Owner| Lấy danh sách lịch sử đơn hàng. |
| POST | `/api/orders` | Staff | Tạo đơn hàng mới (Kèm danh sách item để trừ tồn kho DB). |
| GET | `/api/orders/:id` | Staff, Owner| Xem chi tiết một đơn hàng cụ thể. |

## 5. Dashboard API (Thống kê)
| Method | Endpoint | Role | Mô tả chức năng |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Owner | Lấy tổng quan (Doanh thu, số đơn, top bán chạy). |
| GET | `/api/dashboard/chart` | Owner | Lấy dữ liệu mảng vẽ biểu đồ doanh thu 7 ngày qua. |

## 6. Chat AI API (Tích hợp Trợ lý AI)
| Method | Endpoint | Role | Mô tả chức năng |
|---|---|---|---|
| POST | `/api/chat/message` | All | Gửi tin nhắn cho AI, Backend sẽ nạp context gọi Ollama. |
| GET | `/api/chat/history/:id`| All | Lấy lịch sử chat của một `session_id`. |
| GET | `/api/chat/insight` | Owner | Gọi AI phân tích chiến lược từ số liệu Dashboard hiện tại. |
