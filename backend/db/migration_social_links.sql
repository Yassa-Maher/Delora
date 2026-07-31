CREATE TABLE IF NOT EXISTS social_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    platform_name VARCHAR(50) NOT NULL,
    url VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO social_links (platform_name, url, icon, sort_order) VALUES
('facebook', 'https://www.facebook.com/deloramarket', 'FaFacebookF', 1),
('instagram', 'https://www.instagram.com/deloramarket', 'FaInstagram', 2),
('whatsapp', 'https://wa.me/201001105352', 'FaWhatsapp', 3),
('telegram', 'https://t.me/deloramarket', 'FaTelegramPlane', 4),
('twitter', 'https://twitter.com/deloramarket', 'FaTwitter', 5);
