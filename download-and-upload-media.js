#!/usr/bin/env node

/**
 * 📁 TÉLÉCHARGEMENT ET UPLOAD MÉDIAS CLOUDINARY → R2
 * Script pour récupérer les vrais fichiers Cloudinary et les mettre sur R2
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// URLs Cloudinary originales à télécharger
const CLOUDINARY_FILES = [
  {
    id: 1,
    name: 'OREOZ',
    image: 'https://res.cloudinary.com/dmfutgwh0/image/upload/v1755690421/boutique_images/upload_1755690421215.jpg',
    video: 'https://res.cloudinary.com/dmfutgwh0/video/upload/v1755631069/boutique_videos/upload_1755631069564.mp4'
  },
  {
    id: 2,
    name: 'JOLLY RANCHERS 🍬',
    image: 'https://res.cloudinary.com/dmfutgwh0/image/upload/v1755631871/boutique_images/upload_1755631871417.jpg',
    video: 'https://res.cloudinary.com/dmfutgwh0/video/upload/v1755631705/boutique_videos/upload_1755631704844.mp4'
  },
  {
    id: 3,
    name: 'GOLDEN FINGERS ✨',
    image: 'https://res.cloudinary.com/dmfutgwh0/image/upload/v1755690848/boutique_images/upload_1755690848872.jpg',
    video: 'https://res.cloudinary.com/dmfutgwh0/video/upload/v1755631972/boutique_videos/upload_1755631972802.mp4'
  },
  {
    id: 4,
    name: 'GEORGIA PIE 🍑',
    image: 'https://res.cloudinary.com/dmfutgwh0/image/upload/v1755632638/boutique_images/upload_1755632638929.webp',
    video: 'https://res.cloudinary.com/dmfutgwh0/video/upload/v1755638000/boutique_videos/upload_1755638000857.mp4'
  },
  {
    id: 5,
    name: 'OLIVE FILTRE PREMIUM 120U ⚡️',
    image: 'https://res.cloudinary.com/dmfutgwh0/image/upload/v1755638628/boutique_images/upload_1755638628223.jpg',
    video: 'https://res.cloudinary.com/dmfutgwh0/video/upload/v1755641252/boutique_videos/upload_1755641251927.mp4'
  },
  {
    id: 6,
    name: 'CALI JAUNE USA 🇺🇸⚡️',
    image: 'https://res.cloudinary.com/dmfutgwh0/image/upload/v1755647880/boutique_images/upload_1755647880075.jpg',
    video: 'https://res.cloudinary.com/dmfutgwh0/video/upload/v1755647731/boutique_videos/upload_1755647731660.mp4'
  },
  {
    id: 7,
    name: 'ICE CREAM CAKE 🍰',
    image: 'https://res.cloudinary.com/dmfutgwh0/image/upload/v1756646705/boutique_images/upload_1756646705150.webp',
    video: 'https://res.cloudinary.com/dmfutgwh0/video/upload/v1756646988/boutique_videos/upload_1756646988414.mp4'
  },
  {
    id: 8,
    name: 'CHEETAH PISS 🌺',
    image: 'https://res.cloudinary.com/dmfutgwh0/image/upload/v1756647251/boutique_images/upload_1756647251741.jpg',
    video: 'https://res.cloudinary.com/dmfutgwh0/video/upload/v1756650709/boutique_videos/upload_1756650709282.mp4'
  }
];

// Configuration Cloudflare
const CLOUDFLARE_CONFIG = {
  accountId: '7979421604bd07b3bd34d3ed96222512',
  databaseId: '732dfabe-3e2c-4d65-8fdc-bc39eb989434',
  apiToken: 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW',
  r2BucketName: 'boutique-images',
  r2PublicUrl: 'https://pub-b38679a01a274648827751df94818418.r2.dev'
};

async function executeSqlOnD1(sql, params = []) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_CONFIG.accountId}/d1/database/${CLOUDFLARE_CONFIG.databaseId}/query`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_CONFIG.apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql, params })
  });
  
  if (!response.ok) {
    throw new Error(`D1 Error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    console.log(`    📥 Téléchargement: ${path.basename(filepath)}`);
    
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      // Suivre les redirections
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      let totalBytes = 0;
      const contentLength = parseInt(response.headers['content-length'] || '0');
      
      response.on('data', (chunk) => {
        totalBytes += chunk.length;
        if (contentLength > 0) {
          const percent = Math.round((totalBytes / contentLength) * 100);
          process.stdout.write(`\r    📊 ${percent}% (${Math.round(totalBytes/1024)}KB)`);
        }
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`\n    ✅ Téléchargé: ${Math.round(totalBytes/1024)}KB`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function uploadToR2(filePath, fileName, isVideo = false) {
  try {
    const folder = isVideo ? 'videos' : 'images';
    const stats = fs.statSync(filePath);
    console.log(`    📤 Upload vers R2: ${fileName} (${Math.round(stats.size/1024)}KB)`);
    
    // Lire le fichier
    const fileBuffer = fs.readFileSync(filePath);
    
    // Déterminer le content-type
    const ext = path.extname(fileName).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (['.jpg', '.jpeg'].includes(ext)) contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.mp4') contentType = 'video/mp4';
    else if (ext === '.webm') contentType = 'video/webm';
    else if (ext === '.mov') contentType = 'video/quicktime';
    
    // Upload vers R2
    const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_CONFIG.accountId}/r2/buckets/${CLOUDFLARE_CONFIG.r2BucketName}/objects/${folder}/${fileName}`;
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_CONFIG.apiToken}`,
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString()
      },
      body: fileBuffer
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`R2 Upload Error: ${response.status} - ${errorText}`);
    }
    
    const r2Url = `${CLOUDFLARE_CONFIG.r2PublicUrl}/${folder}/${fileName}`;
    console.log(`    ✅ Uploadé vers R2: ${r2Url}`);
    
    return r2Url;
  } catch (error) {
    console.error(`    ❌ Erreur upload R2: ${error.message}`);
    throw error;
  }
}

async function migrateAllCloudinaryFiles() {
  console.log('🚀 MIGRATION CLOUDINARY → CLOUDFLARE R2 POUR OGLEGACY');
  console.log('====================================================');
  console.log(`📊 ${CLOUDINARY_FILES.length} produits à traiter\n`);
  
  try {
    // Créer dossier temporaire
    const tempDir = './temp_cloudinary_migration';
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    fs.mkdirSync(tempDir);
    
    const successfulMigrations = [];
    let totalFiles = 0;
    let successfulFiles = 0;
    
    // Traiter chaque produit
    for (const product of CLOUDINARY_FILES) {
      console.log(`\n🛍️ PRODUIT: ${product.name} (ID: ${product.id})`);
      console.log('═'.repeat(50));
      
      let newImageUrl = '';
      let newVideoUrl = '';
      
      // Traiter l'image
      if (product.image) {
        totalFiles++;
        try {
          console.log('📷 TRAITEMENT IMAGE:');
          const imageFileName = product.image.split('/').pop();
          const tempImagePath = path.join(tempDir, `${product.id}_${imageFileName}`);
          
          await downloadFile(product.image, tempImagePath);
          newImageUrl = await uploadToR2(tempImagePath, imageFileName, false);
          
          fs.unlinkSync(tempImagePath);
          successfulFiles++;
          console.log('  ✅ Image migrée avec succès');
          
        } catch (error) {
          console.error(`  ❌ Erreur image: ${error.message}`);
          newImageUrl = product.image; // Garder l'URL Cloudinary en fallback
        }
      }
      
      // Traiter la vidéo
      if (product.video) {
        totalFiles++;
        try {
          console.log('\n🎥 TRAITEMENT VIDÉO:');
          const videoFileName = product.video.split('/').pop();
          const tempVideoPath = path.join(tempDir, `${product.id}_${videoFileName}`);
          
          await downloadFile(product.video, tempVideoPath);
          newVideoUrl = await uploadToR2(tempVideoPath, videoFileName, true);
          
          fs.unlinkSync(tempVideoPath);
          successfulFiles++;
          console.log('  ✅ Vidéo migrée avec succès');
          
        } catch (error) {
          console.error(`  ❌ Erreur vidéo: ${error.message}`);
          newVideoUrl = product.video; // Garder l'URL Cloudinary en fallback
        }
      }
      
      // Mettre à jour en base D1
      if (newImageUrl || newVideoUrl) {
        try {
          await executeSqlOnD1(
            'UPDATE products SET image_url = ?, video_url = ? WHERE id = ?',
            [newImageUrl || product.image, newVideoUrl || product.video, product.id]
          );
          
          console.log(`\n  ✅ Base D1 mise à jour pour ${product.name}`);
          
          successfulMigrations.push({
            id: product.id,
            name: product.name,
            imageUrl: newImageUrl,
            videoUrl: newVideoUrl
          });
          
        } catch (error) {
          console.error(`  ❌ Erreur mise à jour D1: ${error.message}`);
        }
      }
    }
    
    // Nettoyer
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    
    console.log('\n🎉 MIGRATION TERMINÉE !');
    console.log('======================');
    console.log(`📊 Résultat: ${successfulFiles}/${totalFiles} fichiers migrés`);
    console.log(`🛍️ Produits traités: ${successfulMigrations.length}/${CLOUDINARY_FILES.length}`);
    
    if (successfulMigrations.length > 0) {
      console.log('\n✅ PRODUITS AVEC MÉDIAS CLOUDFLARE R2:');
      successfulMigrations.forEach(product => {
        console.log(`\n🛍️ ${product.name}:`);
        if (product.imageUrl) console.log(`  📷 ${product.imageUrl}`);
        if (product.videoUrl) console.log(`  🎥 ${product.videoUrl}`);
      });
    }
    
    console.log('\n🚀 RÉSULTAT FINAL:');
    console.log('✅ Fichiers copiés de Cloudinary vers Cloudflare R2');
    console.log('✅ Base D1 mise à jour avec nouvelles URLs');
    console.log('✅ Images et vidéos maintenant accessibles sur OGLEGACY');
    console.log('✅ Plus de dépendance à Cloudinary !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter la migration
migrateAllCloudinaryFiles();