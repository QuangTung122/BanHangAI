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

  const orderColumns = await rawQuery('PRAGMA table_info(orders)');
  if (!orderColumns.some((column) => column.name === 'customer_id')) {
    await rawRun('ALTER TABLE orders ADD COLUMN customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL');
  }
  if (!orderColumns.some((column) => column.name === 'financed_total')) {
    await rawRun('ALTER TABLE orders ADD COLUMN financed_total INTEGER');
  }
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
    const columns = await rawQuery(`PRAGMA table_info(${tableName})`);
    if (!columns.some((column) => column.name === 'store_customer_id')) {
      await rawRun(`ALTER TABLE ${tableName} ADD COLUMN store_customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL`);
    }
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
