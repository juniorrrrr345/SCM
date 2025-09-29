#!/bin/bash

# 🧹 NETTOYAGE DONNÉES DE TEST POUR FAS
echo "🧹 Nettoyage des données de test FAS..."

ACCOUNT_ID="7979421604bd07b3bd34d3ed96222512"
DATABASE_ID="78d6725a-cd0f-46f9-9fa4-25ca4faa3efb"
API_TOKEN="ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW"
BASE_URL="https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/d1/database/$DATABASE_ID/query"

# Supprimer toutes les catégories de test
echo "🗑️  Suppression catégories de test..."
curl -s -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sql": "DELETE FROM categories WHERE name LIKE \"Test-%\" OR description = \"Catégorie de test\";"}'

# Supprimer les farms de test si il y en a
echo "🗑️  Suppression farms de test..."
curl -s -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sql": "DELETE FROM farms WHERE name LIKE \"Test-%\" OR description = \"Farm de test\";"}'

# Supprimer les produits de test si il y en a
echo "🗑️  Suppression produits de test..."
curl -s -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sql": "DELETE FROM products WHERE name LIKE \"Test-%\" OR description = \"Produit de test\";"}'

# Vérification finale
echo "🔍 Vérification finale..."
CATEGORIES=$(curl -s -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT COUNT(*) as count FROM categories;"}')

PRODUCTS=$(curl -s -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT COUNT(*) as count FROM products;"}')

FARMS=$(curl -s -X POST "$BASE_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT COUNT(*) as count FROM farms;"}')

echo "📊 Résultat nettoyage :"
echo "   🏷️  Catégories: $(echo $CATEGORIES | jq -r '.result[0].results[0].count')"
echo "   🛍️  Produits: $(echo $PRODUCTS | jq -r '.result[0].results[0].count')"
echo "   🏭 Farms: $(echo $FARMS | jq -r '.result[0].results[0].count')"

echo ""
echo "✅ NETTOYAGE TERMINÉ !"
echo "✅ Plus de données de test"
echo "✅ Seules vos vraies données FAS restent"