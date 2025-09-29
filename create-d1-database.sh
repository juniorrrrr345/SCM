#!/bin/bash

# 🗄️ CRÉATION BASE D1 POUR FAS
echo "🗄️ Création de la base de données D1 pour FAS..."

# Créer la base D1
RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/7979421604bd07b3bd34d3ed96222512/d1/database" \
  -H "Authorization: Bearer ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW" \
  -H "Content-Type: application/json" \
  -d '{"name": "FAS"}')

echo "📋 Réponse création D1:"
echo "$RESPONSE" | jq '.'

# Extraire l'UUID
UUID=$(echo "$RESPONSE" | jq -r '.result.uuid // empty')

if [ -n "$UUID" ] && [ "$UUID" != "null" ]; then
    echo ""
    echo "🎉 BASE D1 CRÉÉE AVEC SUCCÈS !"
    echo "📝 UUID: $UUID"
    echo ""
    echo "🔧 Remplacement automatique de l'UUID dans les fichiers..."
    
    # Remplacer l'UUID dans tous les fichiers
    find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.sh" | xargs sed -i "s/VOTRE-UUID/$UUID/g"
    
    echo "✅ UUID remplacé partout !"
    echo ""
    echo "📋 INFORMATIONS IMPORTANTES :"
    echo "   🆔 UUID D1: $UUID"
    echo "   🏪 Nom boutique: FAS"
    echo "   📊 MongoDB source: fasandfurious"
    echo ""
    echo "🚀 Prochaine étape: npm run migrate-mongodb"
else
    echo "❌ Erreur création base D1"
    echo "$RESPONSE"
    exit 1
fi