import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe requis' },
        { status: 400 }
      );
    }

    // Vérifier le mot de passe depuis les variables d'environnement
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (password === adminPassword) {
      return NextResponse.json({
        success: true,
        message: 'Connexion réussie'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Erreur login admin:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}