'use client';

import { useEffect } from 'react';

export default function CachePreloader() {
  useEffect(() => {
    // Précharger toutes les données importantes en arrière-plan
    const preloadData = async () => {
      try {
        // Charger les données en parallèle
        const promises = [
          fetch('/api/products', { cache: 'no-store' }),
          fetch('/api/categories', { cache: 'no-store' }),
          // farms supprimé
          fetch('/api/settings', { cache: 'no-store' }),
          fetch('/api/social-links', { cache: 'no-store' }),
          fetch('/api/pages/info', { cache: 'no-store' }),
          fetch('/api/pages/contact', { cache: 'no-store' })
        ];

        const results = await Promise.allSettled(promises);
        
        // Sauvegarder les réseaux sociaux dans localStorage
        const socialLinksResult = results[4];
        if (socialLinksResult.status === 'fulfilled' && socialLinksResult.value.ok) {
          const socialLinks = await socialLinksResult.value.json();
          localStorage.setItem('socialLinks', JSON.stringify(socialLinks));
        }
        
        console.log('✅ Données préchargées avec succès');
      } catch (error) {
        console.error('Erreur préchargement:', error);
      }
    };

    // Lancer le préchargement immédiatement
    preloadData();
  }, []);

  return null;
}