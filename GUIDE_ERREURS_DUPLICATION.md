# 🚨 Guide des Erreurs de Duplication - Solutions Complètes

## ❌ **ERREURS 500 COURANTES ET SOLUTIONS**

### **1. Erreur 500 : "no such table: categories"**

**🔍 Cause :** La nouvelle base D1 n'a pas les tables créées

**✅ Solution :**
```bash
# OBLIGATOIRE après création de la base D1
cd votre-nouvelle-boutique
chmod +x init-d1-custom.sh
./init-d1-custom.sh
```

**🧪 Vérification :**
```bash
curl "https://votre-nouvelle-boutique.vercel.app/api/debug-all"
# Doit retourner : "categories": {"status": "fulfilled", "count": 0}
```

---

### **2. Erreur 500 : "NOT NULL constraint failed: products.price"**

**🔍 Cause :** Tentative d'insertion de prix null/undefined

**✅ Solution :** Déjà corrigée dans cette version
```typescript
// Dans src/app/api/cloudflare/products/route.ts
const validPrice = isNaN(finalPrice) ? 0 : finalPrice; // Jamais null
```

---

### **3. Erreur 500 : "Object.entries requires that input parameter not be null"**

**🔍 Cause :** Données null passées aux fonctions D1

**✅ Solution :** Déjà corrigée dans cette version
```typescript
// Dans src/lib/cloudflare-d1.ts
if (!data || typeof data !== 'object') {
  throw new Error('Data must be a valid object');
}
```

---

### **4. Erreur 405 : "Method Not Allowed"**

**🔍 Cause :** Routes API manquantes ou méthodes non supportées

**✅ Solution :** Vérifiez que TOUS ces fichiers existent :
```
src/app/api/cloudflare/
├── products/
│   ├── route.ts (GET, POST)
│   └── [id]/route.ts (GET, PUT, DELETE)
├── categories/
│   ├── route.ts (GET, POST)
│   └── [id]/route.ts (GET, PUT, DELETE)
├── farms/
│   ├── route.ts (GET, POST)
│   └── [id]/route.ts (GET, PUT, DELETE)
├── social-links/
│   ├── route.ts (GET, POST)
│   ├── [id]/route.ts (GET, PUT, DELETE)
│   └── active/route.ts (GET)
├── pages/
│   ├── route.ts (GET, POST)
│   └── [slug]/route.ts (GET, PUT, DELETE)
├── settings/
│   └── route.ts (GET, POST, PUT)
└── upload/
    └── route.ts (POST, DELETE)
```

---

### **5. Erreur 401 : "Authentication Required"**

**🔍 Cause :** Protection Vercel activée

**✅ Solution :**
1. **Vercel Dashboard** → **Settings** → **Deployment Protection**
2. **Désactivez** toute protection
3. **OU** ajoutez dans `vercel.json` :
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "X-Vercel-Protection-Bypass",
          "value": "true"
        }
      ]
    }
  ]
}
```

---

### **6. Erreur : "Can't resolve '@/lib/...' "**

**🔍 Cause :** Imports TypeScript non résolus

**✅ Solution :** Vérifiez `next.config.js` :
```javascript
const path = require('path')

const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    }
    return config
  }
}
```

**ET** `tsconfig.json` :
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### **7. Erreur : "Module not found: Can't resolve 'tailwindcss'"**

**🔍 Cause :** Tailwind CSS en devDependencies au lieu de dependencies

**✅ Solution :** `package.json` correct :
```json
{
  "dependencies": {
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "typescript": "^5",
    "@types/node": "^20"
  }
}
```

---

## 🔧 **VARIABLES D'ENVIRONNEMENT OBLIGATOIRES**

### **❌ Erreur si manquantes :**
```bash
# CES VARIABLES SONT OBLIGATOIRES :
CLOUDFLARE_ACCOUNT_ID=7979421604bd07b3bd34d3ed96222512
CLOUDFLARE_DATABASE_ID=VOTRE_NOUVEAU_DATABASE_ID  # ⚠️ DIFFÉRENT pour chaque boutique
CLOUDFLARE_API_TOKEN=ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW

# CES VARIABLES SONT PARTAGÉES :
CLOUDFLARE_R2_ACCESS_KEY_ID=82WsPNjX-j0UqZIGAny8b0uEehcHd0X3zMKNIKIN
CLOUDFLARE_R2_SECRET_ACCESS_KEY=28230e200a3b71e5374e569f8a297eba9aa3fe2e1097fdf26e5d9e340ded709d
CLOUDFLARE_R2_BUCKET_NAME=boutique-images
CLOUDFLARE_R2_PUBLIC_URL=https://pub-b38679a01a274648827751df94818418.r2.dev

# CETTE VARIABLE EST PERSONNALISÉE :
ADMIN_PASSWORD=votre_mot_de_passe_unique_par_boutique
```

---

## 🧪 **CHECKLIST DE VÉRIFICATION POST-DUPLICATION**

### **1. Test des routes API :**
```bash
# Testez TOUTES ces URLs après déploiement :
https://votre-boutique.vercel.app/api/debug-all          # État complet
https://votre-boutique.vercel.app/api/test-r2            # Test R2
https://votre-boutique.vercel.app/api/cloudflare/products # Produits
https://votre-boutique.vercel.app/api/cloudflare/categories # Catégories
https://votre-boutique.vercel.app/api/cloudflare/settings # Settings
```

### **2. Test panel admin :**
```bash
https://votre-boutique.vercel.app/admin
# Login avec votre ADMIN_PASSWORD
# Testez : Ajouter catégorie, farm, produit
```

### **3. Test boutique :**
```bash
https://votre-boutique.vercel.app/
# Vérifiez : Logo, produits, filtres, panier
```

---

## 🔄 **PROBLÈMES DE SYNCHRONISATION**

### **❌ "Les données ne s'affichent pas"**

**🔍 Causes possibles :**
1. Base D1 vide (pas initialisée)
2. Variables d'environnement incorrectes
3. Cache navigateur

**✅ Solutions :**
```bash
# 1. Vérifier la base
curl "https://votre-boutique.vercel.app/api/debug-all"

# 2. Vider le cache navigateur
Ctrl+F5 ou Cmd+Shift+R

# 3. Forcer rechargement
curl "https://votre-boutique.vercel.app/api/clear-all-cache" -X POST
```

---

## 🗄️ **PROBLÈMES DE BASE DE DONNÉES**

### **❌ "D1 Query failed: Bad Request"**

**🔍 Causes :**
1. DATABASE_ID incorrect
2. API Token invalide
3. Tables non créées

**✅ Solutions :**
```bash
# 1. Vérifier DATABASE_ID
echo $CLOUDFLARE_DATABASE_ID

# 2. Tester API Token
curl "https://api.cloudflare.com/client/v4/accounts/7979421604bd07b3bd34d3ed96222512/tokens/verify" \
  -H "Authorization: Bearer ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW"

# 3. Recréer les tables
./init-d1-custom.sh
```

---

## 📦 **PROBLÈMES DE BUILD VERCEL**

### **❌ "Build failed because of webpack errors"**

**🔍 Solutions par ordre de priorité :**

**1. Vérifier package.json :**
```json
{
  "dependencies": {
    "next": "14.2.30",
    "tailwindcss": "^3.4.0",
    "typescript": "^5",
    "@types/node": "^20"
  }
}
```

**2. Vérifier next.config.js :**
```javascript
const path = require('path')
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    }
    return config
  }
}
module.exports = nextConfig
```

**3. Framework Vercel :**
- **Framework Preset** : Next.js
- **Build Command** : `npm run build`
- **Output Directory** : `.next`

---

## 🎯 **PROCÉDURE DE DUPLICATION SANS ERREURS**

### **Étape 1 : Préparer**
```bash
git clone https://github.com/juniorrrrr345/ok.git
cd ok
```

### **Étape 2 : Dupliquer**
```bash
./SCRIPT_DUPLICATION_AUTOMATIQUE.sh ma-boutique-2
# ✅ Crée base D1 + configure tout automatiquement
```

### **Étape 3 : Vérifier localement**
```bash
cd ../ma-boutique-2
npm install
npm run build
# ✅ Doit builder sans erreurs
```

### **Étape 4 : Déployer**
```bash
# Créer repo GitHub + pousser
git remote add origin https://github.com/username/ma-boutique-2.git
git push -u origin main

# Vercel : Import + Variables + Deploy
```

### **Étape 5 : Tester**
```bash
# Tester TOUTES ces URLs :
https://ma-boutique-2.vercel.app/api/debug-all
https://ma-boutique-2.vercel.app/admin
https://ma-boutique-2.vercel.app/
```

---

## 🆘 **DÉPANNAGE RAPIDE**

### **Si erreur 500 :**
1. **Vérifiez** `/api/debug-all`
2. **Relancez** `./init-d1-custom.sh`
3. **Vérifiez** variables Vercel

### **Si données vides :**
1. **Importez** vos données MongoDB avec le script fourni
2. **Ou ajoutez** manuellement via panel admin

### **Si suppressions ne marchent pas :**
1. **Vérifiez** mapping id ↔ _id (déjà corrigé)
2. **Videz** cache navigateur (Ctrl+F5)

---

## 🎉 **RÉSULTAT GARANTI**

Avec ce guide, vous obtiendrez :
- ✅ **Boutique identique** à CALITEK
- ✅ **Aucune erreur** 500/405/401
- ✅ **Performance optimale** Cloudflare
- ✅ **Interface épurée** sans bugs
- ✅ **Synchronisation parfaite** admin ↔ boutique

**🚀 Duplication maintenant fiable à 100% !**