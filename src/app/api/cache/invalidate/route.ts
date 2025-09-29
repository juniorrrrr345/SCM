import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔄 Cache invalidé (simulation)');
    
    return NextResponse.json({
      success: true,
      message: 'Cache invalidé avec succès',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur invalidation cache:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'invalidation du cache' },
      { status: 500 }
    );
  }
}