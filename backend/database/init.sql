-- DDL for SQLite

-- 1. Tables Creation
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT DEFAULT 'staff' CHECK(role IN ('admin', 'owner', 'staff')),
    is_active BOOLEAN DEFAULT 1,
    hourly_wage REAL DEFAULT 25000,
    current_token TEXT,
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
    sku TEXT, 
    unit TEXT, 
    import_price INTEGER, 
    discount_percent INTEGER DEFAULT 0, 
    low_stock_threshold INTEGER DEFAULT 5, 
    tags TEXT,
    warranty_months INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE,
    email TEXT,
    address TEXT,
    customer_group TEXT NOT NULL DEFAULT 'regular',
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    movement_type TEXT NOT NULL CHECK(movement_type IN ('opening','purchase','sale','return','adjustment','write_off')),
    quantity_change INTEGER NOT NULL CHECK(quantity_change <> 0),
    unit_cost INTEGER,
    reference_type TEXT,
    reference_id INTEGER,
    note TEXT,
    user_id INTEGER,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER,
    supplier_name TEXT NOT NULL,
    supplier_invoice TEXT,
    total_cost INTEGER NOT NULL CHECK(total_cost >= 0),
    notes TEXT,
    received_by INTEGER,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    FOREIGN KEY(received_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE purchase_receipt_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    sku TEXT,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_cost INTEGER NOT NULL CHECK(unit_cost >= 0),
    line_total INTEGER NOT NULL CHECK(line_total >= 0),
    FOREIGN KEY(receipt_id) REFERENCES purchase_receipts(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    customer_id INTEGER,
    total_amount INTEGER NOT NULL,
    financed_total INTEGER,
    customer_name TEXT,
    customer_phone TEXT,
    shipping_address TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_type TEXT DEFAULT 'full',
    customer_cccd TEXT,
    installment_term INTEGER,
    monthly_fee INTEGER,
    finance_partner TEXT,
    finance_application_code TEXT,
    financing_status TEXT CHECK(financing_status IN ('pending','approved','rejected','cancelled')),
    down_payment INTEGER NOT NULL DEFAULT 0,
    financed_amount INTEGER,
    payment_method TEXT DEFAULT 'cash',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT,
    sku TEXT,
    warranty_months INTEGER NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    customer_id INTEGER,
    store_customer_id INTEGER,
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
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(customer_id) REFERENCES users(id),
    FOREIGN KEY(store_customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY(approved_by) REFERENCES users(id),
    FOREIGN KEY(exchange_product_id) REFERENCES products(id),
    FOREIGN KEY(created_by) REFERENCES users(id)
);

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
    FOREIGN KEY(return_id) REFERENCES returns(id),
    FOREIGN KEY(order_item_id) REFERENCES order_items(id),
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(exchange_to_product_id) REFERENCES products(id)
);

CREATE TABLE warranty_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    order_item_id INTEGER,
    product_id INTEGER NOT NULL,
    customer_id INTEGER,
    store_customer_id INTEGER,
    customer_name TEXT,
    customer_phone TEXT,
    serial_number TEXT,
    warranty_start_date DATETIME,
    warranty_end_date DATETIME,
    warranty_months INTEGER NOT NULL,
    claim_type TEXT NOT NULL CHECK(claim_type IN ('repair','replace','refund','inspection')),
    issue_description TEXT,
    issue_code TEXT,
    service_provider TEXT DEFAULT 'Hãng/TTBH ủy quyền (mô phỏng)',
    service_reference TEXT,
    claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_review','approved','repairing','repaired','rejected','completed','cancelled')),
    approved_by INTEGER,
    created_by INTEGER NOT NULL,
    notes TEXT,
    resolution_notes TEXT,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(order_item_id) REFERENCES order_items(id),
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(customer_id) REFERENCES users(id),
    FOREIGN KEY(store_customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY(approved_by) REFERENCES users(id),
    FOREIGN KEY(created_by) REFERENCES users(id)
);

CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action_type TEXT NOT NULL,
    action_desc TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE installment_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    cashier_id INTEGER,
    payment_method TEXT DEFAULT 'cash',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(cashier_id) REFERENCES users(id)
);

CREATE TABLE attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    check_in_time TEXT NOT NULL,
    check_out_time TEXT,
    total_hours REAL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    reference_id INTEGER,
    user_id INTEGER NOT NULL,
    payment_method TEXT DEFAULT 'cash',
    source TEXT DEFAULT 'manual',
    invoice_id TEXT,
    attachment_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
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
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_customers_name ON customers(full_name);
CREATE INDEX idx_inventory_product_created ON inventory_movements(product_id, created_at);
CREATE INDEX idx_inventory_reference ON inventory_movements(reference_type, reference_id);
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE UNIQUE INDEX idx_suppliers_phone ON suppliers(phone) WHERE phone IS NOT NULL AND TRIM(phone) <> '';
CREATE INDEX idx_purchase_receipts_created ON purchase_receipts(created_at);
CREATE INDEX idx_purchase_receipts_supplier ON purchase_receipts(supplier_id, created_at);
CREATE INDEX idx_purchase_receipt_items_receipt ON purchase_receipt_items(receipt_id);
CREATE INDEX idx_purchase_receipt_items_product ON purchase_receipt_items(product_id);
CREATE INDEX idx_returns_store_customer ON returns(store_customer_id);
CREATE INDEX idx_warranty_store_customer ON warranty_claims(store_customer_id);
CREATE INDEX idx_transactions_type_created ON transactions(type, created_at);
CREATE INDEX idx_installment_payments_order_created ON installment_payments(order_id, created_at);

CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50),
    related_id INTEGER,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- 3. Seed Data
-- Users (Mật khẩu mẫu đã được băm)
INSERT INTO users (username, password_hash, full_name, email, phone, role) VALUES 
('admin', '$2b$12$e/K9...hashed', 'Quản trị viên', 'admin@store.com', '0123456789', 'admin');

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
('ai_model', 'qwen2.5:1.5b'),
('ai_max_tokens', '4096'),
('ai_system_prompt', ''),
('ai_temperature', '0.7'),
('bgm_url', 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3');
