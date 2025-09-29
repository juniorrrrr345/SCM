'use client';
import { useState, useEffect } from 'react';
import AdminLogin from '../../components/admin/AdminLogin';
import AdminDashboard from '../../components/admin/AdminDashboard';
import contentCache from '../../lib/contentCache';

export default function AdminPage() {
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backgroundSettings, setBackgroundSettings] = useState({
    backgroundImage: '',
    backgroundOpacity: 20,
    backgroundBlur: 5
  });

  useEffect(() => {
    // Charger depuis le cache instantané
    const loadData = async () => {
      try {
              await contentCache.initialize();
      const settings = contentCache.getSettings();
        
        setBackgroundSettings({
          backgroundImage: settings?.backgroundImage || '',
          backgroundOpacity: settings?.backgroundOpacity || 20,
          backgroundBlur: settings?.backgroundBlur || 5
        });
        
        // NE PAS auto-connecter - toujours demander le mot de passe
        // Supprimer l'ancien token pour forcer la reconnexion
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur chargement admin:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleLogin = (success: boolean) => {
    if (success) {
      localStorage.setItem('adminToken', 'authenticated');
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  // Style de background identique aux autres pages
  const getBackgroundStyle = () => {
    if (!backgroundSettings.backgroundImage) {
      return { backgroundColor: 'black' };
    }
    
    return {
      backgroundColor: 'black',
      backgroundImage: `url(${backgroundSettings.backgroundImage})`,
      backgroundSize: 'auto',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'repeat'
    };
  };

  const overlayStyle = backgroundSettings.backgroundImage 
    ? {
        backgroundColor: `rgba(0, 0, 0, ${backgroundSettings.backgroundOpacity / 100})`,
        backdropFilter: `blur(${backgroundSettings.backgroundBlur}px)`
      }
    : {};

  return (
    <div className="main-container">
      {/* Overlay global */}
      <div className="global-overlay"></div>
      
      <div className="content-layer">
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : isAuthenticated ? (
          <AdminDashboard onLogout={handleLogout} />
        ) : (
          <AdminLogin onLogin={handleLogin} />
        )}
      </div>
    </div>
  );
}