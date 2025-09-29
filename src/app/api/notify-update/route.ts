import { NextRequest, NextResponse } from 'next/server';

// POST - Notifier qu'une mise à jour a eu lieu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, action, data } = body;
    
    console.log('🔔 Notification mise à jour:', { type, action, data });
    
    // Pour l'instant, juste logger
    // Plus tard on pourrait ajouter WebSockets ou Server-Sent Events
    
    return NextResponse.json({
      success: true,
      message: 'Notification envoyée',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur notification:', error);
    return NextResponse.json(
      { error: 'Erreur notification' },
      { status: 500 }
    );
  }
}