const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('ecom_ai.db');

const products = [
  // 1: Tai nghe
  { category_id: 1, name: 'Tai nghe Bluetooth Sony WH-1000XM5', price: 7990000, import_price: 6500000, stock: 15, tags: 'chống ồn, over-ear, bluetooth' },
  { category_id: 1, name: 'Tai nghe Apple AirPods Pro 2', price: 5990000, import_price: 5000000, stock: 30, tags: 'in-ear, chống ồn, apple' },
  { category_id: 1, name: 'Tai nghe không dây JBL Tune 230NC', price: 2190000, import_price: 1500000, stock: 50, tags: 'true-wireless, bass, in-ear' },
  { category_id: 1, name: 'Tai nghe Sennheiser Momentum 4', price: 8590000, import_price: 7000000, stock: 10, tags: 'chụp tai, hi-res, pin trâu' },
  { category_id: 1, name: 'Tai nghe Marshall Motif II ANC', price: 4990000, import_price: 4000000, stock: 20, tags: 'chống ồn, cổ điển, marshall' },
  
  // 2: Điện thoại
  { category_id: 2, name: 'iPhone 15 Pro 256GB', price: 28990000, import_price: 25000000, stock: 25, tags: 'apple, ios, titan' },
  { category_id: 2, name: 'Samsung Galaxy S24 Ultra 512GB', price: 33990000, import_price: 29000000, stock: 20, tags: 'samsung, android, ai, bút spen' },
  { category_id: 2, name: 'Xiaomi 14 5G', price: 22990000, import_price: 19000000, stock: 15, tags: 'xiaomi, leica, sạc nhanh' },
  { category_id: 2, name: 'OPPO Find N3 Flip', price: 25990000, import_price: 21000000, stock: 12, tags: 'oppo, gập, thời trang' },
  { category_id: 2, name: 'Google Pixel 8 Pro', price: 24500000, import_price: 20000000, stock: 8, tags: 'google, android thuần, camera' },

  // 3: Phụ kiện
  { category_id: 3, name: 'Củ sạc nhanh Anker Nano II 65W', price: 750000, import_price: 450000, stock: 100, tags: 'sạc nhanh, anker, gan' },
  { category_id: 3, name: 'Pin dự phòng Samsung 20000mAh 25W', price: 950000, import_price: 600000, stock: 60, tags: 'pin dự phòng, samsung, type-c' },
  { category_id: 3, name: 'Ốp lưng Spigen Liquid Crystal iPhone 15', price: 350000, import_price: 200000, stock: 150, tags: 'ốp lưng, trong suốt, spigen' },
  { category_id: 3, name: 'Cáp sạc Ugreen Type-C to Lightning 20W', price: 250000, import_price: 150000, stock: 200, tags: 'cáp sạc, apple, ugreen, mfi' },
  { category_id: 3, name: 'Giá đỡ điện thoại Baseus để bàn', price: 150000, import_price: 80000, stock: 80, tags: 'giá đỡ, nhôm, tiện dụng' },

  // 4: Đồng hồ thông minh
  { category_id: 4, name: 'Apple Watch Series 9 41mm', price: 9590000, import_price: 8000000, stock: 18, tags: 'apple watch, smartwatch, sức khỏe' },
  { category_id: 4, name: 'Samsung Galaxy Watch 6 Classic', price: 8290000, import_price: 6500000, stock: 22, tags: 'samsung watch, classic, android' },
  { category_id: 4, name: 'Garmin Forerunner 965', price: 15590000, import_price: 13000000, stock: 5, tags: 'garmin, thể thao, gps, pin khủng' },
  { category_id: 4, name: 'Huawei Watch GT 4', price: 5490000, import_price: 4200000, stock: 35, tags: 'huawei, thời trang, thể thao' },
  { category_id: 4, name: 'Amazfit T-Rex Ultra', price: 9990000, import_price: 7500000, stock: 10, tags: 'amazfit, bền bỉ, quân đội' }
];

db.serialize(() => {
  products.forEach(p => {
    let baseSlug = p.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    let slug = baseSlug + '-' + Math.floor(Math.random() * 10000);
    const sku = 'SKU-' + Math.floor(Math.random() * 900000 + 100000);
    
    db.run(`INSERT INTO products 
      (sku, name, slug, category_id, unit, import_price, price, discount_percent, image_url, stock_quantity, low_stock_threshold, description, is_active, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sku, p.name, slug, p.category_id, 'Cái', p.import_price, p.price, 0, '', p.stock, 5, p.name + ' chính hãng chất lượng cao', 1, p.tags],
      (err) => {
        if (err) console.error(err);
        else console.log('Inserted ' + p.name);
      }
    );
  });
});
