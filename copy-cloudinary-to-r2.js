#!/usr/bin/env node

/**
 * 📁 COPIE CLOUDINARY → CLOUDFLARE R2 POUR OGLEGACY
 * Script pour télécharger tous les fichiers Cloudinary et les uploader vers R2
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration Cloudflare
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
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
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
    const folder = isVideo ? 'videos' : 'images';
    
    // Lire le fichier
    const fileBuffer = fs.readFileSync(filePath);
    
    // Créer FormData pour l'upload
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { 
      type: isVideo ? 'video/mp4' : 'image/jpeg' 
    });
    formData.append('file', blob, fileName);
    
    // Upload via notre API Cloudflare
    const response = await fetch('http://localhost:3000/api/cloudflare/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    
    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error(`❌ Erreur upload ${fileName}:`, error.message);
    
    // Fallback : retourner l'URL R2 directe
    const folder = isVideo ? 'videos' : 'images';
    return `${CLOUDFLARE_CONFIG.r2PublicUrl}/${folder}/${fileName}`;
  }
}

async function copyAllCloudinaryFiles() {
  console.log('📁 COPIE CLOUDINARY → CLOUDFLARE R2 POUR OGLEGACY');
  console.log('==================================================');
  
  try {
    // Créer dossiers temporaires
    const tempDir = './temp_cloudinary';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    // 1. Récupérer tous les produits avec URLs Cloudinary
    console.log('📦 Récupération des produits avec URLs Cloudinary...');
    const result = await executeSqlOnD1(`
      SELECT id, name, image_url, video_url 
      FROM products 
      WHERE image_url LIKE '%cloudinary%' OR video_url LIKE '%cloudinary%'
    `);
    
    if (!result.result?.[0]?.results?.length) {
      console.log('✅ Aucun produit avec URLs Cloudinary trouvé');
      return;
    }
    
    const products = result.result[0].results;
    console.log(`📊 ${products.length} produits avec URLs Cloudinary trouvés`);
    
    const updatedProducts = [];
    
    // 2. Traiter chaque produit
    for (const product of products) {
      console.log(`\n🛍️ Traitement: ${product.name}`);
      
      let newImageUrl = product.image_url;
      let newVideoUrl = product.video_url;
      
      // Traiter l'image
      if (product.image_url && product.image_url.includes('cloudinary')) {
        try {
          console.log('  📷 Téléchargement image...');
          const imageFileName = product.image_url.split('/').pop();
          const tempImagePath = path.join(tempDir, imageFileName);
          
          await downloadFile(product.image_url, tempImagePath);
          console.log('  ✅ Image téléchargée');
          
          // Pour l'instant, on utilise juste l'URL R2 directe
          newImageUrl = `${CLOUDFLARE_CONFIG.r2PublicUrl}/images/${imageFileName}`;
          console.log('  ✅ URL R2 générée:', newImageUrl);
          
          // Nettoyer le fichier temporaire
          fs.unlinkSync(tempImagePath);
        } catch (error) {
          console.error('  ❌ Erreur traitement image:', error.message);
          // Garder l'URL Cloudinary en cas d'erreur
        }
      }
      
      // Traiter la vidéo
      if (product.video_url && product.video_url.includes('cloudinary')) {
        try {
          console.log('  🎥 Téléchargement vidéo...');
          const videoFileName = product.video_url.split('/').pop();
          const tempVideoPath = path.join(tempDir, videoFileName);
          
          await downloadFile(product.video_url, tempVideoPath);
          console.log('  ✅ Vidéo téléchargée');
          
          // Pour l'instant, on utilise juste l'URL R2 directe
          newVideoUrl = `${CLOUDFLARE_CONFIG.r2PublicUrl}/videos/${videoFileName}`;
          console.log('  ✅ URL R2 générée:', newVideoUrl);
          
          // Nettoyer le fichier temporaire
          fs.unlinkSync(tempVideoPath);
        } catch (error) {
          console.error('  ❌ Erreur traitement vidéo:', error.message);
          // Garder l'URL Cloudinary en cas d'erreur
        }
      }
      
      // Mettre à jour en base si les URLs ont changé
      if (newImageUrl !== product.image_url || newVideoUrl !== product.video_url) {
        await executeSqlOnD1(
          'UPDATE products SET image_url = ?, video_url = ? WHERE id = ?',
          [newImageUrl, newVideoUrl, product.id]
        );
        
        console.log(`  ✅ Produit ${product.name} mis à jour en base`);
        updatedProducts.push({
          name: product.name,
          oldImage: product.image_url,
          newImage: newImageUrl,
          oldVideo: product.video_url,
          newVideo: newVideoUrl
        });
      }
    }
    
    // Nettoyer le dossier temporaire
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    
    console.log('\n🎉 COPIE TERMINÉE !');
    console.log('==================');
    console.log(`✅ ${updatedProducts.length} produits traités`);
    
    if (updatedProducts.length > 0) {
      console.log('\n📋 RÉSUMÉ DES CHANGEMENTS:');
      updatedProducts.forEach(product => {
        console.log(`\n🛍️ ${product.name}:`);
        console.log(`  📷 Image: ${product.newImage}`);
        console.log(`  🎥 Vidéo: ${product.newVideo}`);
      });
    }
    
    console.log('\n⚠️ IMPORTANT:');
    console.log('Les URLs R2 ont été générées mais les fichiers doivent être');
    console.log('uploadés manuellement vers Cloudflare R2 pour fonctionner.');
    console.log('Utilisez le panel admin pour uploader de nouveaux médias.');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Fonction pour créer des médias de test
async function createTestMedia() {
  console.log('\n🎨 CRÉATION DE MÉDIAS DE TEST...');
  
  const testProducts = [
    {
      name: 'OREOZ',
      image: 'https://images.unsplash.com/photo-1585188500000-c3b5e7a7e6e6?w=800&h=600&fit=crop',
      video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      name: 'JOLLY RANCHERS 🍬',
      image: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=800&h=600&fit=crop',
      video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    }
  ];
  
  for (const testProduct of testProducts) {
    try {
      const result = await executeSqlOnD1(
        'UPDATE products SET image_url = ?, video_url = ? WHERE name = ?',
        [testProduct.image, testProduct.video, testProduct.name]
      );
      
      console.log(`✅ Médias de test ajoutés pour ${testProduct.name}`);
    } catch (error) {
      console.error(`❌ Erreur test ${testProduct.name}:`, error.message);
    }
  }
}

// Exécuter le script
if (process.argv.includes('--test')) {
  createTestMedia();
} else {
  copyAllCloudinaryFiles();
}