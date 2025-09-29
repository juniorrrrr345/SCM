import { NextRequest, NextResponse } from 'next/server';
import r2Client from '../../../../lib/cloudflare-r2';

// POST - Upload d'image vers Cloudflare R2
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'images';

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier (images + vidéos)
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv'];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Images: JPG, PNG, GIF, WebP. Vidéos: MP4, WebM, OGG, AVI, MOV, WMV.' },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier (images: 10MB, vidéos: 500MB)
    const isVideo = allowedVideoTypes.includes(file.type);
    const maxSize = isVideo ? 500 * 1024 * 1024 : 10 * 1024 * 1024; // 500MB pour vidéos, 10MB pour images
    
    if (file.size > maxSize) {
      const maxSizeText = isVideo ? '500MB' : '10MB';
      return NextResponse.json(
        { error: `Fichier trop volumineux. Taille maximale: ${maxSizeText}.` },
        { status: 400 }
      );
    }

    // Upload vers R2 (images ou vidéos)
    const mediaUrl = isVideo 
      ? await r2Client.uploadVideo(file, folder)
      : await r2Client.uploadImage(file, folder);

    return NextResponse.json({
      success: true,
      url: mediaUrl,
      secure_url: mediaUrl, // Pour compatibilité avec Cloudinary
      public_id: mediaUrl.split('/').pop(), // Pour compatibilité
      resource_type: isVideo ? 'video' : 'image', // Type de média
      format: file.name.split('.').pop(), // Extension du fichier
    });

  } catch (error) {
    console.error('Erreur upload R2:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'upload' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une image de R2
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL de l\'image requise' },
        { status: 400 }
      );
    }

    // Extraire la clé de l'URL
    const key = imageUrl.split('/').slice(-2).join('/'); // ex: images/timestamp-id.jpg
    
    const success = await r2Client.deleteFile(key);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Impossible de supprimer l\'image' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur suppression R2:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression' },
      { status: 500 }
    );
  }
}