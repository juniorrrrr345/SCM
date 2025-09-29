# ✅ Checklist Post-Duplication - Vérifications Obligatoires

## 🧪 **TESTS À FAIRE APRÈS CHAQUE DUPLICATION**

### **1. ✅ Variables d'environnement Vercel**

**Vérifiez que TOUTES ces variables sont configurées :**

```bash
# Variables Cloudflare Core
CLOUDFLARE_ACCOUNT_ID=7979421604bd07b3bd34d3ed96222512
CLOUDFLARE_DATABASE_ID=VOTRE_NOUVEAU_DATABASE_ID  # ⚠️ UNIQUE par boutique
CLOUDFLARE_API_TOKEN=ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW

# Variables Cloudflare R2 (partagées)
CLOUDFLARE_R2_ACCESS_KEY_ID=82WsPNjX-j0UqZIGAny8b0uEehcHd0X3zMKNIKIN
CLOUDFLARE_R2_SECRET_ACCESS_KEY=28230e200a3b71e5374e569f8a297eba9aa3fe2e1097fdf26e5d9e340ded709d
CLOUDFLARE_R2_BUCKET_NAME=boutique-images
CLOUDFLARE_R2_PUBLIC_URL=https://pub-b38679a01a274648827751df94818418.r2.dev

# Variables application (personnalisées)
ADMIN_PASSWORD=mot_de_passe_unique_pour_cette_boutique
NODE_ENV=production
```

**🧪 Test :**
```bash
https://votre-boutique.vercel.app/api/debug-admin
# Doit montrer : hasCloudflareAccountId: true, hasCloudflareToken: true, etc.
```

---

### **2. ✅ Base de données D1 initialisée**

**Vérifiez que les tables existent :**

```bash
# Test complet de la base
https://votre-boutique.vercel.app/api/debug-all

# Résultat attendu :
{
  "database": {
    "products": {"status": "fulfilled", "count": 0},
    "categories": {"status": "fulfilled", "count": 0},
    "farms": {"status": "fulfilled", "count": 0},
    "settings": {"status": "fulfilled", "data": {...}},
    "socialLinks": {"status": "fulfilled", "count": 0},
    "pages": {"status": "fulfilled", "count": 2}
  }
}
```

**❌ Si "no such table" :**
```bash
cd votre-boutique
./init-d1-custom.sh
```

---

### **3. ✅ Stockage R2 fonctionnel**

**Test upload d'images :**

```bash
https://votre-boutique.vercel.app/api/test-r2

# Résultat attendu :
{
  "success": true,
  "config": {
    "hasApiToken": true,
    "hasAccessKeys": true,
    "bucketName": "boutique-images"
  }
}
```

---

### **4. ✅ Routes API complètes**

**Testez TOUTES ces routes (doivent retourner 200, pas 404/405) :**

```bash
# GET (lecture)
curl "https://votre-boutique.vercel.app/api/cloudflare/products"
curl "https://votre-boutique.vercel.app/api/cloudflare/categories"
curl "https://votre-boutique.vercel.app/api/cloudflare/farms"
curl "https://votre-boutique.vercel.app/api/cloudflare/settings"

# POST (création) - avec données test
curl -X POST "https://votre-boutique.vercel.app/api/cloudflare/categories" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "icon": "🧪", "color": "#FF0000"}'
```

---

### **5. ✅ Panel Admin accessible**

**Test connexion admin :**

```bash
https://votre-boutique.vercel.app/admin

# 1. Page login s'affiche : "PANEL ADMIN - CALITEK"
# 2. Connexion avec ADMIN_PASSWORD
# 3. Dashboard admin s'affiche avec menus
```

**Test fonctionnalités admin :**
- ✅ **Produits** : Ajouter/modifier/supprimer
- ✅ **Catégories** : Ajouter/modifier/supprimer
- ✅ **Farms** : Ajouter/modifier/supprimer
- ✅ **Configuration** : Sauvegarder (logo, texte défilant)
- ✅ **Upload média** : Images/vidéos vers R2

---

### **6. ✅ Boutique fonctionnelle**

**Test interface boutique :**

```bash
https://votre-boutique.vercel.app/

# Vérifications :
- Logo CALITEK affiché (https://i.imgur.com/s1rsguc.jpeg)
- Produits listés (vides au début, normal)
- Filtres catégories/farms fonctionnels
- Panier accessible
- Pages /info et /contact accessibles
```

---

### **7. ✅ Synchronisation admin ↔ boutique**

**Test synchronisation temps réel :**

1. **Ajoutez une catégorie** dans l'admin
2. **Allez sur la boutique** → Doit apparaître dans les filtres
3. **Ajoutez un produit** dans l'admin
4. **Allez sur la boutique** → Doit apparaître dans la liste
5. **Modifiez la configuration** (logo, texte)
6. **Rechargez la boutique** → Changements visibles

---

## 🚨 **ERREURS FRÉQUENTES ET SOLUTIONS**

### **"Page 404 sur la boutique"**
**Solution :** Videz le cache navigateur (Ctrl+F5)

### **"Admin ne se connecte pas"**
**Solution :** Vérifiez `ADMIN_PASSWORD` dans Vercel

### **"Upload ne marche pas"**
**Solution :** Vérifiez les clés R2 dans Vercel

### **"Données ne s'affichent pas"**
**Solution :** 
1. Testez `/api/debug-all`
2. Relancez `./init-d1-custom.sh` si tables vides

### **"Suppressions ne marchent pas"**
**Solution :** Déjà corrigé dans cette version (mapping id ↔ _id)

---

## 🎯 **SCRIPT DE VÉRIFICATION AUTOMATIQUE**

```bash
#!/bin/bash
# Testez votre nouvelle boutique automatiquement

BOUTIQUE_URL="https://votre-boutique.vercel.app"

echo "🧪 Test de la boutique dupliquée..."

# Test 1 : Page principale
curl -s "$BOUTIQUE_URL/" | grep -q "CALITEK" && echo "✅ Page principale OK" || echo "❌ Page principale KO"

# Test 2 : API debug
curl -s "$BOUTIQUE_URL/api/debug-all" | grep -q '"success":true' && echo "✅ API debug OK" || echo "❌ API debug KO"

# Test 3 : R2
curl -s "$BOUTIQUE_URL/api/test-r2" | grep -q '"success":true' && echo "✅ R2 OK" || echo "❌ R2 KO"

# Test 4 : Admin
curl -s "$BOUTIQUE_URL/admin" | grep -q "CALITEK" && echo "✅ Admin OK" || echo "❌ Admin KO"

echo "🎯 Tests terminés !"
```

---

## 🎉 **RÉSULTAT GARANTI**

Avec ce guide, votre duplication sera **100% fonctionnelle** sans erreurs 500 !

**🚀 Boutique identique à CALITEK en 10 minutes !**