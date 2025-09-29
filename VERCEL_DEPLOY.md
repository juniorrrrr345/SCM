# 🚀 Guide de déploiement Vercel

## 📋 Checklist avant déploiement

### ✅ Repository GitHub
- [x] Code poussé sur https://github.com/juniorrrrr345/ok.git
- [x] Branche `main` à jour
- [x] Fichiers Next.js configurés

### ✅ Cloudflare D1 (Base de données)
- [x] Base de données créée : `boutique-db`
- [x] ID : `854d0539-5e04-4e2a-a4fd-b0cfa98c7598`
- [x] Tables créées avec schema.sql

### ✅ Cloudflare R2 (Stockage)
- [x] Bucket créé : `boutique-images`
- [x] URL publique : `https://pub-b38679a01a274648827751df94818418.r2.dev`
- [ ] Clés d'accès R2 à créer

## 🔑 Créer les clés R2

1. **Cloudflare Dashboard** → **R2** → **"Manage R2 API tokens"**
2. **"Create API token"** → **"Custom token"**
3. **Permissions** : `R2:Read` + `R2:Edit`
4. **Récupérer** : Access Key ID + Secret Access Key

## ⚙️ Variables d'environnement Vercel

```bash
# Cloudflare Core (PRÊT)
CLOUDFLARE_ACCOUNT_ID=7979421604bd07b3bd34d3ed96222512
CLOUDFLARE_DATABASE_ID=854d0539-5e04-4e2a-a4fd-b0cfa98c7598
CLOUDFLARE_API_TOKEN=ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW

# Cloudflare R2 (À AJOUTER)
CLOUDFLARE_R2_ACCESS_KEY_ID=82WsPNjX-j0UqZIGAny8b0uEehcHd0X3zMKNIKIN
CLOUDFLARE_R2_SECRET_ACCESS_KEY=28230e200a3b71e5374e569f8a297eba9aa3fe2e1097fdf26e5d9e340ded709d
CLOUDFLARE_R2_BUCKET_NAME=boutique-images
CLOUDFLARE_R2_PUBLIC_URL=https://pub-b38679a01a274648827751df94818418.r2.dev

# Application (CONFIGURER)
ADMIN_PASSWORD=votre_mot_de_passe_securise
NEXT_PUBLIC_SITE_URL=https://votre-domaine.vercel.app
NODE_ENV=production
```

## 🎯 Étapes de déploiement

1. **Connecter GitHub** à Vercel
2. **Sélectionner** le repository `https://github.com/juniorrrrr345/ok.git`
3. **Framework** : Next.js (détection automatique)
4. **Build Command** : `npm run build` (par défaut)
5. **Output Directory** : `.next` (par défaut)
6. **Ajouter** toutes les variables d'environnement
7. **Deploy** !

## 🧪 Tests après déploiement

- [ ] **Page d'accueil** : Affichage boutique
- [ ] **Admin** : `/admin` - Connexion avec mot de passe
- [ ] **Upload** : Test image/vidéo dans admin
- [ ] **API** : `/api/test-r2` - Vérification R2
- [ ] **Base de données** : Produits/catégories

## 🔧 Dépannage

### Build Error "No Output Directory"
- Vérifier que `next build` génère un dossier `.next`
- Vérifier `next.config.js` et `package.json`

### R2 Upload Error
- Vérifier les clés d'accès R2
- Tester `/api/test-r2`

### Database Error
- Vérifier `CLOUDFLARE_DATABASE_ID`
- Tester les requêtes D1

---

**🎉 Votre boutique sera déployée sur Vercel avec Cloudflare !**