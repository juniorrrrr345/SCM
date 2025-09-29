import { useEffect } from 'react';
import { instantContent } from '../lib/contentCache';

export const useGlobalBackground = () => {
  useEffect(() => {
    const applyBackground = () => {
      const settings = instantContent.getSettings();
      const backgroundImage = settings?.backgroundImage || '';
      const backgroundOpacity = settings?.backgroundOpacity || 20;
      const backgroundBlur = settings?.backgroundBlur || 5;

      // Configuration normale - couvre toute la boutique
      const normalConfig = {
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      };

      // Appliquer le background sur HTML
      const htmlElement = document.documentElement;
      if (backgroundImage) {
        htmlElement.style.backgroundImage = `url(${backgroundImage})`;
        htmlElement.style.backgroundSize = normalConfig.backgroundSize;
        htmlElement.style.backgroundPosition = normalConfig.backgroundPosition;
        htmlElement.style.backgroundAttachment = normalConfig.backgroundAttachment;
        htmlElement.style.backgroundRepeat = normalConfig.backgroundRepeat;
      } else {
        htmlElement.style.backgroundImage = '';
      }
      htmlElement.style.backgroundColor = 'black';

      // Appliquer le background sur BODY
      const bodyElement = document.body;
      if (backgroundImage) {
        bodyElement.style.backgroundImage = `url(${backgroundImage})`;
        bodyElement.style.backgroundSize = normalConfig.backgroundSize;
        bodyElement.style.backgroundPosition = normalConfig.backgroundPosition;
        bodyElement.style.backgroundAttachment = normalConfig.backgroundAttachment;
        bodyElement.style.backgroundRepeat = normalConfig.backgroundRepeat;
      } else {
        bodyElement.style.backgroundImage = '';
      }
      bodyElement.style.backgroundColor = 'black';

      // Mettre à jour l'overlay global s'il existe
      const overlayElement = document.querySelector('.global-overlay') as HTMLElement;
      if (overlayElement && backgroundImage) {
        overlayElement.style.backgroundColor = `rgba(0, 0, 0, ${backgroundOpacity / 100})`;
        overlayElement.style.backdropFilter = `blur(${backgroundBlur}px)`;
        overlayElement.style.display = 'block';
      } else if (overlayElement) {
        overlayElement.style.display = 'none';
      }

      // Appliquer sur tous les conteneurs principaux
      const mainContainers = document.querySelectorAll('.main-container');
      mainContainers.forEach((container) => {
        const element = container as HTMLElement;
        if (backgroundImage) {
          element.style.backgroundImage = `url(${backgroundImage})`;
          element.style.backgroundSize = normalConfig.backgroundSize;
          element.style.backgroundPosition = normalConfig.backgroundPosition;
          element.style.backgroundAttachment = normalConfig.backgroundAttachment;
          element.style.backgroundRepeat = normalConfig.backgroundRepeat;
        } else {
          element.style.backgroundImage = '';
        }
        element.style.backgroundColor = 'black';
      });
    };

    // Appliquer IMMÉDIATEMENT sans délai
    applyBackground();

    // Observer les changements du cache moins fréquemment
    const intervalId = setInterval(() => {
      applyBackground();
    }, 5000); // Moins fréquent pour éviter les recharges

    // Écouter les changements de taille de fenêtre
    const handleResize = () => {
      applyBackground();
    };
    window.addEventListener('resize', handleResize);

    // Nettoyage
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
};