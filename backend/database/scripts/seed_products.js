import * as db from '../../src/services/db.js';

const products = [
  {
    category_id: 2,
    name: 'iPhone 15 Pro Max 256GB Titanium Tự Nhiên',
    slug: 'iphone-15-pro-max-256gb',
    description: 'Khung viền Titan chuẩn hàng không vũ trụ, chip A17 Pro mạnh mẽ, camera zoom quang học 5x.',
    price: 29990000,
    import_price: 26500000,
    stock_quantity: 15,
    sku: 'DT-IP15PM-256',
    unit: 'Chiếc',
    discount_percent: 5,
    low_stock_threshold: 3,
    tags: 'Apple, Flagship, 5G, Titan',
    warranty_months: 12,
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'
  },
  {
    category_id: 2,
    name: 'Samsung Galaxy S24 Ultra 5G 12GB/256GB',
    slug: 'samsung-galaxy-s24-ultra',
    description: 'Tích hợp quyền năng Galaxy AI, camera 200MP siêu nét, bút S-Pen tiện lợi cùng khung viền Titan.',
    price: 26490000,
    import_price: 23200000,
    stock_quantity: 12,
    sku: 'DT-SS-S24U-256',
    unit: 'Chiếc',
    discount_percent: 8,
    low_stock_threshold: 4,
    tags: 'Samsung, Galaxy AI, 200MP',
    warranty_months: 12,
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'
  },
  {
    category_id: 2,
    name: 'Xiaomi 14 5G 12GB/512GB Ống Kính Leica',
    slug: 'xiaomi-14-5g-512gb',
    description: 'Ống kính quang học Leica Summilux thế hệ mới, vi xử lý Snapdragon 8 Gen 3, màn hình 1.5K 120Hz.',
    price: 19990000,
    import_price: 17500000,
    stock_quantity: 8,
    sku: 'DT-XM-14-512',
    unit: 'Chiếc',
    discount_percent: 10,
    low_stock_threshold: 3,
    tags: 'Xiaomi, Leica, Snapdragon 8 Gen 3',
    warranty_months: 18,
    image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80'
  },
  {
    category_id: 1,
    name: 'Tai nghe Apple AirPods Pro 2 Type-C (MagSafe)',
    slug: 'apple-airpods-pro-2-type-c',
    description: 'Chống ồn chủ động ANC gấp 2 lần, âm thanh thích ứng Adaptive Audio, cổng sạc Type-C tiện lợi.',
    price: 5490000,
    import_price: 4600000,
    stock_quantity: 25,
    sku: 'TN-AP-APP2-TC',
    unit: 'Hộp',
    discount_percent: 6,
    low_stock_threshold: 5,
    tags: 'Apple, AirPods, ANC, Type-C',
    warranty_months: 12,
    image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80'
  },
  {
    category_id: 1,
    name: 'Tai nghe Chụp Tai Sony WH-1000XM5 Hi-Res',
    slug: 'sony-wh-1000xm5-hi-res',
    description: 'Bộ xử lý chống ồn V1 và QN1 chuyên dụng, âm thanh Hi-Res Audio, thời lượng pin 30 giờ liên tục.',
    price: 7890000,
    import_price: 6700000,
    stock_quantity: 7,
    sku: 'TN-SN-XM5-BLK',
    unit: 'Chiếc',
    discount_percent: 5,
    low_stock_threshold: 2,
    tags: 'Sony, Headphone, Hi-Res, ANC',
    warranty_months: 12,
    image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80'
  },
  {
    category_id: 1,
    name: 'Tai nghe Marshall Major IV Bluetooth Pin 80H',
    slug: 'marshall-major-iv-bluetooth',
    description: 'Thiết kế cổ điển đậm chất Rock & Roll, thời lượng pin kinh ngạc lên đến 80 giờ, hỗ trợ sạc không dây.',
    price: 3290000,
    import_price: 2600000,
    stock_quantity: 18,
    sku: 'TN-MS-MJ4',
    unit: 'Chiếc',
    discount_percent: 0,
    low_stock_threshold: 5,
    tags: 'Marshall, Retro, Bluetooth',
    warranty_months: 12,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
  },
  {
    category_id: 4,
    name: 'Apple Watch Series 9 GPS 45mm Viền Nhôm',
    slug: 'apple-watch-series-9-gps-45mm',
    description: 'Chip S9 SiP mạnh mẽ, thao tác chạm hai lần Double Tap kỳ diệu, màn hình sáng gấp 2 lần 2000 nits.',
    price: 9890000,
    import_price: 8400000,
    stock_quantity: 10,
    sku: 'DH-AP-S9-45',
    unit: 'Chiếc',
    discount_percent: 7,
    low_stock_threshold: 3,
    tags: 'Apple Watch, S9, Đo nhịp tim',
    warranty_months: 12,
    image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80'
  },
  {
    category_id: 4,
    name: 'Đồng hồ thông minh Garmin Forerunner 265 GPS AMOLED',
    slug: 'garmin-forerunner-265-gps',
    description: 'Màn hình AMOLED cảm ứng rực rỡ, tính toán chỉ số sẵn sàng luyện tập, đo nhịp tim thế hệ 4.',
    price: 10990000,
    import_price: 9200000,
    stock_quantity: 6,
    sku: 'DH-GM-FR265',
    unit: 'Chiếc',
    discount_percent: 0,
    low_stock_threshold: 2,
    tags: 'Garmin, Chạy bộ, Thể thao, GPS',
    warranty_months: 24,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
  },
  {
    category_id: 3,
    name: 'Củ sạc nhanh Anker 735 GaNPrime 65W 3 Cổng',
    slug: 'cu-sac-nhanh-anker-ganprime-65w',
    description: 'Công nghệ GaNPrime độc quyền, sạc cùng lúc 3 thiết bị Laptop, iPad và Điện thoại cực nhỏ gọn.',
    price: 890000,
    import_price: 580000,
    stock_quantity: 40,
    sku: 'PK-AK-65W-3P',
    unit: 'Cái',
    discount_percent: 15,
    low_stock_threshold: 10,
    tags: 'Anker, Sạc nhanh, GaN, Type-C',
    warranty_months: 18,
    image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80'
  },
  {
    category_id: 3,
    name: 'Pin sạc dự phòng Baseus MagSafe 10.000mAh 20W',
    slug: 'pin-du-phong-baseus-magsafe-10000',
    description: 'Hít từ tính MagSafe lực hút mạnh, màn hình LED báo phần trăm pin chính xác, chân đế gập tiện lợi.',
    price: 650000,
    import_price: 420000,
    stock_quantity: 35,
    sku: 'PK-BS-MAG-10K',
    unit: 'Cái',
    discount_percent: 10,
    low_stock_threshold: 8,
    tags: 'Baseus, MagSafe, Sạc dự phòng',
    warranty_months: 12,
    image_url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop&q=80'
  },
  {
    category_id: 3,
    name: 'Ốp lưng Spigen Ultra Hybrid MagFit iPhone 15 Pro Max',
    slug: 'op-lung-spigen-ultra-hybrid-magsafe',
    description: 'Mặt lưng trong suốt kháng ố vàng, đệm khí Air Cushion chống sốc chuẩn quân đội Mỹ, vòng nam châm MagSafe.',
    price: 450000,
    import_price: 250000,
    stock_quantity: 50,
    sku: 'PK-SPG-MAG-15PM',
    unit: 'Cái',
    discount_percent: 0,
    low_stock_threshold: 10,
    tags: 'Spigen, Ốp lưng, Chống sốc, MagSafe',
    warranty_months: 6,
    image_url: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=600&auto=format&fit=crop&q=80'
  }
];

async function seed() {
  console.log('Bắt đầu chèn dữ liệu sản phẩm mẫu...');
  for (const p of products) {
    await db.run(
      `INSERT INTO products (
        category_id, name, slug, description, price, import_price, stock_quantity, 
        sku, unit, discount_percent, low_stock_threshold, tags, warranty_months, image_url, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(slug) DO UPDATE SET
        category_id=excluded.category_id,
        name=excluded.name,
        description=excluded.description,
        price=excluded.price,
        import_price=excluded.import_price,
        stock_quantity=excluded.stock_quantity,
        sku=excluded.sku,
        unit=excluded.unit,
        discount_percent=excluded.discount_percent,
        low_stock_threshold=excluded.low_stock_threshold,
        tags=excluded.tags,
        warranty_months=excluded.warranty_months,
        image_url=excluded.image_url,
        is_active=1`,
      [
        p.category_id, p.name, p.slug, p.description, p.price, p.import_price, p.stock_quantity,
        p.sku, p.unit, p.discount_percent, p.low_stock_threshold, p.tags, p.warranty_months, p.image_url
      ]
    );
  }

  const result = await db.query('SELECT count(*) as total FROM products');
  console.log('Đã chèn thành công! Tổng số sản phẩm trong hệ thống:', result[0].total);
  process.exit(0);
}

seed().catch(err => {
  console.error('Lỗi khi seed sản phẩm:', err);
  process.exit(1);
});
