import { NextResponse } from 'next/server';
import d1Simple from '../../../../../lib/d1-simple';

// GET - Récupérer SEULEMENT les liens sociaux actifs (pour la boutique)
export async function GET() {
  try {
    // Récupérer tous les liens sociaux avec le client simple
    const allLinks = await d1Simple.getSocialLinks();
    
    // Filtrer les liens actifs
    const activeLinks = allLinks.filter(link => 
      link.is_active === true || 
      link.is_active === 'true' || 
      link.is_active === 1
    );
    
    console.log('🌐 Liens sociaux actifs pour boutique:', activeLinks.length);
    
    return NextResponse.json(activeLinks || []);
  } catch (error) {
    console.error('Erreur récupération liens sociaux actifs:', error);
    return NextResponse.json([]);
  }
}