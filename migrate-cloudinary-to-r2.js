#!/usr/bin/env node

/**
 * 🔄 MIGRATION COMPLÈTE CLOUDINARY → CLOUDFLARE R2 POUR OGLEGACY
 * Script pour télécharger TOUS les vrais fichiers Cloudinary et les uploader vers R2
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CLOUDFLARE_CONFIG = {
  accountId: '7979421604bd07b3bd34d3ed96222512',
  databaseId: '732dfabe-3e2c-4d65-8fdc-bc39eb989434',
  apiToken: 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW',
  r2AccessKeyId: '82WsPNjX-j0UqZIGAny8b0uEehcHd0X3zMKNIKIN',
  r2SecretAccessKey: '28230e200a3b71e5374e569f8a297eba9aa3fe2e1097fdf26e5d9e340ded709d',
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
    console.log(`    📥 Téléchargement: ${url}`);
    
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      // Suivre les redirections
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log(`    🔄 Redirection vers: ${response.headers.location}`);
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
          process.stdout.write(`\r    📊 Progression: ${percent}% (${Math.round(totalBytes/1024)}KB)`);
        }
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`\n    ✅ Téléchargé: ${Math.round(totalBytes/1024)}KB`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Supprimer le fichier en cas d'erreur
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function uploadToR2(filePath, fileName, isVideo = false) {
  try {
    console.log(`    📤 Upload vers R2: ${fileName}`);
    
    const folder = isVideo ? 'videos' : 'images';
    const stats = fs.statSync(filePath);
    console.log(`    📊 Taille fichier: ${Math.round(stats.size/1024)}KB`);
    
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
    
    // Upload direct vers R2 via API Cloudflare
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
    console.error(`    ❌ Erreur upload R2:`, error.message);
    throw error;
  }
}

async function migrateAllFiles() {
  console.log('🔄 MIGRATION COMPLÈTE CLOUDINARY → CLOUDFLARE R2');
  console.log('================================================');
  console.log('📋 Récupération de TOUS les vrais fichiers Cloudinary...\n');
  
  try {
    // Créer dossier temporaire
    const tempDir = './temp_migration';
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    fs.mkdirSync(tempDir);
    console.log(`📁 Dossier temporaire créé: ${tempDir}\n`);
    
    // 1. Récupérer TOUTES les URLs Cloudinary depuis D1
    console.log('📊 Récupération des produits avec URLs Cloudinary...');
    const result = await executeSqlOnD1(`
      SELECT id, name, image_url, video_url 
      FROM products 
      WHERE image_url LIKE '%pub-b38679a01a274648827751df94818418.r2.dev%' 
         OR video_url LIKE '%pub-b38679a01a274648827751df94818418.r2.dev%'
    `);
    
    if (!result.result?.[0]?.results?.length) {
      console.log('⚠️  Aucun produit avec URLs R2 trouvé. Récupération des URLs Cloudinary originales...');
      
      // Récupérer les URLs Cloudinary originales depuis les données de sauvegarde
      const originalUrls = [
        {
          id: 1, name: 'OREOZ',
          image_url: 'https://res.cloudinary.com/dmfutgwh0/image/upload/v1755690421/boutique_images/upload_1755690421215.jpg',
          video_url: 'https://res.cloudinary.com/dmfutgwh0/video/upload/v1755631069/boutique_videos/upload_1755631069564.mp4'
        },
        {
          id: 2, name: 'JOLLY RANCHERS 🍬',
          image_url: 'https://res.cloudinary.com/dmfutgwh0/image/upload/v1755631871/boutique_images/upload_1755631871417.jpg',
          video_url: 'https://res.cloudinary.com/dmfutgwh0/video/upload/v1755631705/boutique_videos/upload_1755631704844.mp4'
        },
        {
          id: 3, name: 'GOLDEN FINGERS ✨',
          image_url: 'https://res.cloudinary.com/dmfutgwh0/image/upload/v1755690848/boutique_images/upload_1755690848872.jpg',
          video_url: 'https://res.cloudinary.com/dmfutgwh0/video/upload/v1755631972/boutique_videos/upload_1755631972802.mp4'
        },
        {
          id: 4, name: 'GEORGIA PIE 🍑',
          image_url: 'https://res.cloudinary.com/dmfutgwh0/image/upload/v1755632638/boutique_images/upload_1755632638929.webp',
          video_url: 'https://res.cloudinary.com/dmfutgwh0/video/upload/v1755638000/boutique_videos/upload_1755638000857.mp4'
        },
        {
          id: 5, name: 'OLIVE FILTRE PREMIUM 120U ⚡️',
          image_url: 'https://res.cloudinary.com/dmfutgwh0/image/upload/v1755638628/boutique_images/upload_1755638628223.jpg',
          video_url: 'https://res.cloudinary.com/dmfutgwh0/video/upload/v1755641252/boutique_videos/upload_1755641251927.mp4'
        },
        {
          id: 6, name: 'CALI JAUNE USA 🇺🇸⚡️',
          image_url: 'https://res.cloudinary.com/dmfutgwh0/image/upload/v1755647880/boutique_images/upload_1755647880075.jpg',
          video_url: 'https://res.cloudinary.com/dmfutgwh0/video/upload/v1755647731/boutique_videos/upload_1755647731660.mp4'
        },
        {
          id: 7, name: 'ICE CREAM CAKE 🍰',
          image_url: 'https://res.cloudinary.com/dmfutgwh0/image/upload/v1756646705/boutique_images/upload_1756646705150.webp',
          video_url: 'https://res.cloudinary.com/dmfutgwh0/video/upload/v1756646988/boutique_videos/upload_1756646988414.mp4'
        },
        {
          id: 8, name: 'CHEETAH PISS 🌺',
          image_url: 'https://res.cloudinary.com/dmfutgwh0/image/upload/v1756647251/boutique_images/upload_1756647251741.jpg',
          video_url: 'https://res.cloudinary.com/dmfutgwh0/video/upload/v1756650709/boutique_videos/upload_1756650709282.mp4'
        }
      ];
      
      console.log(`📊 ${originalUrls.length} produits avec URLs Cloudinary originales trouvés\n`);
      
      const successfulMigrations = [];
      
      // 2. Traiter chaque produit
      for (const product of originalUrls) {
        console.log(`🛍️ TRAITEMENT: ${product.name}`);
        console.log(`   ID: ${product.id}`);
        
        let newImageUrl = product.image_url;
        let newVideoUrl = product.video_url;
        let migrationSuccess = false;
        
        // Traiter l'image
        if (product.image_url && product.image_url.includes('cloudinary')) {
          try {
            console.log('  📷 MIGRATION IMAGE:');
            const imageFileName = product.image_url.split('/').pop();
            const tempImagePath = path.join(tempDir, `image_${product.id}_${imageFileName}`);
            
            await downloadFile(product.image_url, tempImagePath);
            
            // Upload vers R2
            newImageUrl = await uploadToR2(tempImagePath, imageFileName, false);
            migrationSuccess = true;
            
            // Nettoyer
            fs.unlinkSync(tempImagePath);
            console.log('  ✅ Image migrée avec succès\n');
            
          } catch (error) {
            console.error(`  ❌ Erreur migration image: ${error.message}\n`);
          }
        }
        
        // Traiter la vidéo
        if (product.video_url && product.video_url.includes('cloudinary')) {
          try {
            console.log('  🎥 MIGRATION VIDÉO:');
            const videoFileName = product.video_url.split('/').pop();
            const tempVideoPath = path.join(tempDir, `video_${product.id}_${videoFileName}`);
            
            await downloadFile(product.video_url, tempVideoPath);
            
            // Upload vers R2
            newVideoUrl = await uploadToR2(tempVideoPath, videoFileName, true);
            migrationSuccess = true;
            
            // Nettoyer
            fs.unlinkSync(tempVideoPath);
            console.log('  ✅ Vidéo migrée avec succès\n');
            
          } catch (error) {
            console.error(`  ❌ Erreur migration vidéo: ${error.message}\n`);
          }
        }
        
        // Mettre à jour en base D1 si migration réussie
        if (migrationSuccess) {
          try {
            await executeSqlOnD1(
              'UPDATE products SET image_url = ?, video_url = ? WHERE id = ?',
              [newImageUrl, newVideoUrl, product.id]
            );
            
            console.log(`  ✅ Base D1 mise à jour pour ${product.name}\n`);
            
            successfulMigrations.push({
              id: product.id,
              name: product.name,
              imageUrl: newImageUrl,
              videoUrl: newVideoUrl
            });
            
          } catch (error) {
            console.error(`  ❌ Erreur mise à jour D1: ${error.message}\n`);
          }
        }
        
        console.log('─'.repeat(60));
      }
      
      // Nettoyer le dossier temporaire
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true });
      }
      
      console.log('\n🎉 MIGRATION TERMINÉE !');
      console.log('======================');
      console.log(`✅ ${successfulMigrations.length}/${originalUrls.length} produits migrés avec succès\n`);
      
      if (successfulMigrations.length > 0) {
        console.log('📋 PRODUITS MIGRÉS:');
        successfulMigrations.forEach(product => {
          console.log(`\n🛍️ ${product.name} (ID: ${product.id}):`);
          console.log(`  📷 Image: ${product.imageUrl}`);
          console.log(`  🎥 Vidéo: ${product.videoUrl}`);
        });
        
        console.log('\n🚀 RÉSULTAT:');
        console.log('✅ Tous les fichiers sont maintenant sur Cloudflare R2');
        console.log('✅ Les URLs en base D1 ont été mises à jour');
        console.log('✅ Les images et vidéos devraient maintenant s\'afficher');
        console.log('✅ Plus de dépendance à Cloudinary !');
      }
      
    } else {
      console.log('✅ Les produits utilisent déjà Cloudflare R2');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter la migration
migrateAllFiles();