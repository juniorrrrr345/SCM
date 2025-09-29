'use client';
import { useState } from 'react';

interface MediaUploaderProps {
  onMediaSelected: (url: string, type: 'image' | 'video') => void;
  acceptedTypes?: string;
  maxSize?: number;
  className?: string;
}

export default function MediaUploader({ 
  onMediaSelected, 
  acceptedTypes = "image/*,video/*,.mov,.avi,.3gp,.mkv,.flv,.m4v,.wmv,.webm,.mp4,.ogg",
  maxSize = 500, // Limite par défaut pour vidéos (correspond à l'API)
  className = ""
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille selon le type de fichier (Cloudflare R2 limites)
    const isVideo = file.type.startsWith('video/');
    const actualMaxSize = isVideo ? 500 : 10; // 500MB pour vidéos, 10MB pour images
    const maxBytes = actualMaxSize * 1024 * 1024;
    
    if (file.size > maxBytes) {
      setError(`Fichier trop volumineux: ${Math.round(file.size / 1024 / 1024)}MB. Maximum ${actualMaxSize}MB pour ${isVideo ? 'les vidéos' : 'les images'}.`);
      return;
    }

    // AUCUNE LIMITE DE DURÉE - VIDÉOS ILLIMITÉES
    console.log('🎥 Upload vidéo sans limite de durée:', {
      name: file.name,
      size: `${Math.round(file.size / 1024 / 1024 * 100) / 100}MB`,
      type: file.type
    });

    // NOUVEAU: Détection résolution vidéo pour debug
    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        console.log('🎬 RÉSOLUTION VIDÉO DÉTECTÉE:', {
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
          ratio: `${video.videoWidth}x${video.videoHeight}`,
          is480p: video.videoHeight >= 480,
          isHD: video.videoHeight >= 720,
          fileName: file.name
        });
        
        // Alerter SEULEMENT pour les très hautes résolutions (720p+)
        if (video.videoHeight >= 720) {
          console.warn('⚠️ TRÈS HAUTE RÉSOLUTION DÉTECTÉE! Cela va probablement échouer.');
          
          // Afficher un avertissement à l'utilisateur pour 720p+
          setError(`⚠️ Vidéo très haute résolution (${video.videoWidth}x${video.videoHeight}). Risque d'échec d'upload élevé.`);
          
          setTimeout(() => {
            if (confirm(`Votre vidéo est en ${video.videoWidth}x${video.videoHeight} (très haute résolution).\n\nCela va probablement échouer sur le plan gratuit Vercel.\n\nRecommandation: réduisez à 480p max.\n\nVoulez-vous continuer quand même ?`)) {
              setError(''); // Effacer l'avertissement si l'utilisateur veut continuer
            } else {
              setUploading(false);
              return;
            }
          }, 100);
        } else if (video.videoHeight >= 480) {
          // Juste un log pour 480p, mais pas de blocage
          console.log('📱 Résolution 480p détectée - devrait passer avec 2GB RAM');
        }
      };
      
      video.src = URL.createObjectURL(file);
    }

    setUploading(true);
    setError('');

    try {
      console.log('🚀 Début upload client:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        webkitRelativePath: file.webkitRelativePath
      });
      
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('📦 FormData créé, envoi vers API...');

      const response = await fetch('/api/cloudflare/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Réponse serveur:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur serveur:', errorData);
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Upload réussi:', result);
      
      // Déterminer le type depuis resource_type ou depuis le nom du fichier
      const mediaType = result.resource_type === 'video' ? 'video' : 'image';
      
      onMediaSelected(result.url, mediaType);
      
      // Reset l'input
      event.target.value = '';
      
    } catch (error) {
      console.error('❌ ERREUR UPLOAD CLIENT COMPLÈTE:', {
        error: error,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : 'Pas de stack',
        name: error instanceof Error ? error.name : 'Type inconnu',
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });
      
      // Détection spécifique erreur pattern
      let errorMsg = 'Erreur upload inconnue';
      if (error instanceof Error) {
        errorMsg = error.message;
        
        if (error.message.includes('string did not match the expected pattern')) {
          console.error('🎯 ERREUR PATTERN DÉTECTÉE!', {
            fileName: file.name,
            fileType: file.type,
            containsSpecialChars: /[<>"'`\n\r\t]/.test(file.name),
            isValidUTF8: /^[\x00-\x7F]*$/.test(file.name),
            nameLength: file.name.length,
            actualName: JSON.stringify(file.name)
          });
          errorMsg = `Erreur de format de fichier. Nom du fichier problématique: "${file.name}". Essayez de renommer votre fichier sans caractères spéciaux.`;
        }
      }
      
      setError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`media-uploader ${className}`}>
      <div className="flex items-center gap-2">
        <label className={`
          inline-flex items-center px-4 py-2 border border-gray-600 rounded-lg 
          bg-gray-700 hover:bg-gray-600 text-white cursor-pointer transition-colors
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <input
            type="file"
            className="hidden"
            accept={acceptedTypes}
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Upload...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Choisir un fichier
            </>
          )}
        </label>
        
        <span className="text-sm text-gray-400">
          {acceptedTypes.includes('video') && acceptedTypes.includes('image') 
            ? 'Images (10MB) & Vidéos (500MB) - Tous formats supportés'
            : acceptedTypes.includes('video')
            ? 'Vidéos (max 500MB) - MP4, MOV, WebM, AVI, MKV, etc.'
            : 'Images (max 10MB) - JPG, PNG, WebP, GIF'
          }
        </span>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded border border-red-500">
          {error}
        </div>
      )}
    </div>
  );
}