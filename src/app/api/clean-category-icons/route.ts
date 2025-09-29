import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Début du nettoyage des icônes de catégorie...');
    
    // Récupérer tous les produits
    const productsResponse = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/cloudflare/products`);
    
    if (!productsResponse.ok) {
      throw new Error('Erreur lors de la récupération des produits');
    }
    
    const products = await productsResponse.json();
    console.log(`📦 ${products.length} produits trouvés`);
    
    let cleanedCount = 0;
    const cleanedProducts = [];
    
    for (const product of products) {
      if (product.category_icon && product.category_icon.includes('🏷️')) {
        const originalIcon = product.category_icon;
        const cleanedIcon = product.category_icon.replace(/🏷️/g, '').trim();
        
        console.log(`🔧 Nettoyage: ${product.name}`);
        console.log(`   Catégorie: ${product.category}`);
        console.log(`   Icône avant: "${originalIcon}"`);
        console.log(`   Icône après: "${cleanedIcon}"`);
        
        // Mettre à jour le produit
        const updatedProduct = {
          ...product,
          category_icon: cleanedIcon
        };
        
        // Envoyer la mise à jour
        const updateResponse = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/cloudflare/products/${product._id}`, {
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
            cleanedIcon
          });
        } else {
          console.error(`❌ Erreur mise à jour ${product.name}:`, await updateResponse.text());
        }
      }
    }
    
    console.log(`✅ Nettoyage terminé: ${cleanedCount} icônes de catégorie modifiées`);
    
    return NextResponse.json({
      success: true,
      message: `Nettoyage terminé: ${cleanedCount} icônes de catégorie modifiées`,
      cleanedCount,
      cleanedProducts
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}