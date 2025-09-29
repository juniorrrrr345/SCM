'use client';
import { useEffect } from 'react';

// Hook pour synchroniser la boutique avec les changements admin
export function useAdminSync(onDataUpdate: () => void) {
  useEffect(() => {
    // Écouter les changements de localStorage (quand l'admin fait des changements)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin-update') {
        console.log('🔄 Changement admin détecté, rechargement...');
        onDataUpdate();
      }
    };

    // Écouter les changements de focus (quand on revient sur l'onglet)
    const handleFocus = () => {
      console.log('👁️ Focus détecté, rechargement...');
      onDataUpdate();
    };

    // Écouter les changements de visibilité
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page visible, rechargement...');
        onDataUpdate();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Rechargement périodique optimisé pour synchronisation
    const interval = setInterval(() => {
      onDataUpdate();
    }, 30000); // Toutes les 30 secondes - Optimisé

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [onDataUpdate]);
}

// Fonction utilitaire pour notifier les changements depuis l'admin
export function notifyAdminUpdate(type: string, action: string, data: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin-update', JSON.stringify({
      type,
      action,
      data,
      timestamp: Date.now()
    }));
    
    // Déclencher l'événement storage manuellement
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'admin-update',
      newValue: JSON.stringify({ type, action, data, timestamp: Date.now() })
    }));
  }
}