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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const farmId = params.id;
    const productsData = await executeSQL('SELECT COUNT(*) as count FROM products WHERE farm_id = ?', [farmId]);
    const productCount = productsData.result?.[0]?.results?.[0]?.count || 0;
    
    return NextResponse.json({ count: productCount });
  } catch (error) {
    console.error('❌ Erreur comptage produits farm:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}