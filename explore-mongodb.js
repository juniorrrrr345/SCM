#!/usr/bin/env node

/**
 * 🔍 EXPLORATION COMPLÈTE MONGODB POUR TROUVER LES DONNÉES FAS
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fasand051:fas123@fasandfurious.ni31xay.mongodb.net/?retryWrites=true&w=majority&appName=fasandfurious';

async function exploreComplete() {
  console.log('🔍 EXPLORATION COMPLÈTE MONGODB FAS');
  console.log('='.repeat(50));
  
  let mongoClient;
  
  try {
    console.log('🔌 Connexion à MongoDB...');
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    console.log('✅ Connecté à MongoDB');
    
    // Lister toutes les bases de données
    console.log('\n📊 BASES DE DONNÉES DISPONIBLES:');
    const admin = mongoClient.db().admin();
    const dbs = await admin.listDatabases();
    
    for (const dbInfo of dbs.databases) {
      console.log(`   🗄️  ${dbInfo.name} (${(dbInfo.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
      
      // Explorer chaque base
      const db = mongoClient.db(dbInfo.name);
      try {
        const collections = await db.listCollections().toArray();
        console.log(`      📦 Collections: ${collections.length}`);
        
        for (const collection of collections) {
          const collectionName = collection.name;
          const count = await db.collection(collectionName).countDocuments();
          console.log(`         📋 ${collectionName}: ${count} documents`);
          
          if (count > 0 && count < 10) {
            // Afficher tous les documents si peu nombreux
            const docs = await db.collection(collectionName).find({}).toArray();
            console.log(`         🔍 Contenu:`, docs.map(d => ({
              id: d._id?.toString().substring(0, 8) + '...',
              name: d.name,
              title: d.title,
              url: d.url,
              keys: Object.keys(d).slice(0, 5)
            })));
          } else if (count > 0) {
            // Afficher un échantillon
            const sample = await db.collection(collectionName).findOne();
            console.log(`         🔍 Exemple:`, {
              keys: Object.keys(sample || {}),
              name: sample?.name,
              title: sample?.title
            });
          }
        }
      } catch (error) {
        console.log(`      ❌ Erreur accès collections: ${error.message}`);
      }
    }
    
    // Vérifier spécifiquement la base fasandfurious
    console.log('\n🎯 FOCUS SUR fasandfurious:');
    const fasDb = mongoClient.db('fasandfurious');
    
    try {
      const collections = await fasDb.listCollections().toArray();
      console.log(`   📦 Collections fasandfurious: ${collections.length}`);
      
      if (collections.length === 0) {
        console.log('   ⚠️  Aucune collection dans fasandfurious');
        console.log('   🔍 Tentative de recherche dans d\'autres bases...');
        
        // Chercher dans toutes les bases pour des collections avec des noms liés
        for (const dbInfo of dbs.databases) {
          if (dbInfo.name !== 'fasandfurious') {
            const otherDb = mongoClient.db(dbInfo.name);
            const otherCollections = await otherDb.listCollections().toArray();
            
            for (const coll of otherCollections) {
              if (coll.name.includes('product') || coll.name.includes('categor') || coll.name.includes('farm')) {
                const count = await otherDb.collection(coll.name).countDocuments();
                console.log(`   🎯 TROUVÉ: ${dbInfo.name}.${coll.name} (${count} docs)`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('   ❌ Erreur fasandfurious:', error.message);
    }
    
  } catch (error) {
    console.error('❌ ERREUR EXPLORATION:', error);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('\n🔌 Connexion MongoDB fermée');
    }
  }
}

// Exécution
exploreComplete().catch(console.error);