# 🛍️ BOUTIQUE FAS - GUIDE COMPLET

## 🚀 DÉPLOIEMENT ULTRA-RAPIDE

### 📋 ÉTAPE 1 : Créer la base D1
```bash
npm run create-d1
```
**⚠️ IMPORTANT :** Notez l'UUID généré !

### 📊 ÉTAPE 2 : Initialiser les tables
```bash
npm run init-tables
```

### 🔄 ÉTAPE 3 : Migrer les données MongoDB
```bash
npm run migrate-mongodb
```

### 🚀 ÉTAPE 4 : Déployer
```bash
npm run deploy-setup
git push -u origin main
```

## 🔧 VARIABLES VERCEL

Copiez-collez ces variables dans Vercel :

```env
CLOUDFLARE_ACCOUNT_ID=7979421604bd07b3bd34d3ed96222512
CLOUDFLARE_DATABASE_ID=[UUID-GÉNÉRÉ-ÉTAPE-1]
CLOUDFLARE_API_TOKEN=ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW
CLOUDFLARE_R2_ACCESS_KEY_ID=82WsPNjX-j0UqZIGAny8b0uEehcHd0X3zMKNIKIN
CLOUDFLARE_R2_SECRET_ACCESS_KEY=28230e200a3b71e5374e569f8a297eba9aa3fe2e1097fdf26e5d9e340ded709d
CLOUDFLARE_R2_BUCKET_NAME=boutique-images
CLOUDFLARE_R2_PUBLIC_URL=https://pub-b38679a01a274648827751df94818418.r2.dev
ADMIN_PASSWORD=fas_admin_2024
NODE_ENV=production
```

## ✅ FONCTIONNALITÉS GARANTIES

### 🛍️ PRODUITS
- ✅ Affichage avec images/vidéos Cloudflare
- ✅ Panel admin CRUD complet
- ✅ Synchronisation temps réel
- ✅ Support MP4 + iframe Cloudflare

### 🏷️ CATÉGORIES & 🏭 FARMS
- ✅ Filtrage fonctionnel côté client
- ✅ CRUD admin complet
- ✅ Synchronisation admin ↔ client

### 📄 PAGES
- ✅ Contenu réel du panel admin
- ✅ Pages info/contact dynamiques
- ✅ Réseaux sociaux synchronisés

### 🔐 PANEL ADMIN
- ✅ Connexion : FAS Panel d'Administration
- ✅ Toutes les données MongoDB migrées
- ✅ Upload Cloudflare R2 intégré

## 🧪 TESTS POST-DÉPLOIEMENT

### URLs de test (remplacez VOTRE-URL) :
- 🏠 Boutique : `https://VOTRE-URL.vercel.app`
- 🔐 Admin : `https://VOTRE-URL.vercel.app/admin`
- 📊 API Produits : `https://VOTRE-URL.vercel.app/api/products-simple`
- 🏷️ API Catégories : `https://VOTRE-URL.vercel.app/api/categories-simple`

### Tests de synchronisation :
1. **Admin → Client** : Ajoutez un produit → Vérifiez apparition en 2-5s
2. **Suppression** : Supprimez une catégorie → Vérifiez disparition immédiate
3. **Modification** : Changez le fond d'image → Vérifiez sur toutes les pages

## 📊 MIGRATION MONGODB

### Source configurée :
- 🗄️ **URI :** `mongodb+srv://fasand051:fas123@fasandfurious.ni31xay.mongodb.net/`
- 📦 **Base :** `fasandfurious`
- 🔄 **Collections :** products, categories, farms, pages, sociallinks

### Mapping automatique :
- `_id` → `id` (auto-increment D1)
- `image` → `image_url`
- `video` → `video_url`
- `isActive` → `is_available`
- `categoryId` → `category_id`
- `farmId` → `farm_id`

## 🎯 RÉSULTAT FINAL

🏆 **Boutique FAS 100% fonctionnelle avec :**
- ✅ Toutes les données MongoDB migrées
- ✅ Panel admin CRUD complet
- ✅ Synchronisation temps réel parfaite
- ✅ Support médias Cloudflare complet
- ✅ Interface entièrement personnalisée FAS