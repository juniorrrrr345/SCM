'use client';

import { useEffect, useRef } from 'react';

export default function GlobalBackgroundProvider() {
  const lastSettingsRef = useRef<string>('');
  
  useEffect(() => {
    // Fonction optimisée pour appliquer le background
    const applyBackground = (settings: any, force = false) => {
      // Éviter les re-applications inutiles
      const settingsString = JSON.stringify(settings);
      if (!force && settingsString === lastSettingsRef.current) {
        return;
      }
      lastSettingsRef.current = settingsString;
      
      const backgroundImage = settings?.backgroundImage || '';
      const backgroundOpacity = settings?.backgroundOpacity || 20;
      const backgroundBlur = settings?.backgroundBlur || 5;
      
      // Configuration du background
      const bgStyle = backgroundImage ? `
        background-image: url(${backgroundImage});
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;
        background-color: black;
      ` : `
        background-image: none;
        background-color: black;
      `;
      
      // Créer ou mettre à jour la feuille de style
      let styleElement = document.getElementById('dynamic-background-style');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'dynamic-background-style';
        document.head.appendChild(styleElement);
      }
      
      // Appliquer les styles globalement
      styleElement.textContent = `
        html, body, .main-container {
          ${bgStyle}
        }
        
        .global-overlay {
          background-color: rgba(0, 0, 0, ${backgroundImage ? backgroundOpacity / 100 : 0.2});
          backdrop-filter: blur(${backgroundImage ? backgroundBlur : 2}px);
          -webkit-backdrop-filter: blur(${backgroundImage ? backgroundBlur : 2}px);
          display: block;
        }
      `;
    };
    
    // 1. Charger depuis localStorage immédiatement
    try {
      const cachedSettings = localStorage.getItem('shopSettings');
      if (cachedSettings) {
        const settings = JSON.parse(cachedSettings);
        applyBackground(settings, true);
      }
    } catch (e) {
      console.error('Erreur parsing settings cache:', e);
    }
    
    // 2. Charger depuis l'API
    let mounted = true;
    fetch('/api/settings', { 
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    })
      .then(res => res.json())
      .then(settings => {
        if (!mounted) return;
        localStorage.setItem('shopSettings', JSON.stringify(settings));
        applyBackground(settings);
      })
      .catch(error => {
        console.error('Erreur chargement settings:', error);
      });
    
    // 3. Synchronisation temps réel des settings depuis l'API
    const loadSettingsFromAPI = async () => {
      try {
        const response = await fetch('/api/cloudflare/settings', { cache: 'no-store' });
        if (response.ok) {
          const settings = await response.json();
          localStorage.setItem('shopSettings', JSON.stringify(settings));
          applyBackground(settings, true);
        }
      } catch (error) {
        console.error('Erreur chargement settings API:', error);
      }
    };
    
    // Recharger les settings toutes les secondes pour instantané
    const settingsInterval = setInterval(loadSettingsFromAPI, 30000);
    
    // 4. Écouter les changements de settings
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shopSettings' && e.newValue) {
        try {
          const settings = JSON.parse(e.newValue);
          applyBackground(settings);
        } catch (error) {
          console.error('Erreur mise à jour fond:', error);
        }
      }
    };
    
    // 4. Écouter les mises à jour depuis le panel admin
    const handleSettingsUpdate = (event: CustomEvent) => {
      const settings = event.detail;
      localStorage.setItem('shopSettings', JSON.stringify(settings));
      applyBackground(settings, true);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settingsUpdated' as any, handleSettingsUpdate as any);
    
    return () => {
      mounted = false;
      clearInterval(settingsInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settingsUpdated' as any, handleSettingsUpdate as any);
    };
  }, []);
  
  return null;
}