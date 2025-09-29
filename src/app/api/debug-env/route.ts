import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const debug = {
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID ? 'SET' : 'NOT SET',
      CLOUDFLARE_DATABASE_ID: process.env.CLOUDFLARE_DATABASE_ID ? 'SET' : 'NOT SET',
      CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      // Valeurs réelles (masquées partiellement pour sécurité)
      ACCOUNT_ID_VALUE: process.env.CLOUDFLARE_ACCOUNT_ID?.substring(0, 8) + '...',
      DATABASE_ID_VALUE: process.env.CLOUDFLARE_DATABASE_ID?.substring(0, 8) + '...',
      API_TOKEN_VALUE: process.env.CLOUDFLARE_API_TOKEN?.substring(0, 8) + '...'
    };
    
    return NextResponse.json(debug);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}