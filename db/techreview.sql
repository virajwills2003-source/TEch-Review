-- ============================================================
-- TECH REVIEW — MySQL Database Schema
-- Import this file via phpMyAdmin or MySQL CLI
-- ============================================================

CREATE DATABASE IF NOT EXISTS techreview CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE techreview;

-- ----------------------------------------------------------
-- TABLE: users
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  username     VARCHAR(60)  NOT NULL UNIQUE,
  name         VARCHAR(120) NOT NULL,
  email        VARCHAR(180),
  password     VARCHAR(255) NOT NULL,          -- MD5 hashed for demo; use bcrypt in production
  role         ENUM('user','admin') NOT NULL DEFAULT 'user',
  avatar       TEXT,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Default accounts
-- Passwords are MD5 of plain text (admin123, user123)
INSERT INTO users (username, name, email, password, role, avatar) VALUES
(
  'admin',
  'System Admin',
  'admin@techreview.com',
  MD5('admin123'),
  'admin',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
),
(
  'user',
  'Mobile Enthusiast',
  'user@techreview.com',
  MD5('user123'),
  'user',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
);

-- ----------------------------------------------------------
-- TABLE: phones
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS phones (
  id            VARCHAR(80)  NOT NULL PRIMARY KEY,
  brand         VARCHAR(80)  NOT NULL,
  model         VARCHAR(120) NOT NULL,
  release_date  VARCHAR(60),
  status        VARCHAR(120),
  price         VARCHAR(60),
  image         TEXT,
  youtube_url   TEXT,
  youtube_id    VARCHAR(20),
  rating        DECIMAL(3,1) DEFAULT 4.5,
  views         INT          DEFAULT 0,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- TABLE: phone_specs  (one row per specification field)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS phone_specs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  phone_id   VARCHAR(80) NOT NULL,
  category   VARCHAR(60) NOT NULL,   -- e.g. 'network', 'display', 'platform'
  spec_key   VARCHAR(80) NOT NULL,   -- e.g. 'technology', 'sim', 'type'
  spec_value TEXT,
  FOREIGN KEY (phone_id) REFERENCES phones(id) ON DELETE CASCADE,
  INDEX idx_phone_id (phone_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- SEED PHONES: iPhone 16 Pro Max
-- ----------------------------------------------------------
INSERT INTO phones (id, brand, model, release_date, status, price, image, youtube_url, youtube_id, rating, views)
VALUES (
  'phone-16-pro-max', 'Apple', 'iPhone 16 Pro Max',
  '2024, September', 'Available. Released 2024, September',
  '$1,199',
  'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
  'https://www.youtube.com/watch?v=M-MkWpXb72g',
  'M-MkWpXb72g', 4.8, 14200
);

INSERT INTO phone_specs (phone_id, category, spec_key, spec_value) VALUES
('phone-16-pro-max','network','technology','GSM / CDMA / HSPA / EVDO / LTE / 5G'),
('phone-16-pro-max','network','sim','Nano-SIM and eSIM / Dual eSIM'),
('phone-16-pro-max','body','dimensions','163.0 x 77.6 x 8.25 mm'),
('phone-16-pro-max','body','weight','227 g (8.01 oz)'),
('phone-16-pro-max','body','build','Glass front/back (Corning), grade 5 titanium frame'),
('phone-16-pro-max','body','ipRating','IP68 dust/water resistant (up to 6m for 30 min)'),
('phone-16-pro-max','display','type','LTPO Super Retina XDR OLED, 120Hz, HDR10, Dolby Vision, 2000 nits'),
('phone-16-pro-max','display','size','6.9 inches, 115.6 cm2 (~91.4% screen-to-body ratio)'),
('phone-16-pro-max','display','resolution','1320 x 2868 pixels, 19.5:9 ratio (~460 ppi)'),
('phone-16-pro-max','display','protection','Ceramic Shield glass (2024 generation)'),
('phone-16-pro-max','platform','os','iOS 18, upgradable to iOS 18.1'),
('phone-16-pro-max','platform','chipset','Apple A18 Pro (3 nm)'),
('phone-16-pro-max','platform','cpu','Hexa-core (2x4.04 GHz + 4x2.0 GHz)'),
('phone-16-pro-max','platform','gpu','Apple GPU (6-core graphics)'),
('phone-16-pro-max','memory','internal','256GB / 512GB / 1TB NVMe, 8GB RAM'),
('phone-16-pro-max','memory','cardSlot','No'),
('phone-16-pro-max','mainCamera','triple','48 MP (wide, OIS), 12 MP (periscope telephoto 5x), 48 MP (ultrawide)'),
('phone-16-pro-max','mainCamera','features','Dual-LED flash, HDR, LiDAR scanner'),
('phone-16-pro-max','mainCamera','video','4K@24/25/30/60/100/120fps, ProRes, Dolby Vision HDR'),
('phone-16-pro-max','selfieCamera','single','12 MP, f/1.9, PDAF, OIS'),
('phone-16-pro-max','selfieCamera','video','4K@24/25/30/60fps'),
('phone-16-pro-max','battery','type','Li-Ion 4685 mAh, non-removable'),
('phone-16-pro-max','battery','charging','Wired 25W, 25W MagSafe wireless, 15W Qi2'),
('phone-16-pro-max','comms','wlan','Wi-Fi 802.11 a/b/g/n/ac/6e/7, tri-band'),
('phone-16-pro-max','comms','bluetooth','5.3, A2DP, LE'),
('phone-16-pro-max','comms','nfc','Yes'),
('phone-16-pro-max','comms','usb','USB Type-C 3.2 Gen 2, DisplayPort'),
('phone-16-pro-max','features','sensors','Face ID, accelerometer, gyro, proximity, compass, barometer');

-- ----------------------------------------------------------
-- SEED PHONES: Samsung Galaxy S24 Ultra
-- ----------------------------------------------------------
INSERT INTO phones (id, brand, model, release_date, status, price, image, youtube_url, youtube_id, rating, views)
VALUES (
  'samsung-s24-ultra', 'Samsung', 'Galaxy S24 Ultra',
  '2024, January', 'Available. Released 2024, January',
  '$1,299',
  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
  'https://www.youtube.com/watch?v=v3_v9U47YhQ',
  'v3_v9U47YhQ', 4.7, 18900
);

INSERT INTO phone_specs (phone_id, category, spec_key, spec_value) VALUES
('samsung-s24-ultra','network','technology','GSM / CDMA / HSPA / EVDO / LTE / 5G'),
('samsung-s24-ultra','network','sim','Nano-SIM and eSIM / Dual SIM'),
('samsung-s24-ultra','body','dimensions','162.3 x 79.0 x 8.6 mm'),
('samsung-s24-ultra','body','weight','232 g (8.18 oz)'),
('samsung-s24-ultra','body','build','Glass front (Gorilla Armor), glass back, titanium frame'),
('samsung-s24-ultra','body','ipRating','IP68 dust/water resistant, S-Pen included'),
('samsung-s24-ultra','display','type','Dynamic LTPO AMOLED 2X, 120Hz, HDR10+, 2600 nits'),
('samsung-s24-ultra','display','size','6.8 inches, 113.5 cm2 (~88.5% screen-to-body ratio)'),
('samsung-s24-ultra','display','resolution','1440 x 3120 pixels (~505 ppi)'),
('samsung-s24-ultra','display','protection','Corning Gorilla Armor'),
('samsung-s24-ultra','platform','os','Android 14, One UI 6.1.1 (7 major upgrades)'),
('samsung-s24-ultra','platform','chipset','Snapdragon 8 Gen 3 (4 nm)'),
('samsung-s24-ultra','platform','cpu','8-core (1x3.39 GHz Cortex-X4 & 3x3.1 GHz & 2x2.9 GHz & 2x2.2 GHz)'),
('samsung-s24-ultra','platform','gpu','Adreno 750 (1 GHz)'),
('samsung-s24-ultra','memory','internal','256GB / 512GB / 1TB UFS 4.0, 12GB RAM'),
('samsung-s24-ultra','memory','cardSlot','No'),
('samsung-s24-ultra','mainCamera','triple','200 MP (wide, OIS), 50 MP (periscope 5x), 10 MP (3x), 12 MP (ultrawide)'),
('samsung-s24-ultra','mainCamera','video','8K@24fps, 4K@120fps, HDR10+'),
('samsung-s24-ultra','selfieCamera','single','12 MP, f/2.2, Dual Pixel PDAF'),
('samsung-s24-ultra','selfieCamera','video','4K@60fps'),
('samsung-s24-ultra','battery','type','Li-Ion 5000 mAh, non-removable'),
('samsung-s24-ultra','battery','charging','Wired 45W, 15W wireless, 4.5W reverse wireless'),
('samsung-s24-ultra','comms','wlan','Wi-Fi 7, tri-band, Wi-Fi Direct'),
('samsung-s24-ultra','comms','bluetooth','5.3, A2DP, LE'),
('samsung-s24-ultra','comms','nfc','Yes'),
('samsung-s24-ultra','comms','usb','USB Type-C 3.2, OTG, DisplayPort'),
('samsung-s24-ultra','features','sensors','Fingerprint (under display, ultrasonic), accelerometer, gyro, barometer, Samsung DeX');

-- ----------------------------------------------------------
-- SEED PHONES: ASUS ROG Phone 9 Pro
-- ----------------------------------------------------------
INSERT INTO phones (id, brand, model, release_date, status, price, image, youtube_url, youtube_id, rating, views)
VALUES (
  'rog-phone-9-pro', 'ASUS', 'ROG Phone 9 Pro',
  '2024, November', 'Available. Released 2024, November',
  '$1,199',
  'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=600&q=80',
  'https://www.youtube.com/watch?v=1SgWp839w5A',
  '1SgWp839w5A', 4.9, 9400
);

INSERT INTO phone_specs (phone_id, category, spec_key, spec_value) VALUES
('rog-phone-9-pro','network','technology','GSM / CDMA / HSPA / LTE / 5G'),
('rog-phone-9-pro','network','sim','Dual SIM (Nano-SIM, dual stand-by)'),
('rog-phone-9-pro','body','dimensions','163.8 x 76.8 x 8.9 mm'),
('rog-phone-9-pro','body','weight','227 g (8.01 oz)'),
('rog-phone-9-pro','body','build','Gorilla Glass Victus 2 front/back, aluminum frame'),
('rog-phone-9-pro','body','ipRating','IP68, AniMe Vision LED matrix (648 LEDs)'),
('rog-phone-9-pro','display','type','LTPO AMOLED, 185Hz, HDR10, 2500 nits'),
('rog-phone-9-pro','display','size','6.78 inches (~88.2% screen-to-body ratio)'),
('rog-phone-9-pro','display','resolution','1080 x 2400 pixels (~388 ppi)'),
('rog-phone-9-pro','display','protection','Corning Gorilla Glass Victus 2'),
('rog-phone-9-pro','platform','os','Android 15, ROG UI'),
('rog-phone-9-pro','platform','chipset','Qualcomm Snapdragon 8 Elite (3 nm)'),
('rog-phone-9-pro','platform','cpu','8-core (2x4.32 GHz Oryon V2 & 6x3.53 GHz)'),
('rog-phone-9-pro','platform','gpu','Adreno 830'),
('rog-phone-9-pro','memory','internal','512GB 16GB RAM / 1TB 24GB RAM (UFS 4.0)'),
('rog-phone-9-pro','memory','cardSlot','No'),
('rog-phone-9-pro','mainCamera','triple','50 MP (Gimbal OIS), 32 MP (telephoto 3x), 13 MP (ultrawide)'),
('rog-phone-9-pro','mainCamera','video','8K@30fps, 4K@60fps, HDR10+'),
('rog-phone-9-pro','selfieCamera','single','32 MP, f/2.5, 22mm wide'),
('rog-phone-9-pro','selfieCamera','video','1080p@30fps'),
('rog-phone-9-pro','battery','type','Si/C 5800 mAh, non-removable'),
('rog-phone-9-pro','battery','charging','Wired 65W (100% in 46 min), 15W wireless, 10W reverse'),
('rog-phone-9-pro','comms','wlan','Wi-Fi 7, tri-band, Wi-Fi Direct'),
('rog-phone-9-pro','comms','bluetooth','5.4, aptX HD, aptX Adaptive'),
('rog-phone-9-pro','comms','nfc','Yes'),
('rog-phone-9-pro','comms','usb','USB Type-C 3.2 + USB-C 2.0, DisplayPort 1.4'),
('rog-phone-9-pro','features','sensors','Fingerprint (under display), pressure gaming triggers, accelerometer, gyro');

-- ----------------------------------------------------------
-- SEED PHONES: Vivo V30 Pro
-- ----------------------------------------------------------
INSERT INTO phones (id, brand, model, release_date, status, price, image, youtube_url, youtube_id, rating, views)
VALUES (
  'vivo-v30-pro', 'Vivo', 'Vivo V30 Pro',
  '2024, February', 'Available. Released 2024, March',
  '$540',
  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
  'https://www.youtube.com/watch?v=6P5E1B_k10I',
  '6P5E1B_k10I', 4.6, 8100
);

INSERT INTO phone_specs (phone_id, category, spec_key, spec_value) VALUES
('vivo-v30-pro','network','technology','GSM / HSPA / LTE / 5G'),
('vivo-v30-pro','network','sim','Dual SIM (Nano-SIM, dual stand-by)'),
('vivo-v30-pro','body','dimensions','164.4 x 75.1 x 7.5 mm'),
('vivo-v30-pro','body','weight','188 g'),
('vivo-v30-pro','body','ipRating','IP54 splash resistant'),
('vivo-v30-pro','display','type','AMOLED, 120Hz, HDR10+, 2800 nits'),
('vivo-v30-pro','display','size','6.78 inches (~89.9% screen-to-body ratio)'),
('vivo-v30-pro','display','resolution','1260 x 2800 pixels (~453 ppi)'),
('vivo-v30-pro','platform','os','Android 14, Funtouch 14'),
('vivo-v30-pro','platform','chipset','Mediatek Dimensity 8200 (4 nm)'),
('vivo-v30-pro','platform','gpu','Mali-G610 MC6'),
('vivo-v30-pro','memory','internal','256GB 12GB RAM / 512GB 12GB RAM (UFS 3.1)'),
('vivo-v30-pro','mainCamera','triple','50 MP (wide, OIS, ZEISS), 50 MP (tele 2x), 50 MP (ultrawide 119°)'),
('vivo-v30-pro','mainCamera','video','4K@30fps, gyro-EIS'),
('vivo-v30-pro','selfieCamera','single','50 MP, f/2.0, 21mm, AF'),
('vivo-v30-pro','battery','type','Li-Ion 5000 mAh'),
('vivo-v30-pro','battery','charging','80W wired, 100% in 43 min'),
('vivo-v30-pro','comms','wlan','Wi-Fi 802.11 a/b/g/n/ac/6'),
('vivo-v30-pro','comms','bluetooth','5.3, aptX HD'),
('vivo-v30-pro','comms','nfc','Yes (market dependent)'),
('vivo-v30-pro','comms','usb','USB Type-C 2.0, OTG'),
('vivo-v30-pro','features','sensors','Fingerprint (under display, optical), accelerometer, gyro, compass');

-- ----------------------------------------------------------
-- SEED PHONES: Huawei P60 Pro
-- ----------------------------------------------------------
INSERT INTO phones (id, brand, model, release_date, status, price, image, youtube_url, youtube_id, rating, views)
VALUES (
  'huawei-p60-pro', 'Huawei', 'Huawei P60 Pro',
  '2023, March', 'Available. Released 2023, March',
  '$990',
  'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80',
  'https://www.youtube.com/watch?v=w1vG7X29e7k',
  'w1vG7X29e7k', 4.7, 11200
);

INSERT INTO phone_specs (phone_id, category, spec_key, spec_value) VALUES
('huawei-p60-pro','network','technology','GSM / CDMA / HSPA / LTE'),
('huawei-p60-pro','network','sim','Single SIM / Hybrid Dual SIM'),
('huawei-p60-pro','body','dimensions','161.0 x 74.5 x 8.3 mm'),
('huawei-p60-pro','body','weight','200 g'),
('huawei-p60-pro','body','ipRating','IP68 dust/water resistant'),
('huawei-p60-pro','display','type','LTPO OLED, 120Hz'),
('huawei-p60-pro','display','size','6.67 inches (~89.8% screen-to-body ratio)'),
('huawei-p60-pro','display','resolution','1220 x 2700 pixels (~444 ppi)'),
('huawei-p60-pro','platform','os','EMUI 13.1 / HarmonyOS 3.1'),
('huawei-p60-pro','platform','chipset','Snapdragon 8+ Gen 1 4G (4 nm)'),
('huawei-p60-pro','platform','gpu','Adreno 730'),
('huawei-p60-pro','memory','internal','256GB 8GB RAM / 512GB 12GB RAM'),
('huawei-p60-pro','memory','cardSlot','NM Card, up to 256GB'),
('huawei-p60-pro','mainCamera','triple','48 MP (variable f/1.4-f/4.0, OIS), 48 MP (telephoto 3.5x, OIS), 13 MP (ultrawide)'),
('huawei-p60-pro','mainCamera','features','XMAGE camera system, LED flash, HDR'),
('huawei-p60-pro','mainCamera','video','4K@60fps, 1080p@960fps'),
('huawei-p60-pro','selfieCamera','single','13 MP, f/2.4 ultrawide'),
('huawei-p60-pro','battery','type','Li-Po 4815 mAh, non-removable'),
('huawei-p60-pro','battery','charging','88W wired (50% in 10 min), 50W wireless, reverse wireless'),
('huawei-p60-pro','comms','wlan','Wi-Fi 802.11 a/b/g/n/ac/6'),
('huawei-p60-pro','comms','bluetooth','5.2, A2DP, LE'),
('huawei-p60-pro','comms','nfc','Yes'),
('huawei-p60-pro','comms','usb','USB Type-C 3.1, OTG'),
('huawei-p60-pro','features','sensors','Fingerprint (under display, optical), accelerometer, gyro, compass, BDS Satellite');

-- Verify
SELECT 'Database setup complete! Tables created & seeded.' AS Message;
SELECT CONCAT(brand, ' ', model) AS Phone, price FROM phones ORDER BY created_at;
