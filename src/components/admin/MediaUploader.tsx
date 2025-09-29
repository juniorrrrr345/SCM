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
  acceptedTypes = "image/*,video/*,.mov,.avi,.3gp",
  maxSize = 10, // Limite par défaut réduite
  className = ""
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille selon le type de fichier
    const isVideo = file.type.startsWith('video/');
    const actualMaxSize = isVideo ? 10 : 5; // 10MB pour vidéos, 5MB pour images
    const maxBytes = actualMaxSize * 1024 * 1024;
    
    if (file.size > maxBytes) {
      setError(`Fichier trop volumineux: ${Math.round(file.size / 1024 / 1024)}MB. Maximum ${actualMaxSize}MB pour ${isVideo ? 'les vidéos' : 'les images'}.`);
      return;
    }
    
    // Vérification supplémentaire pour éviter les erreurs MongoDB
    if (isVideo && file.size > 8 * 1024 * 1024) {
      setError(`Vidéo trop volumineuse (${Math.round(file.size / 1024 / 1024)}MB). Utilisez max 8MB pour éviter les erreurs de base de données.`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      console.log('🚀 Début upload client:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/cloudflare/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Réponse serveur:', response.status);

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
      console.error('❌ Erreur upload client:', error);
      setError(error instanceof Error ? error.message : 'Erreur upload inconnue');
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
            ? 'Images (5MB) & Vidéos (10MB) - MP4, MOV, WebM'
            : acceptedTypes.includes('video')
            ? 'Vidéos (max 10MB) - MP4, MOV, WebM'
            : 'Images (max 5MB) - JPG, PNG, WebP'
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