import { NextResponse } from 'next/server';

// Route de debug pour vérifier la configuration admin
export async function GET() {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    return NextResponse.json({
      success: true,
      debug: {
        hasAdminPassword: !!adminPassword,
        passwordLength: adminPassword ? adminPassword.length : 0,
        passwordPreview: adminPassword ? `${adminPassword.substring(0, 3)}***` : 'non défini',
        allEnvVars: Object.keys(process.env).filter(key => 
          key.includes('ADMIN') || key.includes('CLOUDFLARE')
        )
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}