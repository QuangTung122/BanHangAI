import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { AsyncLocalStorage } from 'node:async_hooks';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../database/ecom_ai.db');
const db = new sqlite3.Database(dbPath);
const transactionContext = new AsyncLocalStorage();

let operationQueue = Promise.resolve();

const rawQuery = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows));
});

const rawGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (error, row) => error ? reject(error) : resolve(row));
});

const rawRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (error) {
    if (error) reject(error);
    else resolve(this);
  });
});

const rawExec = (sql) => new Promise((resolve, reject) => {
  db.exec(sql, (error) => error ? reject(error) : resolve());
});

const BUSINESS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS customers (
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

CREATE TABLE IF NOT EXISTS inventory_movements (
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

CREATE TABLE IF NOT EXISTS suppliers (
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

CREATE TABLE IF NOT EXISTS purchase_receipts (
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

CREATE TABLE IF NOT EXISTS purchase_receipt_items (
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

CREATE TABLE IF NOT EXISTS customer_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bot_phone_verifications (
  phone TEXT PRIMARY KEY,
  otp_hash TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bot_otp_send_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bot_otp_send_phone_date ON bot_otp_send_log(phone, created_at);
CREATE INDEX IF NOT EXISTS idx_bot_otp_send_ip_date ON bot_otp_send_log(ip_hash, created_at);

CREATE TABLE IF NOT EXISTS bot_support_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  access_key_hash TEXT NOT NULL,
  customer_account_id INTEGER,
  customer_name TEXT NOT NULL DEFAULT 'Khách vãng lai',
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','closed')),
  decision TEXT NOT NULL DEFAULT 'pending' CHECK(decision IN ('pending','accepted','declined')),
  assigned_staff_id INTEGER,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(customer_account_id) REFERENCES customer_accounts(id) ON DELETE SET NULL,
  FOREIGN KEY(assigned_staff_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS bot_support_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL,
  sender_type TEXT NOT NULL CHECK(sender_type IN ('customer','staff','system')),
  sender_id INTEGER,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(request_id) REFERENCES bot_support_requests(id) ON DELETE CASCADE,
  FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_bot_support_requests_status_date ON bot_support_requests(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_bot_support_messages_request_id ON bot_support_messages(request_id, id);

CREATE TABLE IF NOT EXISTS bot_support_staff_reads (
  request_id INTEGER NOT NULL,
  staff_id INTEGER NOT NULL,
  last_read_message_id INTEGER NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(request_id, staff_id),
  FOREIGN KEY(request_id) REFERENCES bot_support_requests(id) ON DELETE CASCADE,
  FOREIGN KEY(staff_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bot_customer_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_account_id INTEGER NOT NULL,
  order_id INTEGER,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME,
  FOREIGN KEY(customer_account_id) REFERENCES customer_accounts(id) ON DELETE CASCADE,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_bot_customer_notifications_unread
  ON bot_customer_notifications(customer_account_id, read_at, id);

CREATE TABLE IF NOT EXISTS bot_customer_needs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_account_id INTEGER,
  category TEXT NOT NULL,
  use_case TEXT,
  budget_min INTEGER,
  budget_max INTEGER,
  preferred_brand TEXT,
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(customer_account_id) REFERENCES customer_accounts(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_bot_customer_needs_category_date ON bot_customer_needs(category, created_at);

CREATE TABLE IF NOT EXISTS bot_customer_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL UNIQUE,
  customer_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_bot_customer_reviews_date ON bot_customer_reviews(created_at);

CREATE TABLE IF NOT EXISTS bot_knowledge (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  embedding TEXT,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(full_name);
CREATE INDEX IF NOT EXISTS idx_inventory_product_created ON inventory_movements(product_id, created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_reference ON inventory_movements(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_suppliers_phone ON suppliers(phone) WHERE phone IS NOT NULL AND TRIM(phone) <> '';
CREATE INDEX IF NOT EXISTS idx_purchase_receipts_created ON purchase_receipts(created_at);
CREATE INDEX IF NOT EXISTS idx_purchase_receipts_supplier ON purchase_receipts(supplier_id, created_at);
CREATE INDEX IF NOT EXISTS idx_purchase_receipt_items_receipt ON purchase_receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_purchase_receipt_items_product ON purchase_receipt_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_type_created ON transactions(type, created_at);
CREATE INDEX IF NOT EXISTS idx_installment_payments_order_created ON installment_payments(order_id, created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
`;

const initializeDatabase = async () => {
  await rawRun('PRAGMA foreign_keys = ON');
  const usersTable = await rawGet("SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name='users'");
  if (!usersTable?.count) {
    const initSqlPath = path.resolve(__dirname, '../../database/init.sql');
    if (!fs.existsSync(initSqlPath)) {
      throw new Error('Không tìm thấy backend/database/init.sql để khởi tạo CSDL.');
    }
    await rawExec(fs.readFileSync(initSqlPath, 'utf8'));
    console.log('Khởi tạo Database thành công.');
  }

  await rawExec(BUSINESS_SCHEMA_SQL);
  const supportMessageColumns = await rawQuery('PRAGMA table_info(bot_support_messages)');
  if (!supportMessageColumns.some((column) => column.name === 'image_url')) {
    await rawRun('ALTER TABLE bot_support_messages ADD COLUMN image_url TEXT');
  }
  const chatMessageColumns = await rawQuery('PRAGMA table_info(messages)');
  if (!chatMessageColumns.some((column) => column.name === 'image_url')) {
    await rawRun('ALTER TABLE messages ADD COLUMN image_url TEXT');
  }
  // Ngừng kinh doanh đồng hồ: giữ product_id để bảo toàn hóa đơn/lịch sử kho,
  // nhưng ẩn sản phẩm khỏi danh mục và loại bỏ ảnh đang dùng trong catalog.
  await rawRun(`UPDATE products SET is_active = 0, image_url = NULL
    WHERE category_id IN (SELECT id FROM categories WHERE slug = 'dong-ho')
       OR lower(name) LIKE '%watch%' OR lower(name) LIKE '%đồng hồ%'`);
  await rawRun("UPDATE categories SET is_active = 0 WHERE slug = 'dong-ho'");
  const refreshedProductImages = [
    ['TN-APP-PRO2', 'https://cdn.tgdd.vn/Products/Images/54/315014/tai-nghe-bluetooth-airpods-pro-2nd-gen-usb-c-charge-apple-1.jpg'],
    ['TN-SN-XM5-BLK', 'https://cdn.tgdd.vn/Products/Images/54/313692/tai-nghe-bluetooth-chup-tai-sony-wh1000xm5-den-1.jpg'],
    ['TN-SS-B2P-PUP', 'https://cdn.tgdd.vn/Products/Images/54/286046/tai-nghe-bluetooth-true-wireless-galaxy-buds2-pro-1.jpg'],
    ['TN-MS-MT2-BLK', 'https://cdn.tgdd.vn/Products/Images/54/325340/tai-nghe-bluetooth-tws-marshall-motif-ii-a-n-c-den-2.jpg'],
    ['TN-APP-AP3-WHT', 'https://cdn.tgdd.vn/Products/Images/54/250701/airpods-3-hop-sac-khong-day-0.jpg'],
    ['TN-SN-ZX310-BLK', 'https://cdn.tgdd.vn/Products/Images/54/75529/tai-nghe-chup-tai-sony-md-zx310ap-trang-org.png'],
    ['TN-SP-AIR3D-BLK', 'https://cdn.tgdd.vn/Products/Images/54/310399/tai-nghe-bluetooth-soundpeats-air-3-deluxe-hs-5.jpg'],
    ['TN-JBL-720BT-BLU', 'https://www.jbl.com.ph/dw/image/v2/AAUJ_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dwf68be48c/01.JBL_Tune_720BT_ProductImage_Hero_Blue.png?sfrm=png&sw=537'],
    ['TN-SNN-MT3-WHT', 'https://maccenter.vn/Headphone/Sennheiser-Momentum-TW3-White.jpg'],
    ['TN-LG-FP8-WHT', 'https://img.gigadigital.vn/image/1689672057318-tai-nghe-lg-tone-free-fp8-tone-fp8w-2.jpg'],
    ['DT-APP-15PM-256-TITAN', 'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-tu-nhien-1-1.jpg'],
    ['DT-SS-S24U-512-GRY', 'https://cdn.tgdd.vn/Products/Images/42/319667/samsung-galaxy-s24-ultra-xam-1.jpg'],
    ['DT-MI-14-256-GRN', 'https://cdn.tgdd.vn/Products/Images/42/298538/xiaomi-14-xanh-1.jpg'],
    ['DT-OP-RN11-BLU', 'https://cdn.tgdd.vn/Products/Images/42/314209/oppo-reno-11-xam-1-1.jpg'],
    ['DT-APP-13-128-PNK', 'https://cdn.tgdd.vn/Products/Images/42/223602/Slider/vi-vn-iphone-13-thumbvideo-2.jpg'],
    ['DT-VV-V30-GRN', 'https://cdn.tgdd.vn/Products/Images/42/319214/vivo-v30-black-1-1.jpg'],
    ['DT-MI-PXO6-YEL', 'https://cdn.tgdd.vn/Products/Images/42/318655/poco-x6-pro-5g-091123-023957-600x600.jpg'],
    ['DT-RM-11PP-BEI', 'https://cdn.tgdd.vn/Products/Images/42/309821/realme-11-pro-plus-1.jpg'],
    ['DT-NK-G22-GRY', 'https://cdn.tgdd.vn/Products/Images/42/303937/nokia-g22-xanh-1-1.jpg'],
    ['PK-UG-65W-BLK', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/9499/338030/adapter-sac-3-cong-usb-type-c-pd-qc-3-0-gan-65w-ugreen-cd244-10335-thumb-638827702745834325-600x600.jpg'],
    ['PK-APP-C2L-WHT', 'https://cdn.tgdd.vn/Products/Images/58/259283/cap-type-c-lightning-1m-apple-mm0a3-trang-1-1.jpg'],
    ['PK-AK-313-BLK', 'https://cdn.shopify.com/s/files/1/0491/8460/4324/products/71QDP-3-hYL_3840x.jpg?v=1695267316'],
    ['PK-SP-LC15P-CLR', 'https://spigen.ph/sites/default/files/images/products/detailip67p2023liquidcrystalcc09_0.jpg'],
    ['PK-BK-3IN1-WHT', 'https://s3.belkin.com/support/assets/506/sf317735_002_es_v1a.png'],
    ['PK-JC-CLP11-CLR', 'https://cdn2.fptshop.com.vn/unsafe/2022_6_16_637909749745553849_MDMH-CUONGLUC-IPAD-PRO-11-JPCAL-AVT.jpg'],
    ['PK-SD-128-EXT', 'https://cdn03.ciceksepeti.com/cicek/kcm45020091-1/L/sandisk-extreme-pro-128gb-20090mbs-microsdxc-uhs-i-a2-v30-adaptorlu-hafiza-karti-sdsqxcd-128g-gn6ma-kcm45020091-1-cbc2dd564aff466e847cfe0766d676c6.jpg'],
    ['PK-SN-XB13-BLU', 'https://store.sony.com.au/dw/image/v2/ABBC_PRD/on/demandware.static/-/Sites-sony-master-catalog/default/dwf3c36f7b/images/SRSXB13L/SRSXB13L.png?sh=442&sm=fit&sw=442'],
    ['PK-BS-GDK-BLK', 'https://images.morele.net/i1064/10112631_0_i1064.jpg'],
    ['PK-TG-BP15-GRY', 'https://cdn.shopify.com/s/files/1/0119/9259/6542/products/0049363_targus-12-156-citylite-pro-security-laptop-backpack_b087098b-c86a-4e4e-8ca6-8165b40e724c_1024x1024.jpg?v=1571734414']
  ];
  for (const [sku, imageUrl] of refreshedProductImages) {
    await rawRun('UPDATE products SET image_url = ? WHERE sku = ? AND is_active = 1', [imageUrl, sku]);
  }

  const supportRequestColumns = await rawQuery('PRAGMA table_info(bot_support_requests)');
  if (!supportRequestColumns.some((column) => column.name === 'decision')) {
    await rawRun("ALTER TABLE bot_support_requests ADD COLUMN decision TEXT NOT NULL DEFAULT 'pending'");
  }

  const orderColumns = await rawQuery('PRAGMA table_info(orders)');
  if (!orderColumns.some((column) => column.name === 'customer_id')) {
    await rawRun('ALTER TABLE orders ADD COLUMN customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL');
  }
  if (!orderColumns.some((column) => column.name === 'financed_total')) {
    await rawRun('ALTER TABLE orders ADD COLUMN financed_total INTEGER');
  }
  if (!orderColumns.some((column) => column.name === 'bot_reservation_expires_at')) {
    await rawRun('ALTER TABLE orders ADD COLUMN bot_reservation_expires_at DATETIME');
  }
  const addColumnsIfMissing = async (tableName, definitions) => {
    const existing = new Set((await rawQuery(`PRAGMA table_info(${tableName})`)).map((column) => column.name));
    for (const [columnName, columnType] of definitions) {
      if (existing.has(columnName)) continue;
      await rawRun(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
      existing.add(columnName);
    }
  };
  await addColumnsIfMissing('orders', [
    ['shipping_method', "TEXT NOT NULL DEFAULT 'standard'"],
    ['shipping_fee', 'INTEGER NOT NULL DEFAULT 0'],
    ['shipping_carrier', 'TEXT'],
    ['tracking_code', 'TEXT'],
    ['estimated_delivery_at', 'DATETIME'],
    ['payment_proof_image', 'TEXT'],
    ['ai_receipt_check_json', 'TEXT']
  ]);
  await rawRun(`UPDATE orders SET bot_reservation_expires_at = datetime(created_at, '+30 minutes')
    WHERE bot_reservation_expires_at IS NULL AND status = 'pending' AND user_id IS NULL AND customer_id IS NOT NULL`);
  const financeOrderColumns = [
    ['finance_partner', 'TEXT'],
    ['finance_application_code', 'TEXT'],
    ['financing_status', 'TEXT'],
    ['down_payment', 'INTEGER NOT NULL DEFAULT 0'],
    ['financed_amount', 'INTEGER']
  ];
  for (const [columnName, columnType] of financeOrderColumns) {
    if (!orderColumns.some((column) => column.name === columnName)) {
      await rawRun(`ALTER TABLE orders ADD COLUMN ${columnName} ${columnType}`);
    }
  }
  const warrantyColumns = await rawQuery('PRAGMA table_info(warranty_claims)');
  if (!warrantyColumns.some((column) => column.name === 'service_provider')) {
    await rawRun("ALTER TABLE warranty_claims ADD COLUMN service_provider TEXT DEFAULT 'Hãng/TTBH ủy quyền (mô phỏng)'");
  }
  if (!warrantyColumns.some((column) => column.name === 'service_reference')) {
    await rawRun('ALTER TABLE warranty_claims ADD COLUMN service_reference TEXT');
  }
  for (const tableName of ['returns', 'warranty_claims']) {
    await addColumnsIfMissing(tableName, [
      ['store_customer_id', 'INTEGER REFERENCES customers(id) ON DELETE SET NULL'],
      ['return_delivery_method', "TEXT NOT NULL DEFAULT 'store_dropoff'"],
      ['customer_tracking_code', 'TEXT'],
      ['evidence_images_json', 'TEXT'],
      ['ai_vision_assessment', 'TEXT'],
      ['return_shipping_tracking', 'TEXT']
    ]);
  }
  const orderItemColumns = await rawQuery('PRAGMA table_info(order_items)');
  if (!orderItemColumns.some((column) => column.name === 'product_name')) {
    await rawRun('ALTER TABLE order_items ADD COLUMN product_name TEXT');
  }
  if (!orderItemColumns.some((column) => column.name === 'sku')) {
    await rawRun('ALTER TABLE order_items ADD COLUMN sku TEXT');
  }
  if (!orderItemColumns.some((column) => column.name === 'warranty_months')) {
    await rawRun('ALTER TABLE order_items ADD COLUMN warranty_months INTEGER NOT NULL DEFAULT 0');
  }

  await rawExec('CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)');
  await rawExec('CREATE INDEX IF NOT EXISTS idx_orders_financing_status ON orders(payment_type, financing_status, created_at)');
  await rawExec('CREATE INDEX IF NOT EXISTS idx_returns_store_customer ON returns(store_customer_id)');
  await rawExec('CREATE INDEX IF NOT EXISTS idx_warranty_store_customer ON warranty_claims(store_customer_id)');

  // Bổ sung dữ liệu lịch sử từ thông tin khách đã lưu trên hóa đơn cũ.
  await rawRun(`
    INSERT OR IGNORE INTO customers (full_name, phone)
    SELECT COALESCE(MAX(NULLIF(TRIM(customer_name), '')), 'Khách hàng'), customer_phone
    FROM orders
    WHERE customer_phone IS NOT NULL AND TRIM(customer_phone) <> ''
    GROUP BY customer_phone
  `);
  await rawRun(`
    UPDATE orders
    SET customer_id = (
      SELECT c.id FROM customers c WHERE c.phone = orders.customer_phone LIMIT 1
    )
    WHERE customer_id IS NULL AND customer_phone IS NOT NULL AND TRIM(customer_phone) <> ''
  `);
  await rawRun(`
    UPDATE returns SET store_customer_id = (
      SELECT c.id FROM customers c WHERE c.phone = returns.customer_phone LIMIT 1
    ) WHERE store_customer_id IS NULL AND customer_phone IS NOT NULL AND TRIM(customer_phone) <> ''
  `);
  await rawRun(`
    UPDATE warranty_claims SET store_customer_id = (
      SELECT c.id FROM customers c WHERE c.phone = warranty_claims.customer_phone LIMIT 1
    ) WHERE store_customer_id IS NULL AND customer_phone IS NOT NULL AND TRIM(customer_phone) <> ''
  `);
  await rawRun(`
    UPDATE order_items
    SET product_name = COALESCE(product_name, (SELECT p.name FROM products p WHERE p.id = order_items.product_id)),
        sku = COALESCE(sku, (SELECT p.sku FROM products p WHERE p.id = order_items.product_id)),
        warranty_months = CASE
          WHEN warranty_months = 0 THEN COALESCE((SELECT p.warranty_months FROM products p WHERE p.id = order_items.product_id), 0)
          ELSE warranty_months
        END
    WHERE product_name IS NULL OR sku IS NULL OR warranty_months = 0
  `);
  await rawRun(`
    UPDATE orders
    SET financed_total = monthly_fee * installment_term
    WHERE payment_type = 'installment' AND financed_total IS NULL
      AND monthly_fee IS NOT NULL AND installment_term IS NOT NULL
  `);

  // Ghi tồn kho hiện tại làm mốc ban đầu; các thay đổi phát sinh sau đó được ghi theo từng giao dịch.
  await rawRun(`
    INSERT INTO inventory_movements (product_id, movement_type, quantity_change, reference_type, reference_id, note)
    SELECT p.id, 'opening', p.stock_quantity, 'migration', 1, 'Số tồn tại thời điểm nâng cấp hệ thống'
    FROM products p
    WHERE p.stock_quantity <> 0
      AND NOT EXISTS (
        SELECT 1 FROM inventory_movements im
        WHERE im.product_id = p.id AND im.movement_type = 'opening' AND im.reference_type = 'migration'
      )
  `);
};

let databaseInitializationError = null;

const databaseReady = new Promise((resolve) => {
  db.serialize(() => {
    db.get('SELECT 1', (connectionError) => {
      if (connectionError) {
        console.error('Error connecting to SQLite:', connectionError.message);
        databaseInitializationError = connectionError;
        resolve();
        return;
      }
      initializeDatabase()
        .catch((error) => {
          databaseInitializationError = error;
          console.error('Lỗi khởi tạo/cập nhật Database:', error.message);
        })
        .finally(resolve);
    });
  });
});

const enqueue = (operation) => {
  if (transactionContext.getStore()) return operation();

  const result = operationQueue.then(async () => {
    await databaseReady;
    if (databaseInitializationError) throw databaseInitializationError;
    return operation();
  });
  operationQueue = result.catch(() => {});
  return result;
};

export const query = (sql, params = []) => enqueue(() => rawQuery(sql, params));
export const get = (sql, params = []) => enqueue(() => rawGet(sql, params));
export const run = (sql, params = []) => enqueue(() => rawRun(sql, params));

/**
 * Runs related database operations atomically. A single SQLite connection is used,
 * so ordinary queries are queued behind the transaction until it commits or rolls back.
 */
export const transaction = (callback) => {
  if (transactionContext.getStore()) return Promise.resolve().then(callback);

  const result = operationQueue.then(async () => {
    await databaseReady;
    if (databaseInitializationError) throw databaseInitializationError;
    await rawRun('BEGIN IMMEDIATE');
    try {
      const value = await transactionContext.run(true, callback);
      await rawRun('COMMIT');
      return value;
    } catch (error) {
      try {
        await rawRun('ROLLBACK');
      } catch (rollbackError) {
        console.error('Không thể hoàn tác giao dịch SQLite:', rollbackError.message);
      }
      throw error;
    }
  });

  operationQueue = result.catch(() => {});
  return result;
};

export const initialize = async () => {
  await databaseReady;
  if (databaseInitializationError) throw databaseInitializationError;
};
export default db;
