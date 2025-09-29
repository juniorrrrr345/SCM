#!/bin/bash

# 🛍️ SCRIPT DUPLICATION BOUTIQUE SANS PROBLÈMES
# Version corrigée avec TOUTES les solutions appliquées

echo "🚀 DUPLICATION BOUTIQUE SANS LES PROBLÈMES RENCONTRÉS"
echo "📋 Solutions pour FAS appliquées automatiquement"
echo "=" * 60

# Variables à personnaliser
NOUVEAU_NOM="VOTRE-NOM-BOUTIQUE"
MONGODB_BASE="VOTRE-BASE-MONGODB"  # Exemple: "test", "fasandfurious", etc.
GITHUB_REPO="https://github.com/USERNAME/NOUVEAU-REPO.git"

echo "🏪 Nom boutique: $NOUVEAU_NOM"
echo "🗄️ Base MongoDB: $MONGODB_BASE"

# 1. Cloner le template FAS corrigé
echo ""
echo "📦 Clonage template FAS corrigé..."
git clone https://github.com/juniorrrrr345/FASV2.git "$NOUVEAU_NOM-BOUTIQUE"
cd "$NOUVEAU_NOM-BOUTIQUE"
rm -rf .git

# 2. Personnalisation nom boutique
echo "🏷️ Personnalisation nom: $NOUVEAU_NOM..."
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.json" -o -name "*.md" \) -exec sed -i "s/FAS/$NOUVEAU_NOM/g" {} \;

# 3. CORRECTION 1 : Dependencies Vercel (OBLIGATOIRE)
echo "🔧 CORRECTION 1: Dependencies Vercel..."
cat > package.json << EOF
{
  "name": "${NOUVEAU_NOM,,}-boutique",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.3",
    "react": "^18",
    "react-dom": "^18",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.294.0",
    "zustand": "^4.4.7",
    "mongodb": "^6.3.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8"
  },
  "devDependencies": {
    "eslint": "^8",
    "eslint-config-next": "14.0.3"
  }
}
EOF

# 4. Créer base D1
echo "🗄️ Création base D1..."
D1_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/7979421604bd07b3bd34d3ed96222512/d1/database" \
  -H "Authorization: Bearer ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$NOUVEAU_NOM\"}")

UUID=$(echo "$D1_RESPONSE" | jq -r '.result.uuid')

if [ "$UUID" != "null" ] && [ -n "$UUID" ]; then
    echo "✅ Base D1 créée: $UUID"
else
    echo "❌ Erreur création D1"
    exit 1
fi

# 5. Remplacer UUID partout
echo "🔧 Remplacement UUID..."
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) -exec sed -i "s/78d6725a-cd0f-46f9-9fa4-25ca4faa3efb/$UUID/g" {} \;

# 6. CORRECTION 2 : API test désactivée (OBLIGATOIRE)
echo "🔧 CORRECTION 2: Désactivation API test..."
cat > src/app/api/test-create/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API test désactivée - Données propres',
    note: 'Plus de création automatique de données de test'
  });
}
EOF

# 7. Modifier base MongoDB source
echo "🔧 CORRECTION 3: Base MongoDB source..."
sed -i "s/const MONGODB_DB_NAME = 'test'/const MONGODB_DB_NAME = '$MONGODB_BASE'/g" migrate-test-db.js

# 8. Initialiser tables D1
echo "📊 Initialisation tables D1..."
./init-d1-tables.sh

# 9. Migrer données MongoDB
echo "🔄 Migration MongoDB..."
npm install mongodb
node migrate-test-db.js

# 10. CORRECTION 4 : Nettoyer données test (OBLIGATOIRE)
echo "🧹 CORRECTION 4: Nettoyage données test..."
./clean-test-data.sh

# 11. CORRECTION 5 : Logo et textes (OBLIGATOIRE)
echo "🎨 CORRECTION 5: Logo et textes..."

# Récupérer image de fond depuis D1
BACKGROUND_IMAGE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/7979421604bd07b3bd34d3ed96222512/d1/database/$UUID/query" \
  -H "Authorization: Bearer ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW" \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT background_image FROM settings WHERE id = 1;"}' | jq -r '.result[0].results[0].background_image')

echo "🖼️ Image de fond récupérée: $BACKGROUND_IMAGE"

# Remplacer le logo par l'image de fond
if [ "$BACKGROUND_IMAGE" != "null" ] && [ -n "$BACKGROUND_IMAGE" ]; then
  sed -i "s|https://pub-b38679a01a274648827751df94818418.r2.dev/images/.*\.jpeg|$BACKGROUND_IMAGE|g" src/app/page.tsx
  echo "✅ Logo remplacé par image de fond"
else
  echo "⚠️ Pas d'image de fond trouvée, logo par défaut gardé"
fi

# Nettoyer tous les textes problématiques
sed -i 's/INDUSTRY//g' src/app/page.tsx
sed -i 's/© 2025 [A-Z]*/'"$NOUVEAU_NOM"'/g' src/app/page.tsx
sed -i 's/Chargement de .* INDUSTRY.*/Chargement.../g' src/app/page.tsx

# 12. Test build
echo "🏗️ Test build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussie !"
else
    echo "❌ Erreur build - vérifiez les corrections"
    exit 1
fi

# 13. Git et déploiement
echo "📋 Git et déploiement..."
git init
git add .
git commit -m "🚀 Boutique $NOUVEAU_NOM - Duplication sans problèmes"

echo ""
echo "🎉 DUPLICATION TERMINÉE SANS PROBLÈMES !"
echo ""
echo "📋 ÉTAPES SUIVANTES :"
echo "1. 🔗 Créer repository GitHub: $GITHUB_REPO"
echo "2. 📤 git remote add origin $GITHUB_REPO"
echo "3. 📤 git push -u origin main"
echo "4. 🌐 Déployer sur Vercel avec variables:"
echo ""
echo "🔧 VARIABLES VERCEL :"
echo "CLOUDFLARE_DATABASE_ID=$UUID"
echo "CLOUDFLARE_ACCOUNT_ID=7979421604bd07b3bd34d3ed96222512"
echo "CLOUDFLARE_API_TOKEN=ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW"
echo "CLOUDFLARE_R2_ACCESS_KEY_ID=82WsPNjX-j0UqZIGAny8b0uEehcHd0X3zMKNIKIN"
echo "CLOUDFLARE_R2_SECRET_ACCESS_KEY=28230e200a3b71e5374e569f8a297eba9aa3fe2e1097fdf26e5d9e340ded709d"
echo "CLOUDFLARE_R2_BUCKET_NAME=boutique-images"
echo "CLOUDFLARE_R2_PUBLIC_URL=https://pub-b38679a01a274648827751df94818418.r2.dev"
echo "ADMIN_PASSWORD=${NOUVEAU_NOM,,}_admin_2024"
echo "NODE_ENV=production"
echo ""
echo "✅ RÉSULTAT : Boutique $NOUVEAU_NOM 100% fonctionnelle sans aucun problème !"