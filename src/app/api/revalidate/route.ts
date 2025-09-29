import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path = '/' } = body;
    
    // Revalider les pages Next.js
    revalidatePath(path);
    revalidatePath('/');
    revalidatePath('/admin');
    
    console.log('🔄 Pages revalidées:', path);
    
    return NextResponse.json({
      success: true,
      message: 'Pages revalidées avec succès',
      path: path,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur revalidation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la revalidation' },
      { status: 500 }
    );
  }
}