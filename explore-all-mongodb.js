const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://kpopstanfrvr:LpmgOdjxpUArjFHo@valal.f5mazy7.mongodb.net/?retryWrites=true&w=majority&appName=valal';

async function exploreAllDatabases() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('🔌 Connecté à MongoDB');
    
    // Lister toutes les bases de données
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    
    console.log('🗄️ Bases de données disponibles:');
    for (const dbInfo of databases.databases) {
      console.log(`  - ${dbInfo.name} (${(dbInfo.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    }
    
    // Explorer chaque base non-système
    for (const dbInfo of databases.databases) {
      if (!['admin', 'local', 'config'].includes(dbInfo.name)) {
        console.log(`\n📋 Exploration de la base: ${dbInfo.name}`);
        const db = client.db(dbInfo.name);
        const collections = await db.listCollections().toArray();
        
        if (collections.length === 0) {
          console.log('  ⚠️  Aucune collection');
          continue;
        }
        
        for (const collection of collections) {
          const count = await db.collection(collection.name).countDocuments();
          console.log(`  📊 ${collection.name}: ${count} documents`);
          
          if (count > 0 && count < 20) {
            const samples = await db.collection(collection.name).find({}).limit(3).toArray();
            console.log(`    🔍 Champs disponibles:`, Object.keys(samples[0] || {}));
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.close();
  }
}

exploreAllDatabases();