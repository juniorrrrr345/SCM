'use client';
import { useState, useEffect } from 'react';
import { notifyAdminUpdate } from '../../hooks/useAdminSync';

interface SocialLink {
  id?: number;
  name: string;
  url: string;
  icon: string;
  color: string;
  is_active: boolean;
}

export default function SocialLinksManager() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [formData, setFormData] = useState<Partial<SocialLink>>({
    name: '',
    url: '',
    icon: '',
    color: '#0088cc'
  });

  useEffect(() => {
    loadSocialLinks();
  }, []);

  const loadSocialLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cloudflare/social-links');
      if (response.ok) {
        const data = await response.json();
        
        // Adapter les données API (id → _id) pour compatibilité interface
        const adaptedData = data.map((link: any) => ({
          ...link,
          _id: link.id?.toString() || link._id
        }));
        
        console.log('🌐 Liens sociaux adaptés:', adaptedData);
        setSocialLinks(adaptedData);
        
        // Sauvegarder dans localStorage pour chargement instantané
        localStorage.setItem('socialLinks', JSON.stringify(adaptedData));
      }
    } catch (error) {
      console.error('Erreur chargement liens sociaux:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (link: SocialLink) => {
    setEditingLink(link);
    setFormData(link);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingLink(null);
    setFormData({
      name: '',
      url: '',
      icon: '',
      color: '#0088cc',
      isActive: true
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.name?.trim() || !formData.url?.trim() || !formData.icon?.trim()) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const url = editingLink ? `/api/cloudflare/social-links/${editingLink._id}` : '/api/cloudflare/social-links';
      const method = editingLink ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: formData.name, // L'API attend 'platform' pas 'name'
          url: formData.url,
          icon: formData.icon,
          is_available: true // L'API attend 'is_available' pas 'is_active'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Afficher message de succès
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successMsg.textContent = `✅ ${editingLink ? 'Réseau social modifié' : 'Réseau social ajouté'} avec succès!`;
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
          successMsg.remove();
        }, 3000);
        
                  setShowModal(false);
          
          // Invalider le cache et revalider les pages
          try {
            await fetch('/api/cache/invalidate', { method: 'POST' });
            await fetch('/api/revalidate', { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ path: '/social' })
            });
            console.log('✅ Cache invalidé et page sociale revalidée');
          } catch (error) {
            console.error('Erreur invalidation cache:', error);
          }
          
          // Recharger les données
          loadSocialLinks();

      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || 'Erreur lors de la sauvegarde'}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (linkId: string, linkName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${linkName}" ?`)) {
      try {
        // Suppression optimiste - retirer immédiatement de l'interface
        const originalLinks = [...socialLinks];
        setSocialLinks(prev => prev.filter(link => link._id !== linkId));

        const response = await fetch(`/api/cloudflare/social-links/${linkId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          console.log('✅ Suppression réussie pour:', linkName);
          
          // Vider TOUS les caches pour éviter les réapparitions
          localStorage.removeItem('socialLinks');
          localStorage.removeItem('adminData');
          sessionStorage.clear();
          
          // Forcer un rechargement depuis l'API
          setTimeout(() => {
            loadSocialLinks();
          }, 500);
          
          // Afficher message de succès
          const successMsg = document.createElement('div');
          successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
          successMsg.textContent = `✅ "${linkName}" supprimé avec succès!`;
          document.body.appendChild(successMsg);
          
          setTimeout(() => {
            successMsg.remove();
          }, 3000);
        } else {
          // Restaurer en cas d'erreur
          setSocialLinks(originalLinks);
          const error = await response.json();
          alert(`Erreur: ${error.error || 'Erreur lors de la suppression'}`);
        }
      } catch (error) {
        console.error('Erreur:', error);
        // Restaurer en cas d'erreur
        setSocialLinks(prev => [...prev]);
        loadSocialLinks();
        alert('Erreur lors de la suppression');
      }
    }
  };

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const iconOptions = [
    { value: '📱', label: '📱 Telegram' },
    { value: '📷', label: '📷 Instagram' },
    { value: '💬', label: '💬 WhatsApp' },
    { value: '🎮', label: '🎮 Discord' },
    { value: '📘', label: '📘 Facebook' },
    { value: '🐦', label: '🐦 Twitter/X' },
    { value: '📺', label: '📺 YouTube' },
    { value: '💼', label: '💼 LinkedIn' },
    { value: '🎵', label: '🎵 TikTok' },
    { value: '📧', label: '📧 Email' },
    { value: '📞', label: '📞 Téléphone' },
    { value: '🌐', label: '🌐 Site web' },
    { value: '🔗', label: '🔗 Lien personnalisé' },
    { value: '📍', label: '📍 Localisation' },
    { value: '🎯', label: '🎯 Autre' },
  ];

  const colorPresets = [
    { name: 'Telegram', color: '#0088cc' },
    { name: 'Instagram', color: '#E4405F' },
    { name: 'WhatsApp', color: '#25D366' },
    { name: 'Discord', color: '#7289DA' },
    { name: 'Facebook', color: '#1877F2' },
    { name: 'Twitter/X', color: '#1DA1F2' },
    { name: 'YouTube', color: '#FF0000' },
    { name: 'LinkedIn', color: '#0077B5' },
    { name: 'TikTok', color: '#FE2C55' },
    { name: 'Personnalisé', color: '#6B7280' },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Gestion des Réseaux Sociaux</h1>
        <button
          onClick={handleAdd}
          className="bg-white hover:bg-gray-100 text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <span>➕</span>
          <span>Ajouter un lien</span>
        </button>
      </div>

      {/* Liste des liens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {socialLinks.map((link) => (
          <div key={link._id} className="bg-gray-900/50 border border-white/20 rounded-xl p-4 sm:p-6 hover:bg-gray-900/70 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3 flex-1">
                <div 
                  className="flex items-center justify-center w-12 h-12 rounded-lg"
                  style={{ backgroundColor: link.color + '20', border: `2px solid ${link.color}40` }}
                >
                  <span className="text-2xl">{link.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-lg truncate">{link.name}</h3>
                  <p className="text-gray-400 text-sm truncate" title={link.url}>{link.url}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: link.color }}
                    ></div>
                    <span className="text-gray-500 text-xs">{link.color}</span>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Aperçu du lien */}
            <div className="mb-4 p-3 bg-black/40 rounded-lg border border-white/10">
              <div className="flex items-center space-x-3 text-white">
                <span className="text-lg">{link.icon}</span>
                <span className="font-medium text-sm">{link.name}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(link)}
                className="flex-1 bg-gray-700/50 hover:bg-gray-600/70 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 border border-white/10 hover:border-white/20"
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => handleDelete(link._id!, link.name)}
                className="bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 border border-red-600/40 hover:border-red-600/60"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {/* Carte d'ajout */}
        <div 
          onClick={handleAdd}
          className="bg-gray-900/30 border-2 border-dashed border-white/30 rounded-xl p-6 hover:bg-gray-900/50 hover:border-white/50 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[280px] group"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all duration-300">
              <span className="text-2xl">➕</span>
            </div>
            <h3 className="text-white font-medium mb-2">Ajouter un réseau social</h3>
            <p className="text-gray-400 text-sm">Créez un nouveau lien personnalisé</p>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-start justify-center p-2 sm:p-4 z-[9999] overflow-y-auto lg:items-center">
          <div className="bg-gray-900 border-0 sm:border border-white/20 rounded-none sm:rounded-xl w-full max-w-lg my-0 sm:my-4 backdrop-blur-sm min-h-screen sm:min-h-0">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-white/20 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {editingLink ? '✏️ Modifier le réseau social' : '➕ Ajouter un réseau social'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="sm:hidden p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du réseau social *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateFormField('name', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Ex: Telegram PLUG"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lien URL *
                </label>
                <input
                  type="url"
                  value={formData.url || ''}
                  onChange={(e) => updateFormField('url', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="https://t.me/plugchannel"
                />
              </div>

              {/* Icône */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Emoji du réseau *
                </label>
                <div className="space-y-2">
                  {/* Input pour emoji personnalisé */}
                  <input
                    type="text"
                    value={formData.icon || ''}
                    onChange={(e) => updateFormField('icon', e.target.value)}
                    className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 text-center text-2xl"
                    placeholder="Entrez un emoji"
                    maxLength={5}
                  />
                  <p className="text-xs text-gray-400">Tapez directement un emoji ou choisissez ci-dessous</p>
                  
                  {/* Emojis suggérés */}
                  <div className="grid grid-cols-8 gap-1">
                    {iconOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateFormField('icon', option.value)}
                        className={`p-2 rounded hover:bg-gray-700 transition-colors ${formData.icon === option.value ? 'bg-gray-700 ring-2 ring-white' : ''}`}
                        title={option.label}
                      >
                        <span className="text-xl">{option.value}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Couleur */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Couleur du thème
                </label>
                
                {/* Couleurs prédéfinies */}
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => updateFormField('color', preset.color)}
                      className={`w-full h-10 rounded-lg border-2 transition-all duration-200 ${
                        formData.color === preset.color 
                          ? 'border-white scale-110' 
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    >
                      {formData.color === preset.color && (
                        <span className="text-white text-sm">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Sélecteur de couleur personnalisé */}
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.color || '#0088cc'}
                    onChange={(e) => updateFormField('color', e.target.value)}
                    className="w-16 h-10 bg-gray-800 border border-white/20 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color || '#0088cc'}
                    onChange={(e) => updateFormField('color', e.target.value)}
                    className="flex-1 bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="#0088cc"
                  />
                </div>
              </div>



              {/* Aperçu en temps réel */}
              {formData.name && formData.icon && (
                <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                  <p className="text-gray-300 text-sm mb-3">Aperçu en temps réel :</p>
                  
                  {/* Aperçu style ContactPage */}
                  <div 
                    className="flex items-center justify-center p-3 rounded-lg border transition-all duration-300 hover:bg-white/10"
                    style={{ 
                      borderColor: (formData.color || '#0088cc') + '40',
                      backgroundColor: (formData.color || '#0088cc') + '10'
                    }}
                  >
                    <span className="text-lg mr-2">{formData.icon}</span>
                    <span className="font-medium text-white">{formData.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-white/20 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleSave}
                className="bg-white hover:bg-gray-100 text-black font-bold py-3 px-6 rounded-lg flex-1 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                💾 {editingLink ? 'Sauvegarder' : 'Créer'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-700/50 hover:bg-gray-600/70 text-white font-bold py-3 px-6 rounded-lg border border-white/20 hover:border-white/40 transition-all duration-200"
              >
                ❌ Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}