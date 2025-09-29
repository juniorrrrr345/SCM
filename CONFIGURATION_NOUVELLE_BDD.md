# Configuration Nouvelle Base de Données - SCM

## 🎯 Étapes de Configuration

### 1. Cloudflare D1 - Nouvelle Base de Données

Créer une nouvelle base de données D1 pour SCM :

```bash
# Créer la base de données
npx wrangler d1 create SCM

# Noter les informations retournées :
# - database_name: SCM
# - database_id: [NOUVEAU_UUID]
# - account_id: [VOTRE_ACCOUNT_ID]
```

### 2. Cloudflare R2 - Nouveau Bucket

Créer un nouveau bucket R2 pour les médias :

```bash
# Créer le bucket
npx wrangler r2 bucket create scm-images

# Configuration du domaine personnalisé
# - Bucket: scm-images
# - URL publique: [À CONFIGURER]
```

### 3. Variables d'Environnement

Créer un fichier `.env.local` avec les nouvelles configurations :

```env
# Cloudflare D1
CLOUDFLARE_ACCOUNT_ID=[VOTRE_ACCOUNT_ID]
CLOUDFLARE_DATABASE_ID=[NOUVEAU_UUID_D1]
CLOUDFLARE_API_TOKEN=[VOTRE_API_TOKEN]

# Cloudflare R2
CLOUDFLARE_R2_ACCOUNT_ID=[VOTRE_ACCOUNT_ID]
CLOUDFLARE_R2_ACCESS_KEY_ID=[R2_ACCESS_KEY]
CLOUDFLARE_R2_SECRET_ACCESS_KEY=[R2_SECRET_KEY]
CLOUDFLARE_R2_BUCKET_NAME=scm-images
CLOUDFLARE_R2_PUBLIC_URL=[URL_PUBLIQUE_R2]

# Admin
ADMIN_PASSWORD=[NOUVEAU_MOT_DE_PASSE]

# Next.js
NEXT_PUBLIC_BASE_URL=https://scm.votre-domaine.com
```

### 4. Initialisation Base de Données

```bash
# Initialiser les tables
npm run init-db

# Ou manuellement :
npx wrangler d1 execute SCM --file=./database/schema.sql
```

### 5. Migration des Données (Optionnel)

Si vous souhaitez migrer des données depuis l'ancienne boutique :

```bash
# Utiliser les scripts de migration fournis
node migrate-data-to-scm.js
```

### 6. Vercel Deployment

Configurer les variables d'environnement sur Vercel :

1. Aller sur votre dashboard Vercel
2. Sélectionner le projet SCM
3. Aller dans Settings > Environment Variables
4. Ajouter toutes les variables du fichier `.env.local`

### 7. Test de Fonctionnement

```bash
# Développement local
npm install
npm run dev

# Test des APIs
curl http://localhost:3000/api/cloudflare/products
curl http://localhost:3000/api/cloudflare/categories
```

## ✅ Checklist Post-Configuration

- [ ] Base de données D1 créée
- [ ] Bucket R2 créé et configuré
- [ ] Variables d'environnement configurées
- [ ] Tables initialisées
- [ ] Admin panel accessible
- [ ] Upload d'images fonctionnel
- [ ] Déployement Vercel réussi

## 🔗 Liens Utiles

- [Documentation Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Documentation Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

---

**Note**: Remplacez toutes les valeurs entre crochets `[...]` par vos valeurs réelles.