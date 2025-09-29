import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Nettoyage production des icônes de catégorie...');
    
    // Récupérer tous les produits depuis l'API production
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const productsResponse = await fetch(`${baseUrl}/api/cloudflare/products`);
    
    if (!productsResponse.ok) {
      throw new Error('Erreur lors de la récupération des produits');
    }
    
    const products = await productsResponse.json();
    console.log(`📦 ${products.length} produits trouvés`);
    
    let cleanedCount = 0;
    const cleanedProducts = [];
    
    for (const product of products) {
      // Vérifier si l'icône contient l'emoji 🏷️ ou est vide
      if (product.category_icon && (product.category_icon.includes('🏷️') || product.category_icon.trim() === '')) {
        const originalIcon = product.category_icon;
        const cleanedIcon = product.category_icon.replace(/🏷️/g, '').trim();
        
        console.log(`🔧 Nettoyage: ${product.name}`);
        console.log(`   Catégorie: ${product.category}`);
        console.log(`   Icône avant: "${originalIcon}"`);
        console.log(`   Icône après: "${cleanedIcon || 'null'}"`);
        
        // Mettre à jour le produit
        const updatedProduct = {
          ...product,
          category_icon: cleanedIcon || null // Mettre null si vide
        };
        
        // Envoyer la mise à jour
        const updateResponse = await fetch(`${baseUrl}/api/cloudflare/products/${product._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedProduct),
        });
        
        if (updateResponse.ok) {
          cleanedCount++;
          cleanedProducts.push({
            id: product._id,
            name: product.name,
            category: product.category,
            originalIcon,
            cleanedIcon: cleanedIcon || 'null'
          });
        } else {
          console.error(`❌ Erreur mise à jour ${product.name}:`, await updateResponse.text());
        }
      }
    }
    
    // Invalider le cache
    try {
      await fetch(`${baseUrl}/api/cache/invalidate`, { method: 'POST' });
      console.log('✅ Cache invalidé');
    } catch (error) {
      console.error('⚠️ Erreur invalidation cache:', error);
    }
    
    console.log(`✅ Nettoyage production terminé: ${cleanedCount} icônes de catégorie modifiées`);
    
    return NextResponse.json({
      success: true,
      message: `Nettoyage production terminé: ${cleanedCount} icônes de catégorie modifiées`,
      cleanedCount,
      cleanedProducts,
      baseUrl
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage production:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}