import { NextRequest, NextResponse } from 'next/server';

// Configuration Cloudflare D1 hardcodée
const CLOUDFLARE_CONFIG = {
  accountId: '7979421604bd07b3bd34d3ed96222512',
  databaseId: '6df2df23-06af-4494-ba0f-30b2061c1def',
  apiToken: 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW'
};

async function executeSqlOnD1(sql: string, params: any[] = []) {
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

// GET - Récupérer un produit par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const result = await executeSqlOnD1(`
      SELECT 
        p.*, 
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
    
    if (!result.result?.[0]?.results?.length) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }
    
    const product = result.result[0].results[0];
    
    // Parser les JSON fields
    const enrichedProduct = {
      ...product,
      category: product.category_name || null,
      prices: JSON.parse(product.prices || '{}'),
      features: JSON.parse(product.features || '[]'),
      tags: JSON.parse(product.tags || '[]'),
    };
    
    return NextResponse.json(enrichedProduct);
  } catch (error) {
    console.error('Erreur récupération produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un produit
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    // Convertir category en ID si nécessaire
    let category_id = body.category_id;
    
    // Si on reçoit des noms au lieu d'IDs, les convertir
    if (body.category) {
      console.log('🔍 Conversion catégorie:', body.category);
      const catResult = await executeSqlOnD1('SELECT id FROM categories WHERE name = ?', [body.category]);
      console.log('🔍 Résultat recherche catégorie:', catResult);
      if (catResult.success && catResult.result?.[0]?.results?.[0]) {
        category_id = catResult.result[0].results[0].id;
        console.log('✅ Catégorie convertie:', body.category, '→ ID', category_id);
      } else {
        console.log('❌ Catégorie non trouvée:', body.category);
      }
    }
    
    // Champ "farm" supprimé

    const sql = `UPDATE products SET 
      name = ?, description = ?, price = ?, prices = ?, 
      category_id = ?, image_url = ?, video_url = ?, 
      stock = ?, is_available = ?, features = ?, tags = ?
      WHERE id = ?`;
    
    const values = [
      body.name,
      body.description || '',
      parseFloat(body.price) || 0,
      JSON.stringify(body.prices || {}),
      category_id || null,
      body.image_url || '',
      body.video_url || '',
      parseInt(body.stock) || 0,
      body.is_available !== false ? 1 : 0,
      JSON.stringify(body.features || []),
      JSON.stringify(body.tags || []),
      id
    ];

    await executeSqlOnD1(sql, values);

    // Récupérer le produit mis à jour
    const result = await executeSqlOnD1(`
      SELECT 
        p.*, 
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
    
    if (result.result?.[0]?.results?.length) {
      const product = result.result[0].results[0];
      const enrichedProduct = {
        ...product,
        category: product.category_name || null,
        prices: JSON.parse(product.prices || '{}'),
        features: JSON.parse(product.features || '[]'),
        tags: JSON.parse(product.tags || '[]'),
      };
      
      return NextResponse.json(enrichedProduct);
    } else {
      return NextResponse.json({ success: true, message: 'Produit mis à jour' });
    }
  } catch (error) {
    console.error('Erreur mise à jour produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un produit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    // Supprimer le produit
    await executeSqlOnD1('DELETE FROM products WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression' },
      { status: 500 }
    );
  }
}