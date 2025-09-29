import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ 
      success: true, 
      message: 'Synchronisation forcée - données fraîches',
      timestamp: new Date().toISOString()
    });
    
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur sync' }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}