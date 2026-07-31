CREATE TABLE IF NOT EXISTS payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    type ENUM('cod', 'wallet') NOT NULL DEFAULT 'wallet',
    provider VARCHAR(50) NULL,
    receiver_number VARCHAR(50) NULL,
    receiver_name VARCHAR(100) NULL,
    logo VARCHAR(255) NULL,
    require_screenshot BOOLEAN DEFAULT TRUE,
    require_transaction_id BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO payment_methods (name_ar, name_en, type, provider, receiver_number, receiver_name, sort_order) VALUES
('الدفع عند الاستلام', 'Cash on Delivery', 'cod', NULL, NULL, NULL, 1),
('فودافون كاش', 'Vodafone Cash', 'wallet', 'vodafone', '01000000000', 'Delora Market', 2),
('أورانج كاش', 'Orange Cash', 'wallet', 'orange', '01274146351', 'Delora Market', 3),
('اتصالات كاش', 'Etisalat Cash', 'wallet', 'etisalat', '01100000000', 'Delora Market', 4),
('WE كاش', 'WE Cash', 'wallet', 'we', '01500000000', 'Delora Market', 5),
('انستاباي', 'Instapay', 'wallet', 'instapay', 'delora.market@instapay', 'Delora Market', 6);
