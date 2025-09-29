# Configuration Cloudflare pour la Boutique

Cette boutique utilise **Cloudflare D1** (base de données) et **Cloudflare R2** (stockage d'images) au lieu de MongoDB et Cloudinary.

## 🔧 Variables d'environnement Vercel

### **Variables Cloudflare obligatoires :**

```bash
CLOUDFLARE_ACCOUNT_ID=7979421604bd07b3bd34d3ed96222512
CLOUDFLARE_DATABASE_ID=854d0539-5e04-4e2a-a4fd-b0cfa98c7598
CLOUDFLARE_API_TOKEN=ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=boutique-images
ADMIN_PASSWORD=your_secure_admin_password
```

### **Variables optionnelles :**
```bash
CLOUDFLARE_R2_PUBLIC_URL=https://pub-b38679a01a274648827751df94818418.r2.dev
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NODE_ENV=production
```

## 🗄️ Base de données D1

La base de données **boutique-db** est déjà créée avec l'ID : `854d0539-5e04-4e2a-a4fd-b0cfa98c7598`

### Tables créées :
- ✅ **settings** - Paramètres de la boutique
- ✅ **categories** - Catégories de produits  
- ✅ **farms** - Fermes/fournisseurs
- ✅ **products** - Produits de la boutique
- ✅ **pages** - Pages personnalisées
- ✅ **social_links** - Liens réseaux sociaux
- ✅ **orders** - Commandes (optionnel)

### Initialiser la base de données :

```bash
# Exécuter le schéma SQL
curl -X POST "https://api.cloudflare.com/client/v4/accounts/7979421604bd07b3bd34d3ed96222512/d1/database/854d0539-5e04-4e2a-a4fd-b0cfa98c7598/query" \
  -H "Authorization: Bearer ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW" \
  -H "Content-Type: application/json" \
  -d @database/schema.sql
```

## 📦 Stockage R2 (Images + Vidéos)

### Créer un bucket R2 :

```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/7979421604bd07b3bd34d3ed96222512/r2/buckets" \
  -H "Authorization: Bearer ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW" \
  -H "Content-Type: application/json" \
  -d '{"name": "boutique-images"}'
```

### Formats supportés :

**Images :** JPG, PNG, GIF, WebP (max 10MB)
**Vidéos :** MP4, WebM, OGG, AVI, MOV, WMV (max 500MB)

### Configuration des clés R2 :

1. Allez dans **Cloudflare Dashboard** > **R2**
2. Créez des **clés d'accès R2** 
3. Notez l'**Access Key ID** et la **Secret Access Key**

## 🚀 Routes API Cloudflare

Les nouvelles routes API sont disponibles :

- `GET/POST /api/cloudflare/products` - Gestion des produits
- `GET/PUT /api/cloudflare/settings` - Paramètres de la boutique  
- `POST/DELETE /api/cloudflare/upload` - Upload d'images ET vidéos vers R2

## 📋 Migration depuis MongoDB

Si vous migrez depuis MongoDB, voici le mapping :

| MongoDB | Cloudflare D1 |
|---------|---------------|
| `mongoose.connect()` | `d1Client.query()` |
| `Product.find()` | `d1Client.findMany('products')` |
| `Settings.findOne()` | `d1Client.getSettings()` |
| `new Product().save()` | `d1Client.create('products', data)` |

## 🔄 Migration depuis Cloudinary

| Cloudinary | Cloudflare R2 |
|------------|---------------|
| `cloudinary.uploader.upload()` | `r2Client.uploadImage()` / `r2Client.uploadVideo()` |
| `cloudinary.uploader.destroy()` | `r2Client.deleteFile()` |
| `cloudinary.url()` | `r2Client.getPublicUrl()` |
| Images seulement | **Images + Vidéos supportées** |

## ⚡ Avantages Cloudflare

- **🚀 Plus rapide** : Edge computing global
- **💰 Moins cher** : D1 gratuit jusqu'à 100k requêtes/jour
- **🔒 Plus sécurisé** : Infrastructure Cloudflare
- **🌍 CDN intégré** : Images servies depuis le edge
- **📈 Scalable** : Mise à l'échelle automatique

## 🛠️ Commandes utiles

### Vérifier la base D1 :
```bash
curl "https://api.cloudflare.com/client/v4/accounts/7979421604bd07b3bd34d3ed96222512/d1/database/854d0539-5e04-4e2a-a4fd-b0cfa98c7598" \
  -H "Authorization: Bearer ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW"
```

### Lister les buckets R2 :
```bash
curl "https://api.cloudflare.com/client/v4/accounts/7979421604bd07b3bd34d3ed96222512/r2/buckets" \
  -H "Authorization: Bearer ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW"
```

## 🎯 Prochaines étapes

1. **Configurez les variables** sur Vercel
2. **Créez le bucket R2** et les clés d'accès
3. **Testez l'upload** d'images 
4. **Migrez vos données** existantes si nécessaire

La boutique est maintenant prête avec Cloudflare ! 🎉