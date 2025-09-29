import { NextResponse } from 'next/server';
import r2Client from '../../../lib/cloudflare-r2';

// GET - Tester la connexion R2
export async function GET() {
  try {
    // Test de l'URL publique
    const publicUrl = r2Client.getPublicUrl('test.jpg');
    
    // Test de listage des fichiers
    const files = await r2Client.listFiles('images');
    
    return NextResponse.json({
      success: true,
      message: 'Cloudflare R2 configuré correctement',
      config: {
        bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'boutique-images',
        publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-b38679a01a274648827751df94818418.r2.dev',
        accountId: '7979421604bd07b3bd34d3ed96222512',
        hasApiToken: !!process.env.CLOUDFLARE_API_TOKEN,
        hasAccessKeys: !!(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY)
      },
      testUrl: publicUrl,
      filesCount: files.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test R2 Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur de connexion R2',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}