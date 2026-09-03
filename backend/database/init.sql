-- DDL for SQLite

-- 1. Tables Creation
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT DEFAULT 'customer' CHECK(role IN ('admin', 'owner', 'staff', 'customer')),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_configs (
    key TEXT PRIMARY KEY,
    value TEXT
);


CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT 1
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price INTEGER NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total_amount INTEGER NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    shipping_address TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE chat_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    session_id TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    sender TEXT NOT NULL CHECK(sender IN ('user', 'assistant')),
    message_content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- 2. Indexes Creation
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- 3. Seed Data
-- Users (Mật khẩu mẫu đã được băm)
INSERT INTO users (username, password_hash, full_name, email, phone, role) VALUES 
('admin', '$2b$12$e/K9...hashed', 'Quản trị viên', 'admin@store.com', '0123456789', 'admin'),
('customer1', '$2b$12$e/K9...hashed', 'Khách hàng 1', 'cust1@gmail.com', '0987654321', 'customer');

-- Categories
INSERT INTO categories (name, slug, description, is_active) VALUES 
('Tai nghe', 'tai-nghe', 'Tai nghe nhạc chất lượng cao', 1),
('Điện thoại', 'dien-thoai', 'Điện thoại thông minh', 1),
('Phụ kiện', 'phu-kien', 'Sạc, cáp, ốp lưng', 1),
('Đồng hồ thông minh', 'dong-ho', 'Smartwatch đo sức khỏe', 1);

-- Products (15 sample items)
INSERT INTO products (category_id, name, slug, description, price, stock_quantity, is_active) VALUES 
(1, 'Tai nghe Sony WH-1000XM4', 'tai-nghe-sony-xm4', 'Tai nghe chống ồn đỉnh cao, pin 30h.', 6500000, 10, 1),
(1, 'Apple AirPods Pro 2', 'airpods-pro-2', 'Chống ồn chủ động xuất sắc, pin cải thiện.', 5500000, 20, 1),
(1, 'Tai nghe JBL T110', 'jbl-t110', 'Tai nghe in-ear giá rẻ, âm bass mạnh.', 250000, 50, 1),
(1, 'Tai nghe Marshall Major IV', 'marshall-major-4', 'Tai nghe on-ear, pin 80h.', 3500000, 15, 1),
(2, 'iPhone 15 Pro Max', 'iphone-15-pro-max', 'Chip A17 Pro, khung viền titan.', 30000000, 15, 1),
(2, 'Samsung Galaxy S24 Ultra', 'galaxy-s24-ultra', 'Màn hình 6.8 inch, AI tích hợp.', 28000000, 12, 1),
(2, 'Xiaomi 14 Pro', 'xiaomi-14-pro', 'Sạc siêu nhanh, camera Leica.', 22000000, 8, 1),
(2, 'Oppo Find X7', 'oppo-find-x7', 'Thiết kế đẹp, camera chuyên nghiệp.', 20000000, 5, 1),
(3, 'Cáp sạc Anker Type-C', 'cap-anker-type-c', 'Bền bỉ, sạc nhanh.', 350000, 100, 1),
(3, 'Sạc dự phòng Xiaomi 10000mAh', 'sac-du-phong-xiaomi-10000', 'Gọn nhẹ, tiện lợi.', 450000, 30, 1),
(3, 'Ốp lưng Spigen iPhone 15', 'op-spigen-ip15', 'Chống sốc tiêu chuẩn quân đội.', 400000, 45, 1),
(3, 'Củ sạc Ugreen 65W GaN', 'cu-sac-ugreen-65w', 'Sạc nhanh đa thiết bị.', 650000, 25, 1),
(4, 'Apple Watch Series 9', 'apple-watch-s9', 'Đo nhịp tim, màn hình sáng.', 9500000, 18, 1),
(4, 'Samsung Galaxy Watch 6', 'galaxy-watch-6', 'Theo dõi giấc ngủ tốt hơn.', 6500000, 14, 1),
(4, 'Garmin Forerunner 265', 'garmin-265', 'Chuyên dụng chạy bộ.', 11000000, 6, 1);

-- System Configs
INSERT INTO system_configs (key, value) VALUES
('ollama_host', 'http://localhost:11434'),
('ai_model', 'qwen2.5-coder:1.5b'),
('ai_max_tokens', '4096'),
('ai_system_prompt', 'B?n l� tr? l� AI chuy�n nghi?p c?a c?a h�ng b�n l?...'),
('ai_temperature', '0.7'),
('bgm_url', 'https://files.catbox.moe/pmroy.mp3');
