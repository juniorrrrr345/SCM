import { NextResponse } from 'next/server';

// POST - Vider tous les caches (localStorage, sessionStorage, etc.)
export async function POST() {
  try {
    console.log('🧹 Instruction de vidage complet des caches...');
    
    return NextResponse.json({
      success: true,
      message: 'Instruction de vidage des caches envoyée',
      clearCache: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur instruction cache:', error);
    return NextResponse.json(
      { error: 'Erreur instruction cache' },
      { status: 500 }
    );
  }
}