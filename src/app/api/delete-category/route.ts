import { NextRequest, NextResponse } from 'next/server';
import { d1Simple, executeD1Query } from '@/lib/d1-simple';

export async function POST(request: NextRequest) {
  try {
    const { categoryName, moveToCategory } = await request.json();
    
    if (!categoryName) {
      return NextResponse.json(
        { success: false, error: 'Nom de catégorie requis' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Suppression de la catégorie: ${categoryName}`);
    
    // 1. Récupérer tous les produits
    const allProducts = await d1Simple.getProducts();
    
    // 2. Filtrer les produits de cette catégorie
    const productsInCategory = allProducts.filter((product: any) => 
      product.category === categoryName
    );
    
    console.log(`📦 ${productsInCategory.length} produits trouvés dans la catégorie "${categoryName}"`);
    
    // 3. Gérer les produits de cette catégorie
    let deletedProducts = 0;
    if (productsInCategory.length > 0) {
      if (moveToCategory) {
        // Déplacer les produits vers une autre catégorie
        console.log(`🔄 Déplacement des produits vers: ${moveToCategory}`);
        
        for (const product of productsInCategory) {
          // Mettre à jour le produit avec la nouvelle catégorie
          await executeD1Query(
            'UPDATE products SET category_id = (SELECT id FROM categories WHERE name = ?) WHERE id = ?',
            [moveToCategory, product.id]
          );
          console.log(`✅ Produit déplacé: ${product.name}`);
        }
      } else {
        // Supprimer tous les produits de cette catégorie
        console.log(`🗑️ Suppression de ${productsInCategory.length} produits de la catégorie "${categoryName}"`);
        
        for (const product of productsInCategory) {
          await executeD1Query('DELETE FROM products WHERE id = ?', [product.id]);
          deletedProducts++;
          console.log(`✅ Produit supprimé: ${product.name}`);
        }
      }
    }
    
    // 4. Récupérer toutes les catégories
    const categories = await d1Simple.getCategories();
    
    // 5. Trouver la catégorie à supprimer
    const categoryToDelete = categories.find((cat: any) => cat.name === categoryName);
    
    if (!categoryToDelete) {
      return NextResponse.json({
        success: false,
        error: `Catégorie "${categoryName}" non trouvée`
      });
    }
    
    // 6. Supprimer la catégorie
    await executeD1Query('DELETE FROM categories WHERE id = ?', [categoryToDelete.id]);
    console.log(`✅ Catégorie supprimée: ${categoryName}`);
    
    console.log(`✅ Catégorie "${categoryName}" supprimée avec succès`);
    
    return NextResponse.json({
      success: true,
      message: `Catégorie "${categoryName}" supprimée avec succès`,
      deletedProducts: deletedProducts,
      moveToCategory: moveToCategory || null
    });
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la suppression de catégorie:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}