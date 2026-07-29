import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const seed = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'Delora_db'
    });

    console.log('Connected to DB, seeding data...');

    const adminHash = await bcrypt.hash('Admin@123456', await bcrypt.genSalt(10));
    const customerHash = await bcrypt.hash('Customer@123', await bcrypt.genSalt(10));

    // 1. Users
    await connection.execute(
        `INSERT IGNORE INTO users (name, email, password_hash, phone, gender, role, is_verified, is_active) VALUES
         ('Super Admin', 'admin@delora.market', ?, '01000000000', 'male', 'super_admin', TRUE, TRUE),
         ('Store Manager', 'manager@delora.market', ?, '01000000001', 'male', 'store_manager', TRUE, TRUE),
         ('Ahmed Customer', 'ahmed@example.com', ?, '01000000002', 'male', 'customer', TRUE, TRUE),
         ('Sara Customer', 'sara@example.com', ?, '01000000003', 'female', 'customer', TRUE, TRUE)`,
        [adminHash, adminHash, customerHash, customerHash]
    );
    console.log('  ✓ Users seeded');

    // 2. Categories
    await connection.execute(
        `INSERT IGNORE INTO categories (id, name_ar, name_en, slug, is_active) VALUES
         (1, 'مشروبات', 'Beverages', 'beverages', TRUE),
         (2, 'وجبات خفيفة', 'Snacks', 'snacks', TRUE),
         (3, 'منتجات ألبان', 'Dairy', 'dairy', TRUE),
         (4, 'منظفات', 'Cleaning', 'cleaning', TRUE),
         (5, 'خضروات وفواكه', 'Fruits & Vegetables', 'fruits-vegetables', TRUE)`
    );
    console.log('  ✓ Categories seeded');

    // 3. Products
    await connection.execute(
        `INSERT IGNORE INTO products (id, category_id, name_ar, name_en, slug, brand_ar, description_ar, unit_ar, wholesale_price, price, sku, product_image, is_active) VALUES
         (1, 1, 'عصير برتقال طبيعي', 'Fresh Orange Juice', 'orange-juice', 'Fresh', 'عصير برتقال طبيعي 100%', 'لتر', 15.00, 25.00, 'BEV-001', 'orange-juice.jpg', TRUE),
         (2, 1, 'مياه معدنية', 'Mineral Water', 'mineral-water', 'Aqua', 'مياه معدنية نقية', 'زجاجة', 3.00, 5.00, 'BEV-002', 'mineral-water.jpg', TRUE),
         (3, 2, 'شيبس بطاطس', 'Potato Chips', 'potato-chips', 'Lays', 'شيبس بطاطس مقرمش', 'كيس', 8.00, 12.00, 'SNK-001', 'potato-chips.jpg', TRUE),
         (4, 2, 'مقرمشات جبن', 'Cheese Crackers', 'cheese-crackers', 'Ritz', 'مقرمشات بنكهة الجبنة', 'علبة', 10.00, 16.00, 'SNK-002', 'cheese-crackers.jpg', TRUE),
         (5, 3, 'حليب طازج', 'Fresh Milk', 'fresh-milk', 'Juhayna', 'حليب طازج كامل الدسم', 'لتر', 18.00, 28.00, 'DRY-001', 'fresh-milk.jpg', TRUE),
         (6, 3, 'زبادي', 'Yogurt', 'yogurt', 'Danone', 'زبادي طبيعي', 'علبة', 5.00, 8.00, 'DRY-002', 'yogurt.jpg', TRUE),
         (7, 4, 'سائل تنظيف', 'Liquid Cleaner', 'liquid-cleaner', 'Mr. Clean', 'سائل تنظيف متعدد الاستخدامات', 'زجاجة', 20.00, 32.00, 'CLN-001', 'liquid-cleaner.jpg', TRUE),
         (8, 5, 'تفاح أحمر', 'Red Apples', 'red-apples', 'مزرعة', 'تفاح أحمر طازج', 'كجم', 25.00, 40.00, 'FRT-001', 'red-apples.jpg', TRUE)`
    );
    console.log('  ✓ Products seeded');

    // 4. Product Stock
    await connection.execute(
        `INSERT IGNORE INTO product_stock (product_id, available_quantity, min_stock_level) VALUES
         (1, 100, 10), (2, 500, 50), (3, 200, 20), (4, 150, 15),
         (5, 80, 10), (6, 300, 30), (7, 120, 15), (8, 60, 10)`
    );
    console.log('  ✓ Stock seeded');

    // 5. Coupon
    await connection.execute(
        `INSERT IGNORE INTO coupons (code, discount_type, discount_value, max_discount_amount, min_order_amount, usage_limit, is_active) VALUES
         ('WELCOME10', 'percentage', 10, 50.00, 100.00, 100, TRUE),
         ('SAVE50', 'fixed', 50.00, NULL, 200.00, 50, TRUE)`
    );
    console.log('  ✓ Coupons seeded');

    // 6. Store Settings
    await connection.execute(
        `INSERT IGNORE INTO store_settings (key_name, key_value_ar, key_value_en, display_name_ar, display_name_en) VALUES
         ('store_name', 'دلورة ماركت', 'Delora Market', 'اسم المتجر', 'Store Name'),
         ('store_phone', '01000000000', '01000000000', 'هاتف المتجر', 'Store Phone'),
         ('store_address', 'القاهرة', 'Cairo', 'عنوان المتجر', 'Store Address'),
         ('delivery_fee', '0', '0', 'رسوم التوصيل', 'Delivery Fee'),
         ('free_delivery_min', '200', '200', 'التوصيل المجاني عند', 'Free Delivery Min')`
    );
    console.log('  ✓ Store settings seeded');

    // 7. Banner
    await connection.execute(
        `INSERT IGNORE INTO banners (title_ar, title_en, subtitle_ar, subtitle_en, image_url, sort_order, is_active) VALUES
         ('تخفيضات الصيف', 'Summer Sale', 'خصومات تصل إلى 50%', 'Up to 50% off', 'summer-sale-banner.jpg', 1, TRUE),
         ('منتجات جديدة', 'New Arrivals', 'اكتشف أحدث المنتجات', 'Discover our newest products', 'new-arrivals-banner.jpg', 2, TRUE)`
    );
    console.log('  ✓ Banners seeded');

    // 8. Branch
    await connection.execute(
        `INSERT IGNORE INTO branches (name_ar, name_en, address_ar, address_en, phone, working_hours_ar, working_hours_en, is_active) VALUES
         ('فرع المعادي', 'Maadi Branch', 'المعادي، القاهرة', 'Maadi, Cairo', '01000000010', '9 ص - 10 م', '9 AM - 10 PM', TRUE),
         ('فرع الرحاب', 'Rehab Branch', 'الرحاب، القاهرة', 'Rehab, Cairo', '01000000011', '9 ص - 11 م', '9 AM - 11 PM', TRUE)`
    );
    console.log('  ✓ Branches seeded');

    console.log('\n✅ Seed completed successfully!');
    console.log('   Admin: admin@delora.market / Admin@123456');
    console.log('   Customer: ahmed@example.com / Customer@123');

    await connection.end();
    process.exit(0);
};

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
