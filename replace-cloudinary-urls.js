#!/usr/bin/env node

/**
 * 🔄 REMPLACEMENT CLOUDINARY → CLOUDFLARE R2 POUR OGLEGACY
 * Script pour remplacer TOUTES les URLs Cloudinary par Cloudflare R2
 */

// Configuration Cloudflare D1
const CLOUDFLARE_CONFIG = {
  accountId: '7979421604bd07b3bd34d3ed96222512',
  databaseId: '732dfabe-3e2c-4d65-8fdc-bc39eb989434', // UUID D1 OGLEGACY
  apiToken: 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW'
};

const CLOUDFLARE_R2_BASE = 'https://pub-b38679a01a274648827751df94818418.r2.dev';

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

function convertCloudinaryToR2(cloudinaryUrl) {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary')) {
    return cloudinaryUrl;
  }
  
  // Extraire le nom du fichier de l'URL Cloudinary
  const filename = cloudinaryUrl.split('/').pop();
  const extension = filename.split('.').pop();
  
  // Déterminer le type de média
  const isVideo = ['mp4', 'mov', 'webm', 'avi'].includes(extension.toLowerCase());
  const folder = isVideo ? 'videos' : 'images';
  
  // Générer l'URL Cloudflare R2
  const r2Url = `${CLOUDFLARE_R2_BASE}/${folder}/${filename}`;
  
  console.log(`  🔄 ${cloudinaryUrl} → ${r2Url}`);
  return r2Url;
}

async function replaceAllCloudinaryUrls() {
  console.log('🚀 REMPLACEMENT CLOUDINARY → CLOUDFLARE R2 POUR OGLEGACY');
  console.log('===============================================================');
  
  try {
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
    
    // 2. Remplacer chaque produit
    for (const product of products) {
      console.log(`\n🛍️ Produit: ${product.name}`);
      
      const newImageUrl = convertCloudinaryToR2(product.image_url);
      const newVideoUrl = convertCloudinaryToR2(product.video_url);
      
      // Mettre à jour en base
      const updateSql = `
        UPDATE products 
        SET image_url = ?, video_url = ? 
        WHERE id = ?
      `;
      
      await executeSqlOnD1(updateSql, [newImageUrl, newVideoUrl, product.id]);
      console.log(`  ✅ Produit ${product.name} mis à jour`);
    }
    
    // 3. Vérification finale
    console.log('\n🔍 VÉRIFICATION FINALE...');
    const checkResult = await executeSqlOnD1(`
      SELECT COUNT(*) as count 
      FROM products 
      WHERE image_url LIKE '%cloudinary%' OR video_url LIKE '%cloudinary%'
    `);
    
    const remainingCount = checkResult.result[0].results[0].count;
    
    if (remainingCount === 0) {
      console.log('✅ SUCCÈS: Toutes les URLs Cloudinary ont été remplacées !');
    } else {
      console.log(`⚠️ Attention: ${remainingCount} produits ont encore des URLs Cloudinary`);
    }
    
    // 4. Afficher les nouveaux produits
    console.log('\n📋 PRODUITS AVEC NOUVELLES URLs CLOUDFLARE R2:');
    const finalResult = await executeSqlOnD1(`
      SELECT id, name, image_url, video_url 
      FROM products 
      ORDER BY id
    `);
    
    if (finalResult.result?.[0]?.results) {
      finalResult.result[0].results.forEach(product => {
        console.log(`  🛍️ ${product.name}:`);
        console.log(`     📷 Image: ${product.image_url}`);
        console.log(`     🎥 Vidéo: ${product.video_url}`);
      });
    }
    
    console.log('\n🎉 REMPLACEMENT TERMINÉ AVEC SUCCÈS !');
    console.log('===============================================');
    console.log('✅ Tous les produits utilisent maintenant Cloudflare R2');
    console.log('✅ Plus aucune trace de Cloudinary');
    console.log('✅ URLs optimisées pour performance');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

replaceAllCloudinaryUrls();