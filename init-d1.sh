#!/bin/bash

# Script d'initialisation de la base Cloudflare D1

ACCOUNT_ID="7979421604bd07b3bd34d3ed96222512"
DATABASE_ID="854d0539-5e04-4e2a-a4fd-b0cfa98c7598"
API_TOKEN="ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW"
BASE_URL="https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/d1/database/$DATABASE_ID/query"

echo "🚀 Initialisation de la base Cloudflare D1..."

# Table des paramètres
curl -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, shop_name TEXT DEFAULT \"Ma Boutique\", admin_password TEXT DEFAULT \"admin123\", background_image TEXT DEFAULT \"\", background_opacity INTEGER DEFAULT 20, background_blur INTEGER DEFAULT 5, theme_color TEXT DEFAULT \"#000000\", contact_info TEXT DEFAULT \"\", shop_description TEXT DEFAULT \"\", loading_enabled BOOLEAN DEFAULT true, loading_duration INTEGER DEFAULT 3000, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
  }'

echo "✅ Table settings créée"

# Table des catégories
curl -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, description TEXT DEFAULT \"\", icon TEXT DEFAULT \"🏷️\", color TEXT DEFAULT \"#3B82F6\", created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
  }'

echo "✅ Table categories créée"

# Table des farms
curl -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "CREATE TABLE IF NOT EXISTS farms (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, description TEXT DEFAULT \"\", location TEXT DEFAULT \"\", contact TEXT DEFAULT \"\", created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
  }'

echo "✅ Table farms créée"

# Table des produits
curl -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT DEFAULT \"\", price REAL NOT NULL DEFAULT 0, category_id INTEGER, farm_id INTEGER, image_url TEXT DEFAULT \"\", images TEXT DEFAULT \"[]\", stock INTEGER DEFAULT 0, is_available BOOLEAN DEFAULT true, features TEXT DEFAULT \"[]\", tags TEXT DEFAULT \"[]\", created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
  }'

echo "✅ Table products créée"

# Table des pages
curl -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "CREATE TABLE IF NOT EXISTS pages (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, content TEXT DEFAULT \"\", is_active BOOLEAN DEFAULT true, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
  }'

echo "✅ Table pages créée"

# Table des liens sociaux
curl -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "CREATE TABLE IF NOT EXISTS social_links (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, url TEXT NOT NULL, icon TEXT DEFAULT \"🔗\", is_active BOOLEAN DEFAULT true, sort_order INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
  }'

echo "✅ Table social_links créée"

# Insérer des données par défaut
curl -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "INSERT OR IGNORE INTO settings (id, shop_name) VALUES (1, \"Ma Boutique\");"
  }'

curl -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "INSERT OR IGNORE INTO categories (name, description, icon, color) VALUES (\"Électronique\", \"Appareils électroniques et gadgets\", \"📱\", \"#3B82F6\"), (\"Vêtements\", \"Mode et accessoires\", \"👕\", \"#EF4444\"), (\"Maison\", \"Articles pour la maison\", \"🏠\", \"#10B981\"), (\"Sport\", \"Équipements sportifs\", \"⚽\", \"#F59E0B\");"
  }'

curl -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "INSERT OR IGNORE INTO farms (name, description, location) VALUES (\"Ferme Bio\", \"Production biologique locale\", \"France\"), (\"Artisan Local\", \"Fabrication artisanale\", \"Région Parisienne\");"
  }'

curl -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "INSERT OR IGNORE INTO pages (slug, title, content) VALUES (\"info\", \"Informations\", \"Bienvenue dans notre boutique en ligne !\"), (\"contact\", \"Contact\", \"Contactez-nous pour toute question.\");"
  }'

echo "🎉 Base de données D1 initialisée avec succès !"