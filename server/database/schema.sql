-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    images TEXT, -- JSON array of image URLs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول الطلبات
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    address TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'Pending',
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    telegram_chat_id TEXT,
    notes TEXT
);

-- إنشاء جدول عناصر الطلبات
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- إنشاء جدول معلومات التواصل
CREATE TABLE IF NOT EXISTS contact_info (
    id INTEGER PRIMARY KEY,
    phone TEXT,
    email TEXT,
    facebook TEXT,
    instagram TEXT,
    tiktok TEXT,
    working_hours TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول إعدادات الموقع
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- إدراج البيانات الأولية لمعلومات التواصل
INSERT OR IGNORE INTO contact_info (id, phone, email, facebook, instagram, tiktok, working_hours) 
VALUES (1, '+20 123 456 7890', 'support@elegance-store.com', '#', '#', '#', 'السبت - الخميس، 9 صباحًا - 6 مساءً');

-- إدراج إعدادات الموقع الأولية
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('site_logo_url', 'https://i.ibb.co/tZPYk6G/Maloka-Story-Logo.png');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('hero_slider_images', '[]');
