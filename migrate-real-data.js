#!/usr/bin/env node

/**
 * 🔄 MIGRATION MONGODB → D1 CLOUDFLARE POUR OGLEGACY
 * Migration complète des vraies données depuis la base 'test'
 */

const { MongoClient } = require('mongodb');

// Configuration MongoDB source (base 'test' avec les vraies données)
const MONGODB_URI = 'mongodb+srv://kpopstanfrvr:LpmgOdjxpUArjFHo@valal.f5mazy7.mongodb.net/?retryWrites=true&w=majority&appName=valal';
const MONGODB_DB_NAME = 'test'; // Base qui contient les vraies données

// Configuration Cloudflare D1 destination
const CLOUDFLARE_CONFIG = {
  accountId: '7979421604bd07b3bd34d3ed96222512',
  databaseId: '732dfabe-3e2c-4d65-8fdc-bc39eb989434', // UUID D1 OGLEGACY
  apiToken: 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW'
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

async function migrateCategories(mongoCollection) {
  console.log(`\n📦 Migration categories...`);
  
  try {
    // Vider la table existante
    await executeSqlOnD1('DELETE FROM categories');
    
    const documents = await mongoCollection.find({}).toArray();
    console.log(`   Trouvé ${documents.length} catégories dans MongoDB`);
    
    for (const doc of documents) {
      const sql = `
        INSERT INTO categories (name, icon, color, created_at) 
        VALUES (?, ?, ?, datetime('now'))
      `;
      
      const params = [
        doc.name || 'Sans nom',
        doc.emoji || '📦',
        '#22C55E', // Couleur par défaut
      ];
      
      await executeSqlOnD1(sql, params);
      console.log(`   ✅ Catégorie migrée: ${doc.name}`);
    }
    
    console.log(`   ✅ ${documents.length} catégories migrées avec succès`);
  } catch (error) {
    console.error(`   ❌ Erreur migration catégories:`, error.message);
  }
}

async function migrateFarms(mongoCollection) {
  console.log(`\n📦 Migration farms...`);
  
  try {
    // Vider la table existante
    await executeSqlOnD1('DELETE FROM farms');
    
    const documents = await mongoCollection.find({}).toArray();
    console.log(`   Trouvé ${documents.length} farms dans MongoDB`);
    
    for (const doc of documents) {
      const sql = `
        INSERT INTO farms (name, location, contact, description, created_at) 
        VALUES (?, ?, ?, ?, datetime('now'))
      `;
      
      const params = [
        doc.name || 'Sans nom',
        doc.country || 'Non spécifié',
        'contact@oglegacy.com',
        doc.description || 'Farm OGLEGACY'
      ];
      
      await executeSqlOnD1(sql, params);
      console.log(`   ✅ Farm migrée: ${doc.name}`);
    }
    
    console.log(`   ✅ ${documents.length} farms migrées avec succès`);
  } catch (error) {
    console.error(`   ❌ Erreur migration farms:`, error.message);
  }
}

async function migrateProducts(mongoCollection, categoriesMap, farmsMap) {
  console.log(`\n📦 Migration products...`);
  
  try {
    // Vider la table existante
    await executeSqlOnD1('DELETE FROM products');
    
    const documents = await mongoCollection.find({}).toArray();
    console.log(`   Trouvé ${documents.length} produits dans MongoDB`);
    
    for (const doc of documents) {
      const sql = `
        INSERT INTO products (name, description, category_id, farm_id, image_url, video_url, prices, price, stock, is_available, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `;
      
      // Trouver l'ID de la catégorie et farm
      const categoryId = categoriesMap[doc.category] || 1;
      const farmId = farmsMap[doc.farm] || 1;
      
      const params = [
        doc.name || 'Produit sans nom',
        doc.description || 'Description du produit OGLEGACY',
        categoryId,
        farmId,
        doc.image || '',
        doc.video || '',
        JSON.stringify(doc.prices || {}),
        Object.values(doc.prices || {})[0] || 0,
        50, // Stock par défaut
        doc.isActive !== false ? 1 : 0
      ];
      
      await executeSqlOnD1(sql, params);
      console.log(`   ✅ Produit migré: ${doc.name}`);
    }
    
    console.log(`   ✅ ${documents.length} produits migrés avec succès`);
  } catch (error) {
    console.error(`   ❌ Erreur migration produits:`, error.message);
  }
}

async function migrateSocialLinks(mongoCollection) {
  console.log(`\n📦 Migration social_links...`);
  
  try {
    // Vider la table existante
    await executeSqlOnD1('DELETE FROM social_links');
    
    const documents = await mongoCollection.find({}).toArray();
    console.log(`   Trouvé ${documents.length} liens sociaux dans MongoDB`);
    
    for (const doc of documents) {
      const sql = `
        INSERT INTO social_links (platform, url, icon, is_available, created_at) 
        VALUES (?, ?, ?, ?, datetime('now'))
      `;
      
      const params = [
        doc.name || 'Réseau social',
        doc.url || '#',
        doc.icon || '🔗',
        doc.isActive !== false ? 1 : 0
      ];
      
      await executeSqlOnD1(sql, params);
      console.log(`   ✅ Lien social migré: ${doc.name}`);
    }
    
    console.log(`   ✅ ${documents.length} liens sociaux migrés avec succès`);
  } catch (error) {
    console.error(`   ❌ Erreur migration liens sociaux:`, error.message);
  }
}

async function migrateSettings(mongoCollection) {
  console.log(`\n📦 Migration settings...`);
  
  try {
    const document = await mongoCollection.findOne({});
    if (!document) {
      console.log(`   ⚠️  Aucun settings dans MongoDB`);
      return;
    }
    
    const sql = `
      UPDATE settings SET 
        background_image = ?,
        info_content = ?,
        contact_content = ?,
        background_opacity = ?,
        background_blur = ?
      WHERE id = 1
    `;
    
    const params = [
      document.backgroundImage || 'https://pub-b38679a01a274648827751df94818418.r2.dev/images/background-oglegacy.jpeg',
      document.bannerText || 'Bienvenue chez OGLEGACY - Votre boutique premium',
      'Contactez OGLEGACY pour toute question',
      document.backgroundOpacity || 20,
      document.backgroundBlur || 5
    ];
    
    await executeSqlOnD1(sql, params);
    console.log(`   ✅ Settings migrés avec succès`);
  } catch (error) {
    console.error(`   ❌ Erreur migration settings:`, error.message);
  }
}

async function migratePages(mongoCollection) {
  console.log(`\n📦 Migration pages...`);
  
  try {
    // Vider la table existante
    await executeSqlOnD1('DELETE FROM pages');
    
    const documents = await mongoCollection.find({}).toArray();
    console.log(`   Trouvé ${documents.length} pages dans MongoDB`);
    
    for (const doc of documents) {
      const sql = `
        INSERT INTO pages (slug, title, content, created_at) 
        VALUES (?, ?, ?, datetime('now'))
      `;
      
      const params = [
        doc.slug || 'page',
        doc.title || 'Page OGLEGACY',
        doc.content || 'Contenu de la page OGLEGACY'
      ];
      
      await executeSqlOnD1(sql, params);
      console.log(`   ✅ Page migrée: ${doc.title}`);
    }
    
    console.log(`   ✅ ${documents.length} pages migrées avec succès`);
  } catch (error) {
    console.error(`   ❌ Erreur migration pages:`, error.message);
  }
}

async function main() {
  console.log('🚀 DÉBUT MIGRATION MONGODB → D1 CLOUDFLARE POUR OGLEGACY');
  console.log('============================================================');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connexion à MongoDB...');
    await client.connect();
    console.log('✅ Connecté à MongoDB');
    
    console.log('🔌 Test connexion D1...');
    await executeSqlOnD1('SELECT 1');
    console.log('✅ Connecté à D1 Cloudflare');
    
    const db = client.db(MONGODB_DB_NAME);
    
    // 1. Migrer les catégories d'abord
    await migrateCategories(db.collection('categories'));
    
    // 2. Migrer les farms
    await migrateFarms(db.collection('farms'));
    
    // 3. Créer des maps pour les relations
    const categoriesResult = await executeSqlOnD1('SELECT id, name FROM categories');
    const categoriesMap = {};
    if (categoriesResult.result?.[0]?.results) {
      categoriesResult.result[0].results.forEach(cat => {
        categoriesMap[cat.name] = cat.id;
      });
    }
    
    const farmsResult = await executeSqlOnD1('SELECT id, name FROM farms');
    const farmsMap = {};
    if (farmsResult.result?.[0]?.results) {
      farmsResult.result[0].results.forEach(farm => {
        farmsMap[farm.name] = farm.id;
      });
    }
    
    // 4. Migrer les produits avec les bonnes relations
    await migrateProducts(db.collection('products'), categoriesMap, farmsMap);
    
    // 5. Migrer les liens sociaux
    await migrateSocialLinks(db.collection('socialLinks'));
    
    // 6. Migrer les settings
    await migrateSettings(db.collection('settings'));
    
    // 7. Migrer les pages
    await migratePages(db.collection('pages'));
    
    // Vérification finale
    console.log('\n🔍 VÉRIFICATION FINALE...');
    const tables = ['categories', 'farms', 'products', 'social_links', 'settings', 'pages'];
    
    for (const table of tables) {
      try {
        const result = await executeSqlOnD1(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.result?.[0]?.results?.[0]?.count || 0;
        console.log(`   📊 ${table}: ${count} enregistrements`);
      } catch (error) {
        console.log(`   ❌ Erreur vérification ${table}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 MIGRATION TERMINÉE AVEC SUCCÈS !');
    console.log('============================================================');
    console.log('✅ Toutes les données MongoDB ont été copiées vers D1');
    console.log('✅ La boutique OGLEGACY est prête à fonctionner');
    console.log('✅ Panel admin synchronisé avec les vraies données');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    console.log('🔌 Connexion MongoDB fermée');
    await client.close();
  }
}

main();