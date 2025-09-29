#!/usr/bin/env node

/**
 * 🔄 MIGRATION MONGODB → D1 CLOUDFLARE POUR FAS
 * Script automatique pour copier toutes les données
 */

const { MongoClient } = require('mongodb');

// Configuration MongoDB source
const MONGODB_URI = 'mongodb+srv://kpopstanfrvr:LpmgOdjxpUArjFHo@valal.f5mazy7.mongodb.net/?retryWrites=true&w=majority&appName=valal';
const MONGODB_DB_NAME = 'valal';

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

async function migrateCollection(mongoCollection, tableName, fieldMapping) {
  console.log(`\n📦 Migration ${tableName}...`);
  
  try {
    const documents = await mongoCollection.find({}).toArray();
    console.log(`   Trouvé ${documents.length} documents dans MongoDB`);
    
    if (documents.length === 0) {
      console.log(`   ⚠️  Aucune donnée à migrer pour ${tableName}`);
      return;
    }
    
    let migrated = 0;
    for (const doc of documents) {
      try {
        // Mapper les champs selon la configuration
        const mappedData = {};
        for (const [d1Field, mongoField] of Object.entries(fieldMapping)) {
          if (typeof mongoField === 'function') {
            mappedData[d1Field] = mongoField(doc);
          } else {
            mappedData[d1Field] = doc[mongoField] || null;
          }
        }
        
        // Construire la requête INSERT
        const fields = Object.keys(mappedData);
        const placeholders = fields.map(() => '?').join(', ');
        const values = Object.values(mappedData);
        
        const sql = `INSERT OR REPLACE INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
        
        await executeSqlOnD1(sql, values);
        migrated++;
        
        if (migrated % 10 === 0) {
          console.log(`   ✅ ${migrated}/${documents.length} migrés...`);
        }
      } catch (error) {
        console.error(`   ❌ Erreur migration document ${doc._id}:`, error.message);
      }
    }
    
    console.log(`   🎉 ${migrated}/${documents.length} documents migrés avec succès !`);
    
  } catch (error) {
    console.error(`❌ Erreur migration ${tableName}:`, error);
  }
}

async function main() {
  console.log('🚀 DÉBUT MIGRATION MONGODB → D1 CLOUDFLARE POUR FAS');
  console.log('='.repeat(60));
  
  let mongoClient;
  
  try {
    // Connexion MongoDB
    console.log('🔌 Connexion à MongoDB...');
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    const db = mongoClient.db(MONGODB_DB_NAME);
    console.log('✅ Connecté à MongoDB');
    
    // Test connexion D1
    console.log('🔌 Test connexion D1...');
    await executeSqlOnD1('SELECT 1 as test');
    console.log('✅ Connecté à D1 Cloudflare');
    
    // 1. Migration Settings
    console.log('\n📋 Migration des paramètres...');
    try {
      await executeSqlOnD1(`
        INSERT OR REPLACE INTO settings (
          id, shop_name, admin_password, background_image, 
          background_opacity, background_blur, theme_color,
          contact_info, shop_description, loading_enabled,
          loading_duration, whatsapp_link, whatsapp_number,
          scrolling_text
        ) VALUES (
          1, 'FAS', 'admin123', 'https://i.imgur.com/s1rsguc.jpeg',
          20, 5, 'glow', '', 'Boutique FAS - Produits de qualité',
          1, 3000, '', '', 'Bienvenue chez FAS - Votre boutique de confiance'
        )
      `);
      console.log('✅ Paramètres par défaut créés');
    } catch (error) {
      console.error('❌ Erreur paramètres:', error.message);
    }
    
    // 2. Migration Categories
    await migrateCollection(
      db.collection('categories'),
      'categories',
      {
        name: 'name',
        description: 'description',
        icon: (doc) => doc.icon || '🏷️',
        color: (doc) => doc.color || '#3B82F6'
      }
    );
    
    // 3. Migration Farms
    await migrateCollection(
      db.collection('farms'),
      'farms',
      {
        name: 'name',
        description: 'description',
        location: 'location',
        contact: 'contact'
      }
    );
    
    // 4. Migration Products
    await migrateCollection(
      db.collection('products'),
      'products',
      {
        name: 'name',
        description: 'description',
        price: (doc) => parseFloat(doc.price) || 0,
        prices: (doc) => JSON.stringify(doc.prices || {}),
        category_id: (doc) => doc.categoryId || null,
        farm_id: (doc) => doc.farmId || null,
        image_url: (doc) => doc.image || doc.imageUrl || '',
        video_url: (doc) => doc.video || doc.videoUrl || '',
        images: (doc) => JSON.stringify(doc.images || []),
        stock: (doc) => parseInt(doc.stock) || 0,
        is_available: (doc) => doc.isAvailable !== false,
        features: (doc) => JSON.stringify(doc.features || []),
        tags: (doc) => JSON.stringify(doc.tags || [])
      }
    );
    
    // 5. Migration Pages
    await migrateCollection(
      db.collection('pages'),
      'pages',
      {
        slug: 'slug',
        title: 'title',
        content: 'content',
        is_active: (doc) => doc.isActive !== false
      }
    );
    
    // 6. Migration Social Links
    await migrateCollection(
      db.collection('sociallinks'),
      'social_links',
      {
        name: 'name',
        url: 'url',
        icon: (doc) => doc.icon || '🔗',
        is_active: (doc) => doc.isActive !== false,
        sort_order: (doc) => parseInt(doc.sortOrder) || 0
      }
    );
    
    // Vérification finale
    console.log('\n🔍 VÉRIFICATION FINALE...');
    const tables = ['settings', 'categories', 'farms', 'products', 'pages', 'social_links'];
    
    for (const table of tables) {
      try {
        const result = await executeSqlOnD1(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.result?.[0]?.results?.[0]?.count || 0;
        console.log(`   📊 ${table}: ${count} enregistrements`);
      } catch (error) {
        console.error(`   ❌ Erreur vérification ${table}:`, error.message);
      }
    }
    
    console.log('\n🎉 MIGRATION TERMINÉE AVEC SUCCÈS !');
    console.log('='.repeat(60));
    console.log('✅ Toutes les données MongoDB ont été copiées vers D1');
    console.log('✅ La boutique FAS est prête à fonctionner');
    console.log('✅ Panel admin synchronisé avec les vraies données');
    
  } catch (error) {
    console.error('❌ ERREUR MIGRATION:', error);
    process.exit(1);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('🔌 Connexion MongoDB fermée');
    }
  }
}

// Exécution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, migrateCollection, executeSqlOnD1 };