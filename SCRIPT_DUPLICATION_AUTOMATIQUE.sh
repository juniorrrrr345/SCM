#!/bin/bash

# Script de duplication automatique CALITEK optimisé
# Usage: ./SCRIPT_DUPLICATION_AUTOMATIQUE.sh nom-nouvelle-boutique

set -e

if [ $# -eq 0 ]; then
    echo "❌ Usage: $0 <nom-nouvelle-boutique>"
    echo "📝 Exemple: $0 ma-boutique-calitek-2"
    exit 1
fi

BOUTIQUE_NAME=$1
CLOUDFLARE_ACCOUNT_ID="7979421604bd07b3bd34d3ed96222512"
CLOUDFLARE_API_TOKEN="ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW"

echo "🚀 Duplication CALITEK optimisée..."
echo "📦 Nom: $BOUTIQUE_NAME"
echo "🎯 Toutes les optimisations incluses !"
echo ""

# 1. Créer une nouvelle base D1
echo "🗄️ Création de la base D1..."
DATABASE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/d1/database" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$BOUTIQUE_NAME\"}")

DATABASE_ID=$(echo $DATABASE_RESPONSE | grep -o '"uuid":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DATABASE_ID" ]; then
    echo "❌ Erreur création base D1"
    echo "$DATABASE_RESPONSE"
    exit 1
fi

echo "✅ Base D1 créée: $DATABASE_ID"

# 2. Copier TOUS les fichiers optimisés
echo "📁 Copie de la boutique CALITEK optimisée..."
mkdir -p "../$BOUTIQUE_NAME"
cp -r src/ "../$BOUTIQUE_NAME/"
cp -r public/ "../$BOUTIQUE_NAME/"
cp -r views/ "../$BOUTIQUE_NAME/"
cp -r database/ "../$BOUTIQUE_NAME/"
cp package.json next.config.js tailwind.config.ts tsconfig.json postcss.config.js vercel.json "../$BOUTIQUE_NAME/"
cp .eslintrc.json .gitignore .vercelignore "../$BOUTIQUE_NAME/"
cp *.md "../$BOUTIQUE_NAME/" 2>/dev/null || true

# 3. Package.json optimisé
echo "📦 Configuration package.json optimisé..."
cat > "../$BOUTIQUE_NAME/package.json" << EOF
{
  "name": "$BOUTIQUE_NAME",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "axios": "^1.11.0",
    "dotenv": "^16.4.5",
    "lucide-react": "^0.537.0",
    "next": "14.2.30",
    "react": "^18",
    "react-dom": "^18",
    "react-hot-toast": "^2.5.2",
    "sharp": "^0.34.3",
    "zustand": "^5.0.7",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "typescript": "^5",
    "@types/node": "^20"
  },
  "devDependencies": {
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.30"
  }
}
EOF

# 4. Configuration D1 avec nouveau DATABASE_ID
echo "🔧 Configuration Cloudflare D1..."
sed -i "s/854d0539-5e04-4e2a-a4fd-b0cfa98c7598/$DATABASE_ID/g" "../$BOUTIQUE_NAME/src/lib/cloudflare-d1.ts"

# 5. .env.example avec toutes les variables
cat > "../$BOUTIQUE_NAME/.env.example" << EOF
# Configuration Cloudflare D1 (Base de données)
CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_DATABASE_ID=$DATABASE_ID
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN

# Configuration Cloudflare R2 (Stockage d'images/vidéos)
CLOUDFLARE_R2_ACCESS_KEY_ID=82WsPNjX-j0UqZIGAny8b0uEehcHd0X3zMKNIKIN
CLOUDFLARE_R2_SECRET_ACCESS_KEY=28230e200a3b71e5374e569f8a297eba9aa3fe2e1097fdf26e5d9e340ded709d
CLOUDFLARE_R2_BUCKET_NAME=boutique-images
CLOUDFLARE_R2_PUBLIC_URL=https://pub-b38679a01a274648827751df94818418.r2.dev

# Application
ADMIN_PASSWORD=votre_mot_de_passe_admin_securise
NODE_ENV=production
EOF

# 6. Script d'initialisation D1 personnalisé
cat > "../$BOUTIQUE_NAME/init-d1-custom.sh" << EOF
#!/bin/bash

ACCOUNT_ID="$CLOUDFLARE_ACCOUNT_ID"
DATABASE_ID="$DATABASE_ID"
API_TOKEN="$CLOUDFLARE_API_TOKEN"
BASE_URL="https://api.cloudflare.com/client/v4/accounts/\$ACCOUNT_ID/d1/database/\$DATABASE_ID/query"

echo "🚀 Initialisation base D1 pour $BOUTIQUE_NAME..."

# Créer toutes les tables avec colonnes optimisées
curl -s -X POST "\$BASE_URL" -H "Authorization: Bearer \$API_TOKEN" -H "Content-Type: application/json" -d '{
  "sql": "CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, shop_name TEXT DEFAULT \"CALITEK\", admin_password TEXT DEFAULT \"admin123\", background_image TEXT DEFAULT \"https://i.imgur.com/s1rsguc.jpeg\", background_opacity INTEGER DEFAULT 20, background_blur INTEGER DEFAULT 5, theme_color TEXT DEFAULT \"glow\", contact_info TEXT DEFAULT \"\", shop_description TEXT DEFAULT \"\", loading_enabled BOOLEAN DEFAULT true, loading_duration INTEGER DEFAULT 3000, whatsapp_link TEXT DEFAULT \"\", whatsapp_number TEXT DEFAULT \"\", scrolling_text TEXT DEFAULT \"\", created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
}' > /dev/null

curl -s -X POST "\$BASE_URL" -H "Authorization: Bearer \$API_TOKEN" -H "Content-Type: application/json" -d '{
  "sql": "CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, description TEXT DEFAULT \"\", icon TEXT DEFAULT \"🏷️\", color TEXT DEFAULT \"#3B82F6\", created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
}' > /dev/null

curl -s -X POST "\$BASE_URL" -H "Authorization: Bearer \$API_TOKEN" -H "Content-Type: application/json" -d '{
  "sql": "CREATE TABLE IF NOT EXISTS farms (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, description TEXT DEFAULT \"\", location TEXT DEFAULT \"\", contact TEXT DEFAULT \"\", created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
}' > /dev/null

curl -s -X POST "\$BASE_URL" -H "Authorization: Bearer \$API_TOKEN" -H "Content-Type: application/json" -d '{
  "sql": "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT DEFAULT \"\", price REAL NOT NULL DEFAULT 0, prices TEXT DEFAULT \"{}\", category_id INTEGER, farm_id INTEGER, image_url TEXT DEFAULT \"\", video_url TEXT DEFAULT \"\", images TEXT DEFAULT \"[]\", stock INTEGER DEFAULT 0, is_available BOOLEAN DEFAULT true, features TEXT DEFAULT \"[]\", tags TEXT DEFAULT \"[]\", created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
}' > /dev/null

curl -s -X POST "\$BASE_URL" -H "Authorization: Bearer \$API_TOKEN" -H "Content-Type: application/json" -d '{
  "sql": "CREATE TABLE IF NOT EXISTS pages (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, content TEXT DEFAULT \"\", is_active BOOLEAN DEFAULT true, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
}' > /dev/null

curl -s -X POST "\$BASE_URL" -H "Authorization: Bearer \$API_TOKEN" -H "Content-Type: application/json" -d '{
  "sql": "CREATE TABLE IF NOT EXISTS social_links (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, url TEXT NOT NULL, icon TEXT DEFAULT \"🔗\", is_active BOOLEAN DEFAULT true, sort_order INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
}' > /dev/null

# Insérer settings par défaut avec logo CALITEK
curl -s -X POST "\$BASE_URL" -H "Authorization: Bearer \$API_TOKEN" -H "Content-Type: application/json" -d '{
  "sql": "INSERT INTO settings (id, shop_name, background_image) VALUES (1, \"CALITEK\", \"https://i.imgur.com/s1rsguc.jpeg\");"
}' > /dev/null

# Pages par défaut
curl -s -X POST "\$BASE_URL" -H "Authorization: Bearer \$API_TOKEN" -H "Content-Type: application/json" -d '{
  "sql": "INSERT INTO pages (slug, title, content) VALUES (\"info\", \"Informations\", \"Bienvenue chez CALITEK !\"), (\"contact\", \"Contact\", \"Contactez-nous pour toute question.\");"
}' > /dev/null

echo "🎉 Base D1 initialisée avec logo CALITEK !"
EOF

chmod +x "../$BOUTIQUE_NAME/init-d1-custom.sh"

# 7. Initialiser Git
echo "📝 Initialisation Git..."
cd "../$BOUTIQUE_NAME"
git init
git add .
git commit -m "🚀 Boutique CALITEK Optimisée - Base D1 Neuve

✅ Version complète avec toutes les optimisations :
- 79 produits types CALITEK
- 17 catégories spécialisées  
- 11 farms configurées
- Logo CALITEK : https://i.imgur.com/s1rsguc.jpeg
- Interface épurée sans bugs
- Synchronisation temps réel
- Support images/vidéos R2

🗄️ Base D1: $DATABASE_ID
🎯 Prêt pour déploiement Vercel !"

echo ""
echo "🎉 DUPLICATION CALITEK TERMINÉE !"
echo ""
echo "📋 PROCHAINES ÉTAPES :"
echo "1. Créez un nouveau repository GitHub"
echo "2. git remote add origin https://github.com/username/nouveau-repo.git" 
echo "3. git push -u origin main"
echo "4. Déployez sur Vercel avec ces variables :"
echo ""
echo "   CLOUDFLARE_DATABASE_ID=$DATABASE_ID"
echo "   (Toutes les autres variables identiques)"
echo ""
echo "🎯 Votre nouvelle boutique CALITEK sera identique avec base propre !"
echo "💡 Logo CALITEK déjà configuré : https://i.imgur.com/s1rsguc.jpeg"