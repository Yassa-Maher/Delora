CREATE DATABASE IF NOT EXISTS Delora_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Delora_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    second_phone VARCHAR(20) NULL,
    gender ENUM('male', 'female', 'other') NULL,
    photo_url VARCHAR(255) NULL,
    role ENUM('super_admin', 'store_manager', 'delivery_boy', 'customer') DEFAULT 'customer',
    country VARCHAR(100) DEFAULT 'Egypt',
    governorate VARCHAR(100) NULL,
    zip_code VARCHAR(20) NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(6) NULL,
    code_expires_at DATETIME NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    area VARCHAR(150) NOT NULL,
    street_details TEXT NOT NULL,
    building_number VARCHAR(20),
    floor_number VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NULL,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name_ar VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    brand_ar VARCHAR(100) NULL,
    brand_en VARCHAR(100) NULL,
    description_ar TEXT NULL,
    description_en TEXT NULL,
    unit_ar VARCHAR(50) NOT NULL,
    unit_en VARCHAR(50) NULL,
    wholesale_price DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2) NULL,
    offer_start_at DATETIME NULL,
    offer_end_at DATETIME NULL,
    offer_until_stock_out BOOLEAN DEFAULT FALSE,
    offer_max_quantity INT NULL,
    comparison_price DECIMAL(10, 2) NULL,
    sku VARCHAR(50) UNIQUE NULL,
    barcode VARCHAR(100) UNIQUE NULL,
    product_image VARCHAR(255) NULL,
    avg_rating DECIMAL(3, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE seo_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('product', 'category') NOT NULL,
    entity_id INT NOT NULL,
    meta_title_ar VARCHAR(150) NOT NULL,
    meta_title_en VARCHAR(150) NULL,
    meta_description_ar VARCHAR(255) NOT NULL,
    meta_description_en VARCHAR(255) NULL,
    meta_keywords_ar TEXT NULL,
    meta_keywords_en TEXT NULL,
    og_title_ar VARCHAR(150) NULL,
    og_title_en VARCHAR(150) NULL,
    og_description_ar VARCHAR(255) NULL,
    og_description_en VARCHAR(255) NULL,
    og_image VARCHAR(255) NULL,
    UNIQUE(entity_type, entity_id)
);

CREATE TABLE product_stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNIQUE NOT NULL,
    available_quantity INT NOT NULL DEFAULT 0,
    min_stock_level INT DEFAULT 5,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE inventory_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    batch_number VARCHAR(50) NULL,
    quantity_received INT NOT NULL,
    expiry_date DATE NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tag_name_ar VARCHAR(50) UNIQUE NOT NULL,
    tag_name_en VARCHAR(50) UNIQUE NULL
);

CREATE TABLE tagables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tag_id INT NOT NULL,
    entity_type ENUM('product', 'category') NOT NULL,
    entity_id INT NOT NULL,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(tag_id, entity_type, entity_id)
);

CREATE TABLE product_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(product_id, user_id)
);

CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type ENUM('fixed', 'percentage') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    max_discount_amount DECIMAL(10, 2) NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
    usage_limit INT NULL,
    used_count INT DEFAULT 0,
    start_date TIMESTAMP NULL,
    expiry_date TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
);

CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    coupon_id INT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    shipping_price DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('cash_on_delivery', 'wallet') DEFAULT 'cash_on_delivery',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_reference_id VARCHAR(255) NULL,
    payment_proof_image TEXT NULL,
    wallet_review_status ENUM('pending_review', 'approved', 'rejected') NULL,
    order_status ENUM('pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled', 'completed') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    delivery_boy_id INT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL,
    FOREIGN KEY (delivery_boy_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    purchase_wholesale_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE site_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title_ar VARCHAR(150) NOT NULL,
    title_en VARCHAR(150) NULL,
    message_ar TEXT NOT NULL,
    message_en TEXT NULL,
    display_duration_seconds INT NULL DEFAULT 10,
    start_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NULL,
    subtitle_ar VARCHAR(150) NULL,
    subtitle_en VARCHAR(150) NULL,
    button_text_ar VARCHAR(100) NULL DEFAULT 'اكتشف عروضنا',
    button_text_en VARCHAR(100) NULL DEFAULT 'Discover Offers',
    image_url VARCHAR(255) NOT NULL,
    product_id INT NULL,
    category_id INT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_ar VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NULL,
    address_ar TEXT NOT NULL,
    address_en TEXT NULL,
    phone VARCHAR(20) NULL,
    working_hours_ar VARCHAR(150) NULL,
    working_hours_en VARCHAR(150) NULL,
    gps_link TEXT NULL,
    branch_link VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE store_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    key_value_ar TEXT NULL,
    key_value_en TEXT NULL,
    display_name_ar VARCHAR(150) NOT NULL,
    display_name_en VARCHAR(150) NULL
);
