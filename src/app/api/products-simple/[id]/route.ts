import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Configuration Cloudflare (même que dans les autres fichiers)
const getCloudflareConfig = () => ({
  ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || '7979421604bd07b3bd34d3ed96222512',
  DATABASE_ID: process.env.CLOUDFLARE_DATABASE_ID || '6df2df23-06af-4494-ba0f-30b2061c1def',
  API_TOKEN: process.env.CLOUDFLARE_API_TOKEN || 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW'
});

const executeSQL = async (sql: string, params: any[] = []) => {
  const { ACCOUNT_ID, DATABASE_ID, API_TOKEN } = getCloudflareConfig();
  const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
  
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql, params })
  });
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

// DELETE - Supprimer un produit
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;
    console.log('🗑️ Suppression produit:', productId);
    
    // 1. Récupérer les URLs des médias avant suppression
    const productData = await executeSQL('SELECT image_url, video_url FROM products WHERE id = ?', [productId]);
    const product = productData.result?.[0]?.results?.[0];
    
    if (!product) {
      return NextResponse.json(
        { error: 'Produit introuvable' },
        { status: 404 }
      );
    }
    
    // 2. Supprimer le produit de la base de données
    const deleteSQL = 'DELETE FROM products WHERE id = ?';
    const result = await executeSQL(deleteSQL, [productId]);
    
    if (!result.success) {
      throw new Error('Échec de la suppression du produit');
    }
    
    // 3. Supprimer les médias de Cloudflare R2
    const mediaUrls = [product.image_url, product.video_url].filter(url => url && url.trim());
    
    for (const mediaUrl of mediaUrls) {
      try {
        // Extraire la clé du fichier depuis l'URL
        const key = mediaUrl.split('/').slice(-2).join('/'); // ex: images/timestamp-id.jpg
        
        // Supprimer le fichier de R2
        const deleteResponse = await fetch(`/api/cloudflare/upload?url=${encodeURIComponent(mediaUrl)}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log(`✅ Média supprimé: ${key}`);
        } else {
          console.warn(`⚠️ Impossible de supprimer le média: ${key}`);
        }
      } catch (mediaError) {
        console.warn(`⚠️ Erreur suppression média ${mediaUrl}:`, mediaError);
        // On continue même si la suppression du média échoue
      }
    }
    
    console.log('✅ Produit et médias supprimés avec succès');
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Erreur suppression produit:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du produit' },
      { status: 500 }
    );
  }
}