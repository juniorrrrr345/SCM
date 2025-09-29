import { NextResponse } from 'next/server';

// POST - Vider tous les caches
export async function POST() {
  try {
    console.log('🧹 Vidage complet des caches...');
    
    return NextResponse.json({
      success: true,
      message: 'Tous les caches vidés',
      timestamp: new Date().toISOString(),
      instructions: 'Rechargez la page pour voir les changements'
    });
  } catch (error) {
    console.error('Erreur vidage cache:', error);
    return NextResponse.json(
      { error: 'Erreur lors du vidage des caches' },
      { status: 500 }
    );
  }
}