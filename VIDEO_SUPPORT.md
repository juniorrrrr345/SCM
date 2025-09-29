# 🎥 Support Vidéo - Boutique Cloudflare

La boutique supporte maintenant **les images ET les vidéos** via Cloudflare R2 !

## 📹 Formats vidéo supportés

- **MP4** (recommandé)
- **WebM** 
- **OGG**
- **AVI**
- **MOV**
- **WMV**

## 📏 Limites d'upload

| Type | Taille maximale |
|------|----------------|
| **Images** | 10 MB |
| **Vidéos** | 500 MB |

## 🎬 Fonctionnalités vidéo

### ✅ Lecteur vidéo intégré
- Contrôles de lecture automatiques
- Support du plein écran
- Lecture/pause avec clic
- Barre de progression
- Contrôle du volume

### ✅ Optimisations
- **Lazy loading** : Vidéos chargées à la demande
- **Prévisualisation** : Première frame comme thumbnail
- **Responsive** : S'adapte à tous les écrans
- **Fallback** : Message d'erreur si échec de chargement

### ✅ Compatibilité
- **Tous navigateurs modernes**
- **Mobile & Desktop**
- **iOS & Android**

## 🔧 Utilisation dans l'admin

1. **Aller dans Admin** > Produits
2. **Ajouter un produit** ou modifier existant
3. **Upload de média** :
   - Glisser-déposer le fichier
   - Ou cliquer "Choisir un fichier"
   - Formats acceptés automatiquement détectés
4. **Prévisualisation** immédiate
5. **Sauvegarder** le produit

## 💡 Bonnes pratiques vidéo

### Optimisation fichiers :
- **MP4 H.264** pour meilleure compatibilité
- **Résolution max** : 1920x1080 (Full HD)
- **Durée recommandée** : 30s - 2min
- **Compression** : Utilisez des outils comme Handbrake

### Performance :
- **Vidéos courtes** pour les produits (< 1min)
- **Qualité web** plutôt que cinéma
- **Format MP4** prioritaire

## 🎯 Cas d'usage

### 🛍️ Présentation produits
- Démonstration d'utilisation
- Unboxing / déballage
- Comparaison avant/après
- Tutoriels d'utilisation

### 📱 Marketing
- Publicités courtes
- Témoignages clients
- Behind-the-scenes
- Événements/salons

## 🔄 Migration vidéos existantes

Si vous avez des vidéos sur Cloudinary/YouTube/Vimeo :

1. **Télécharger** vos vidéos existantes
2. **Optimiser** le format (MP4 recommandé)
3. **Upload via admin** de la boutique
4. **Remplacer** les anciens liens

## 🚀 API Upload vidéo

```javascript
// Upload programmatique
const formData = new FormData();
formData.append('file', videoFile);
formData.append('folder', 'products');

const response = await fetch('/api/cloudflare/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
// result.resource_type === 'video'
// result.url === URL de la vidéo
```

## 🎨 Composant MediaDisplay

Le composant `MediaDisplay` détecte automatiquement :
- **Images** → Affichage statique optimisé
- **Vidéos** → Lecteur vidéo avec contrôles

```tsx
import MediaDisplay from '@/components/MediaDisplay';

<MediaDisplay 
  url="https://r2.../video.mp4"
  controls={true}
  autoPlay={false}
  loop={false}
  muted={true}
/>
```

## 📊 Analytics vidéo

Cloudflare R2 fournit des statistiques :
- Nombre de vues
- Bande passante utilisée
- Géolocalisation des viewers
- Temps de chargement

## 🔒 Sécurité

- **URLs signées** pour contenu privé
- **Hotlinking protection** automatique
- **DDoS protection** Cloudflare
- **SSL/TLS** par défaut

---

**🎉 Votre boutique supporte maintenant les vidéos !**

Créez des expériences produit plus engageantes avec du contenu vidéo de qualité.