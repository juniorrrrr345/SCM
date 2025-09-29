'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import InfoPage from '@/components/InfoPage';

export default function InfoPageClient() {
  const [content, setContent] = useState('Chargement du contenu...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
    // Synchronisation temps réel INSTANTANÉE
    const interval = setInterval(loadContent, 1000); // 1 seconde pour instantané
    return () => clearInterval(interval);
  }, []);

  const loadContent = async () => {
    try {
      const response = await fetch('/api/cloudflare/pages/info', { cache: 'no-store' });
      
      if (response.ok) {
        const pageData = await response.json();
        setContent(pageData.content || 'Bienvenue chez LANATION DU LAIT !');
      } else {
        setContent('Bienvenue chez LANATION DU LAIT !');
      }
    } catch (error) {
      setContent('Bienvenue chez LANATION DU LAIT !');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen loading-screen bg-black flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="global-overlay"></div>
      <div className="content-layer">
        <Header />
        <InfoPage content={content} />
        <BottomNav />
      </div>
    </div>
  );
}