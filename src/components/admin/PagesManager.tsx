'use client';

import { useState, useEffect } from 'react';

interface PageContent {
  slug: string;
  title: string;
  content: string;
}

export default function PagesManager() {
  const [activeTab, setActiveTab] = useState<'info' | 'contact'>('info');
  const [pageContent, setPageContent] = useState({
    info: { title: 'Page Info', content: '' },
    contact: { title: 'Page Contact', content: '' }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Charger les pages
  const loadPages = async () => {
    try {
      setIsLoading(true);
      console.log('📄 Chargement des pages...');
      
      const [infoRes, contactRes] = await Promise.all([
        fetch('/api/cloudflare/pages/info').catch(err => {
          console.error('Erreur fetch info:', err);
          return { ok: false, json: () => ({ title: 'À propos', content: '' }) };
        }),
        fetch('/api/cloudflare/pages/contact').catch(err => {
          console.error('Erreur fetch contact:', err);
          return { ok: false, json: () => ({ title: 'Contact', content: '' }) };
        })
      ]);
      
      console.log('Réponses API:', { info: infoRes.ok, contact: contactRes.ok });
      
      const [infoData, contactData] = await Promise.all([
        infoRes.json(),
        contactRes.json()
      ]);
      
      console.log('Données reçues:', { 
        info: infoData.title, 
        contact: contactData.title 
      });
      
      setPageContent({
        info: {
          title: infoData.title || 'À propos',
          content: infoData.content || ''
        },
        contact: {
          title: contactData.title || 'Contact',
          content: contactData.content || ''
        }
      });
    } catch (error) {
      console.error('❌ Erreur chargement pages:', error);
      setSaveStatus('❌ Erreur de chargement');
      
      // Définir des valeurs par défaut en cas d'erreur
      setPageContent({
        info: { title: 'À propos', content: '' },
        contact: { title: 'Contact', content: '' }
      });
      
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder
  const savePage = async () => {
    try {
      setIsSaving(true);
      setSaveStatus('Sauvegarde en cours...');
      
      const page = pageContent[activeTab];
      
      const response = await fetch(`/api/cloudflare/pages/${activeTab}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          slug: activeTab,
          title: page.title,
          content: page.content,
          is_active: true
        })
      });
      
      const result = await response.json();
      
      console.log('📝 Réponse sauvegarde page:', result);
      
      if (response.ok) {
        // Si la réponse HTTP est OK, c'est un succès
        setSaveStatus('✅ Sauvegardé avec succès !');
        
        // Invalider le cache et revalider les pages
        try {
          await fetch('/api/cache/invalidate', { method: 'POST' });
          await fetch('/api/revalidate', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: `/${activeTab}` })
          });
          console.log('✅ Cache invalidé et page revalidée');
        } catch (e) {
          console.log('Cache/revalidation skipped:', e);
        }
        
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus(`❌ Erreur: ${result.error || 'Erreur de sauvegarde'}`);
        setTimeout(() => setSaveStatus(''), 5000);
      }
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      setSaveStatus(`❌ Erreur: ${error.message || 'Erreur de connexion'}`);
      setTimeout(() => setSaveStatus(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Mettre à jour contenu
  const updateContent = (field: 'title' | 'content', value: string) => {
    setPageContent(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [field]: value }
    }));
  };

  useEffect(() => {
    loadPages();
    
    // Timeout de sécurité pour éviter le chargement infini
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ Chargement trop long, forçage arrêt');
        setIsLoading(false);
        setSaveStatus('⚠️ Chargement interrompu');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    }, 10000); // 10 secondes max
    
    return () => clearTimeout(timeout);
  }, []);

  const currentPage = pageContent[activeTab];

  if (isLoading) {
    return (
      <div className="bg-black/50 backdrop-blur-md rounded-lg p-6 border border-white/10">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-gray-400 mt-4">Chargement des pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/50 backdrop-blur-md rounded-lg p-6 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6">📄 Gestion des Pages</h2>

      {/* Onglets */}
      <div className="flex space-x-4 mb-6 border-b border-white/20">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'info' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          📖 Page Info
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'contact' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          📞 Page Contact
        </button>
      </div>

      {/* Formulaire */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Titre</label>
          <input
            type="text"
            value={currentPage.title}
            onChange={(e) => updateContent('title', e.target.value)}
            className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white focus:border-white/40 focus:outline-none transition-colors"
            placeholder="Titre de la page"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Contenu (Markdown supporté)
          </label>
          <div className="text-xs text-gray-400 mb-2">
            Utilisez # pour les titres, ** pour le gras, * pour l'italique, - pour les listes
          </div>
          <textarea
            value={currentPage.content}
            onChange={(e) => updateContent('content', e.target.value)}
            rows={15}
            className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white font-mono text-sm focus:border-white/40 focus:outline-none transition-colors"
            placeholder="Contenu de la page..."
          />
        </div>

        {/* Status et Actions */}
        <div className="flex items-center justify-between pt-4">
          <div>
            {saveStatus && (
              <span className={`text-sm ${
                saveStatus.includes('✅') ? 'text-green-400' : 
                saveStatus.includes('❌') ? 'text-red-400' : 
                'text-yellow-400'
              }`}>
                {saveStatus}
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadPages}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              🔄 Actualiser
            </button>
            <button
              onClick={savePage}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}