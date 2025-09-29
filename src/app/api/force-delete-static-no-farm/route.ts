import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🗑️ FORCE SUPPRESSION de la catégorie "Static No Farm 💥"');
    
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    
    // 1. Récupérer tous les produits
    const productsResponse = await fetch(`${baseUrl}/api/cloudflare/products`);
    if (!productsResponse.ok) {
      throw new Error('Erreur lors de la récupération des produits');
    }
    const products = await productsResponse.json();
    
    // 2. Trouver et supprimer TOUS les produits de "Static No Farm 💥"
    const staticNoFarmProducts = products.filter((product: any) => 
      product.category === 'Static No Farm 💥'
    );
    
    console.log(`📦 ${staticNoFarmProducts.length} produits trouvés dans "Static No Farm 💥"`);
    
    let deletedProducts = 0;
    for (const product of staticNoFarmProducts) {
      console.log(`🗑️ Suppression produit: ${product.name}`);
      
      const deleteResponse = await fetch(`${baseUrl}/api/cloudflare/products/${product._id}`, {
        method: 'DELETE',
      });
      
      if (deleteResponse.ok) {
        deletedProducts++;
        console.log(`✅ Produit supprimé: ${product.name}`);
      } else {
        console.error(`❌ Erreur suppression ${product.name}:`, await deleteResponse.text());
      }
    }
    
    // 3. Récupérer toutes les catégories
    const categoriesResponse = await fetch(`${baseUrl}/api/cloudflare/categories`);
    if (!categoriesResponse.ok) {
      throw new Error('Erreur lors de la récupération des catégories');
    }
    const categories = await categoriesResponse.json();
    
    // 4. Trouver et supprimer la catégorie "Static No Farm 💥"
    const staticNoFarmCategory = categories.find((cat: any) => cat.name === 'Static No Farm 💥');
    
    if (!staticNoFarmCategory) {
      return NextResponse.json({
        success: true,
        message: 'Catégorie "Static No Farm 💥" déjà supprimée',
        deletedProducts
      });
    }
    
    console.log(`🗑️ Suppression catégorie: ${staticNoFarmCategory.name} (ID: ${staticNoFarmCategory.id})`);
    
    const deleteCategoryResponse = await fetch(`${baseUrl}/api/cloudflare/categories/${staticNoFarmCategory.id}`, {
      method: 'DELETE',
    });
    
    if (!deleteCategoryResponse.ok) {
      throw new Error(`Erreur suppression catégorie: ${await deleteCategoryResponse.text()}`);
    }
    
    // 5. Invalider le cache
    try {
      await fetch(`${baseUrl}/api/cache/invalidate`, { method: 'POST' });
      console.log('✅ Cache invalidé');
    } catch (error) {
      console.error('⚠️ Erreur invalidation cache:', error);
    }
    
    console.log(`✅ SUPPRESSION TERMINÉE: ${deletedProducts} produits + catégorie "Static No Farm 💥"`);
    
    return NextResponse.json({
      success: true,
      message: `SUPPRESSION TERMINÉE: ${deletedProducts} produits supprimés + catégorie "Static No Farm 💥" supprimée`,
      deletedProducts,
      categoryDeleted: true
    });
    
  } catch (error) {
    console.error('❌ ERREUR FORCE SUPPRESSION:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}