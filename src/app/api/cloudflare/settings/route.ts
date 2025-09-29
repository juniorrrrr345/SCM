import { NextRequest, NextResponse } from 'next/server';

// Configuration Cloudflare D1 hardcodée
const CLOUDFLARE_CONFIG = {
  accountId: '7979421604bd07b3bd34d3ed96222512',
  databaseId: '6df2df23-06af-4494-ba0f-30b2061c1def',
  apiToken: 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW'
};

async function executeSqlOnD1(sql: string, params: any[] = []) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_CONFIG.accountId}/d1/database/${CLOUDFLARE_CONFIG.databaseId}/query`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_CONFIG.apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql, params })
  });
  
  if (!response.ok) {
    throw new Error(`D1 Error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

// GET - Récupérer les paramètres
export async function GET() {
  try {
    console.log('🔍 GET settings LANATIONDULAIT...');
    
    const result = await executeSqlOnD1('SELECT * FROM settings WHERE id = 1');
    
    if (result.result?.[0]?.results?.length) {
      const settings = result.result[0].results[0];
      console.log('✅ Settings LANATIONDULAIT récupérés:', settings);
      
      // Mapper les champs D1 vers le format attendu par le frontend
      const mappedSettings = {
        ...settings,
        backgroundImage: settings.background_image,
        backgroundOpacity: settings.background_opacity || 20,
        backgroundBlur: settings.background_blur || 5,
        shopTitle: settings.shop_title || 'LANATIONDULAIT',
        shopName: settings.shop_title || 'LANATIONDULAIT',
        infoContent: settings.info_content,
        contactContent: settings.contact_content,
        whatsappLink: settings.whatsapp_link || '',
        whatsappNumber: settings.whatsapp_number || '',
        scrollingText: settings.scrolling_text || '',
        titleStyle: settings.theme_color || 'glow',
        // Nouveaux champs pour les liens Telegram par service
        telegram_livraison: settings.telegram_livraison || '',
        telegram_envoi: settings.telegram_envoi || '',
        telegram_meetup: settings.telegram_meetup || '',
        // Nouveaux champs pour les horaires personnalisés (parse JSON si string)
        livraison_schedules: settings.livraison_schedules ? 
          (typeof settings.livraison_schedules === 'string' ? 
            JSON.parse(settings.livraison_schedules) : settings.livraison_schedules) : 
          ['Matin (9h-12h)', 'Après-midi (14h-17h)', 'Soirée (17h-20h)', 'Flexible (à convenir)'],
        meetup_schedules: settings.meetup_schedules ? 
          (typeof settings.meetup_schedules === 'string' ? 
            JSON.parse(settings.meetup_schedules) : settings.meetup_schedules) : 
          ['Lundi au Vendredi (9h-18h)', 'Weekend (10h-17h)', 'Soirée en semaine (18h-21h)', 'Flexible (à convenir)'],
        envoi_schedules: settings.envoi_schedules ? 
          (typeof settings.envoi_schedules === 'string' ? 
            JSON.parse(settings.envoi_schedules) : settings.envoi_schedules) : 
          ['Envoi sous 24h', 'Envoi sous 48h', 'Envoi express', 'Délai à convenir']
      };
      
      return NextResponse.json(mappedSettings);
    } else {
      // Retourner des paramètres par défaut LANATIONDULAIT
      const defaultSettings = {
        id: 1,
        shop_name: 'LANATIONDULAIT',
        background_image: 'https://pub-b38679a01a274648827751df94818418.r2.dev/images/background-oglegacy.jpeg',
        background_opacity: 20,
        background_blur: 5,
        info_content: 'Bienvenue chez LANATIONDULAIT - Votre boutique premium',
        contact_content: 'Contactez LANATIONDULAIT pour toute question',
        backgroundImage: 'https://pub-b38679a01a274648827751df94818418.r2.dev/images/background-oglegacy.jpeg',
        backgroundOpacity: 20,
        backgroundBlur: 5,
        shopTitle: 'LANATIONDULAIT',
        shopName: 'LANATIONDULAIT',
        // Valeurs par défaut pour les nouveaux champs
        telegram_livraison: '',
        telegram_envoi: '',
        telegram_meetup: '',
        livraison_schedules: ['Matin (9h-12h)', 'Après-midi (14h-17h)', 'Soirée (17h-20h)', 'Flexible (à convenir)'],
        meetup_schedules: ['Lundi au Vendredi (9h-18h)', 'Weekend (10h-17h)', 'Soirée en semaine (18h-21h)', 'Flexible (à convenir)'],
        envoi_schedules: ['Envoi sous 24h', 'Envoi sous 48h', 'Envoi express', 'Délai à convenir']
      };
      
      return NextResponse.json(defaultSettings);
    }
  } catch (error) {
    console.error('❌ Erreur GET settings LANATIONDULAIT:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}

// POST - Créer ou mettre à jour les paramètres (pour compatibilité)
export async function POST(request: NextRequest) {
  return PUT(request);
}

// PUT - Mettre à jour les paramètres
export async function PUT(request: NextRequest) {
  try {
    console.log('🔧 PUT settings LANATIONDULAIT...');
    const body = await request.json();
    
    const {
      background_image,
      backgroundImage,
      background_opacity,
      backgroundOpacity,
      background_blur,
      backgroundBlur,
      info_content,
      infoContent,
      contact_content,
      contactContent,
      shop_title,
      shopTitle,
      whatsapp_link,
      whatsappLink,
      whatsapp_number,
      whatsappNumber,
      scrolling_text,
      scrollingText,
      theme_color,
      titleStyle,
      // Nouveaux champs pour les liens Telegram par service
      telegram_livraison,
      telegram_envoi,
      telegram_meetup,
      // Nouveaux champs pour les horaires personnalisés
      livraison_schedules,
      meetup_schedules,
      envoi_schedules
    } = body;

    // Utiliser les champs avec priorité aux versions snake_case
    const finalBackgroundImage = background_image || backgroundImage;
    const finalBackgroundOpacity = background_opacity ?? backgroundOpacity ?? 20;
    const finalBackgroundBlur = background_blur ?? backgroundBlur ?? 5;
    const finalInfoContent = info_content || infoContent || 'Bienvenue chez LANATIONDULAIT';
    const finalContactContent = contact_content || contactContent || 'Contactez LANATIONDULAIT';
    const finalShopTitle = shop_title || shopTitle || 'LANATIONDULAIT';
    const finalWhatsappLink = whatsapp_link || whatsappLink || '';
    const finalWhatsappNumber = whatsapp_number || whatsappNumber || '';
    const finalScrollingText = scrolling_text || scrollingText || '';
    const finalThemeColor = theme_color || titleStyle || 'glow';
    
    // Nouveaux champs pour les liens Telegram par service
    const finalTelegramLivraison = telegram_livraison || '';
    const finalTelegramEnvoi = telegram_envoi || '';
    const finalTelegramMeetup = telegram_meetup || '';
    
    // Nouveaux champs pour les horaires personnalisés (stringifier les arrays)
    const finalLivraisonSchedules = livraison_schedules ? JSON.stringify(livraison_schedules) : JSON.stringify(['Matin (9h-12h)', 'Après-midi (14h-17h)', 'Soirée (17h-20h)', 'Flexible (à convenir)']);
    const finalMeetupSchedules = meetup_schedules ? JSON.stringify(meetup_schedules) : JSON.stringify(['Lundi au Vendredi (9h-18h)', 'Weekend (10h-17h)', 'Soirée en semaine (18h-21h)', 'Flexible (à convenir)']);
    const finalEnvoiSchedules = envoi_schedules ? JSON.stringify(envoi_schedules) : JSON.stringify(['Envoi sous 24h', 'Envoi sous 48h', 'Envoi express', 'Délai à convenir']);
    
    console.log('📱 Sauvegarde des nouveaux champs:', {
      telegram_livraison: finalTelegramLivraison,
      telegram_envoi: finalTelegramEnvoi,
      telegram_meetup: finalTelegramMeetup,
      livraison_schedules: finalLivraisonSchedules,
      meetup_schedules: finalMeetupSchedules,
      envoi_schedules: finalEnvoiSchedules
    });

    // Vérifier si un enregistrement existe
    const checkResult = await executeSqlOnD1('SELECT id FROM settings WHERE id = 1');
    
    if (checkResult.result?.[0]?.results?.length) {
      // UPDATE
      await executeSqlOnD1(`
        UPDATE settings SET 
          background_image = ?, 
          background_opacity = ?, 
          background_blur = ?,
          info_content = ?,
          contact_content = ?,
          shop_title = ?,
          whatsapp_link = ?,
          whatsapp_number = ?,
          scrolling_text = ?,
          theme_color = ?,
          telegram_livraison = ?,
          telegram_envoi = ?,
          telegram_meetup = ?,
          livraison_schedules = ?,
          meetup_schedules = ?,
          envoi_schedules = ?
        WHERE id = 1
      `, [
        finalBackgroundImage,
        finalBackgroundOpacity,
        finalBackgroundBlur,
        finalInfoContent,
        finalContactContent,
        finalShopTitle,
        finalWhatsappLink,
        finalWhatsappNumber,
        finalScrollingText,
        finalThemeColor,
        finalTelegramLivraison,
        finalTelegramEnvoi,
        finalTelegramMeetup,
        finalLivraisonSchedules,
        finalMeetupSchedules,
        finalEnvoiSchedules
      ]);
    } else {
      // INSERT
      await executeSqlOnD1(`
        INSERT INTO settings (
          id, background_image, background_opacity, background_blur, 
          info_content, contact_content, shop_title, whatsapp_link,
          whatsapp_number, scrolling_text, theme_color,
          telegram_livraison, telegram_envoi, telegram_meetup,
          livraison_schedules, meetup_schedules, envoi_schedules
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        1,
        finalBackgroundImage,
        finalBackgroundOpacity,
        finalBackgroundBlur,
        finalInfoContent,
        finalContactContent,
        finalShopTitle,
        finalWhatsappLink,
        finalWhatsappNumber,
        finalScrollingText,
        finalThemeColor,
        finalTelegramLivraison,
        finalTelegramEnvoi,
        finalTelegramMeetup,
        finalLivraisonSchedules,
        finalMeetupSchedules,
        finalEnvoiSchedules
      ]);
    }

    // Récupérer les paramètres mis à jour
    const result = await executeSqlOnD1('SELECT * FROM settings WHERE id = 1');
    const settings = result.result[0].results[0];
    
    console.log('✅ Settings LANATIONDULAIT mis à jour:', settings);

    const mappedSettings = {
      ...settings,
      backgroundImage: settings.background_image,
      backgroundOpacity: settings.background_opacity,
      backgroundBlur: settings.background_blur,
      shopTitle: 'LANATIONDULAIT',
      shopName: 'LANATIONDULAIT',
      // Inclure les nouveaux champs dans la réponse
      telegram_livraison: settings.telegram_livraison || '',
      telegram_envoi: settings.telegram_envoi || '',
      telegram_meetup: settings.telegram_meetup || '',
      livraison_schedules: settings.livraison_schedules ? 
        (typeof settings.livraison_schedules === 'string' ? 
          JSON.parse(settings.livraison_schedules) : settings.livraison_schedules) : 
        ['Matin (9h-12h)', 'Après-midi (14h-17h)', 'Soirée (17h-20h)', 'Flexible (à convenir)'],
        meetup_schedules: settings.meetup_schedules ? 
          (typeof settings.meetup_schedules === 'string' ? 
            JSON.parse(settings.meetup_schedules) : settings.meetup_schedules) : 
          ['Lundi au Vendredi (9h-18h)', 'Weekend (10h-17h)', 'Soirée en semaine (18h-21h)', 'Flexible (à convenir)'],
        envoi_schedules: settings.envoi_schedules ? 
          (typeof settings.envoi_schedules === 'string' ? 
            JSON.parse(settings.envoi_schedules) : settings.envoi_schedules) : 
          ['Envoi sous 24h', 'Envoi sous 48h', 'Envoi express', 'Délai à convenir']
    };

    return NextResponse.json(mappedSettings);
  } catch (error) {
    console.error('❌ Erreur PUT settings LANATIONDULAIT:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour des paramètres' },
      { status: 500 }
    );
  }
}