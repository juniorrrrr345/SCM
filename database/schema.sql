-- Schema SQL pour Cloudflare D1
-- Remplace les modèles MongoDB

-- Table des paramètres
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_name TEXT DEFAULT 'Ma Boutique',
    admin_password TEXT DEFAULT 'admin123',
    background_image TEXT DEFAULT '',
    background_opacity INTEGER DEFAULT 20,
    background_blur INTEGER DEFAULT 5,
    theme_color TEXT DEFAULT '#000000',
    contact_info TEXT DEFAULT '',
    shop_description TEXT DEFAULT '',
    loading_enabled BOOLEAN DEFAULT true,
    loading_duration INTEGER DEFAULT 3000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    icon TEXT DEFAULT '🏷️',
    color TEXT DEFAULT '#3B82F6',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des fermes/fournisseurs
CREATE TABLE IF NOT EXISTS farms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    location TEXT DEFAULT '',
    contact TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price REAL NOT NULL DEFAULT 0,
    category_id INTEGER,
    farm_id INTEGER,
    image_url TEXT DEFAULT '',
    images TEXT DEFAULT '[]', -- JSON array des URLs d'images
    stock INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    features TEXT DEFAULT '[]', -- JSON array des caractéristiques
    tags TEXT DEFAULT '[]', -- JSON array des tags
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL
);

-- Table des pages personnalisées
CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des liens sociaux
CREATE TABLE IF NOT EXISTS social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT DEFAULT '🔗',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des commandes (optionnel)
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    items TEXT NOT NULL, -- JSON des produits commandés
    total_amount REAL NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, confirmed, delivered, cancelled
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_farm ON products(farm_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Données par défaut
INSERT OR IGNORE INTO settings (id) VALUES (1);

INSERT OR IGNORE INTO categories (name, description, icon, color) VALUES 
('Électronique', 'Appareils électroniques et gadgets', '📱', '#3B82F6'),
('Vêtements', 'Mode et accessoires', '👕', '#EF4444'),
('Maison', 'Articles pour la maison', '🏠', '#10B981'),
('Sport', 'Équipements sportifs', '⚽', '#F59E0B');

INSERT OR IGNORE INTO farms (name, description, location) VALUES 
('Ferme Bio', 'Production biologique locale', 'France'),
('Artisan Local', 'Fabrication artisanale', 'Région Parisienne');

INSERT OR IGNORE INTO pages (slug, title, content) VALUES 
('info', 'Informations', 'Bienvenue dans notre boutique en ligne !'),
('contact', 'Contact', 'Contactez-nous pour toute question.');