'use client';
import { useState, useEffect } from 'react';

interface ServiceLinks {
  livraison: string;
  envoi: string;
  meetup: string;
}

interface ServiceSchedules {
  livraison_schedules: string[];
  meetup_schedules: string[];
  envoi_schedules: string[];
}

interface Settings extends ServiceLinks {
  // Autres paramètres existants
  shopTitle?: string;
  whatsappLink?: string;
  titleStyle?: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  backgroundBlur?: number;
  scrollingText?: string;
}

export default function ServiceLinksManager() {
  const [serviceLinks, setServiceLinks] = useState<ServiceLinks>({
    livraison: '',
    envoi: '',
    meetup: ''
  });
  const [serviceSchedules, setServiceSchedules] = useState<ServiceSchedules>({
    livraison_schedules: ['Matin (9h-12h)', 'Après-midi (14h-17h)', 'Soirée (17h-20h)', 'Flexible (à convenir)'],
    meetup_schedules: ['Lundi au Vendredi (9h-18h)', 'Weekend (10h-17h)', 'Soirée en semaine (18h-21h)', 'Flexible (à convenir)'],
    envoi_schedules: ['Envoi sous 24h', 'Envoi sous 48h', 'Envoi express', 'Délai à convenir']
  });
  const [newScheduleInput, setNewScheduleInput] = useState({
    livraison: '',
    meetup: '',
    envoi: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadServiceLinks();
  }, []);

  const loadServiceLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cloudflare/settings');
      if (response.ok) {
        const data = await response.json();
        console.log('📱 Liens de service reçus:', data);
        
        setServiceLinks({
          livraison: data.telegram_livraison || data.livraison || '',
          envoi: data.telegram_envoi || data.envoi || '',
          meetup: data.telegram_meetup || data.meetup || ''
        });
        
        // Charger les horaires personnalisés
        setServiceSchedules({
          livraison_schedules: data.livraison_schedules || ['Matin (9h-12h)', 'Après-midi (14h-17h)', 'Soirée (17h-20h)', 'Flexible (à convenir)'],
          meetup_schedules: data.meetup_schedules || ['Lundi au Vendredi (9h-18h)', 'Weekend (10h-17h)', 'Soirée en semaine (18h-21h)', 'Flexible (à convenir)'],
          envoi_schedules: data.envoi_schedules || ['Envoi sous 24h', 'Envoi sous 48h', 'Envoi express', 'Délai à convenir']
        });
        
        console.log('⏰ Horaires chargés dans ServiceLinksManager:', {
          livraison_schedules: data.livraison_schedules,
          meetup_schedules: data.meetup_schedules,
          envoi_schedules: data.envoi_schedules
        });
        console.log('📱 Liens chargés dans ServiceLinksManager:', {
          telegram_livraison: data.telegram_livraison,
          telegram_envoi: data.telegram_envoi,
          telegram_meetup: data.telegram_meetup
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des liens de service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);
      setMessage('');
      console.log('🔄 Sauvegarde des liens de service:', serviceLinks);
      
      // Charger d'abord les settings existants
      const currentResponse = await fetch('/api/cloudflare/settings');
      let currentSettings = {};
      if (currentResponse.ok) {
        currentSettings = await currentResponse.json();
      }
      
      // Fusionner avec les nouveaux liens de service et horaires
      const updatedSettings = {
        ...currentSettings,
        telegram_livraison: serviceLinks.livraison,
        telegram_envoi: serviceLinks.envoi,
        telegram_meetup: serviceLinks.meetup,
        // Conserver aussi l'ancien format pour compatibilité
        livraison: serviceLinks.livraison,
        envoi: serviceLinks.envoi,
        meetup: serviceLinks.meetup,
        // Horaires personnalisés
        livraison_schedules: serviceSchedules.livraison_schedules,
        meetup_schedules: serviceSchedules.meetup_schedules,
        envoi_schedules: serviceSchedules.envoi_schedules
      };
      
      const response = await fetch('/api/cloudflare/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });

      if (response.ok) {
        const savedData = await response.json();
        console.log('✅ Données sauvegardées avec succès:', savedData);
        setMessage('✅ Liens de service et horaires sauvegardés avec succès !');
        setTimeout(() => setMessage(''), 5000);
        
        // Invalider le cache
        try {
          await fetch('/api/cache/invalidate', { method: 'POST' });
          console.log('✅ Cache invalidé');
        } catch (e) {
          console.log('Cache invalidation skipped:', e);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur API:', response.status, errorText);
        setMessage(`❌ Erreur lors de la sauvegarde: ${response.status}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      setMessage(`❌ Erreur lors de la sauvegarde: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const updateServiceLink = (service: keyof ServiceLinks, value: string) => {
    setServiceLinks(prev => ({ ...prev, [service]: value }));
  };

  const addSchedule = (serviceType: 'livraison' | 'meetup' | 'envoi') => {
    const newSchedule = newScheduleInput[serviceType].trim();
    if (!newSchedule) return;
    
    const scheduleKey = serviceType === 'livraison' ? 'livraison_schedules' : 
                       serviceType === 'meetup' ? 'meetup_schedules' : 'envoi_schedules';
    
    setServiceSchedules(prev => ({
      ...prev,
      [scheduleKey]: [...prev[scheduleKey], newSchedule]
    }));
    
    setNewScheduleInput(prev => ({
      ...prev,
      [serviceType]: ''
    }));
  };

  const removeSchedule = (serviceType: 'livraison' | 'meetup' | 'envoi', index: number) => {
    const scheduleKey = serviceType === 'livraison' ? 'livraison_schedules' : 
                       serviceType === 'meetup' ? 'meetup_schedules' : 'envoi_schedules';
    
    setServiceSchedules(prev => ({
      ...prev,
      [scheduleKey]: prev[scheduleKey].filter((_, i) => i !== index)
    }));
  };

  const resetToDefault = (serviceType: 'livraison' | 'meetup' | 'envoi') => {
    const defaultSchedules = {
      livraison: ['Matin (9h-12h)', 'Après-midi (14h-17h)', 'Soirée (17h-20h)', 'Flexible (à convenir)'],
      meetup: ['Lundi au Vendredi (9h-18h)', 'Weekend (10h-17h)', 'Soirée en semaine (18h-21h)', 'Flexible (à convenir)'],
      envoi: ['Envoi sous 24h', 'Envoi sous 48h', 'Envoi express', 'Délai à convenir']
    };
    
    const scheduleKey = serviceType === 'livraison' ? 'livraison_schedules' : 
                       serviceType === 'meetup' ? 'meetup_schedules' : 'envoi_schedules';
    
    setServiceSchedules(prev => ({
      ...prev,
      [scheduleKey]: defaultSchedules[serviceType]
    }));
  };

  const services = [
    {
      key: 'livraison' as keyof ServiceLinks,
      name: 'Livraison à domicile',
      icon: '🚚',
      description: 'Lien Telegram pour les commandes de livraison à domicile'
    },
    {
      key: 'envoi' as keyof ServiceLinks,
      name: 'Envoi postal',
      icon: '📦',
      description: 'Lien Telegram pour les commandes d\'envoi postal'
    },
    {
      key: 'meetup' as keyof ServiceLinks,
      name: 'Point de rencontre',
      icon: '📍',
      description: 'Lien Telegram pour les commandes de point de rencontre'
    }
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-white">Chargement des liens de service...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-white/20 rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="mr-2">📱</span>
            Liens Telegram & Horaires par Service
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Configurez un lien Telegram différent et des horaires personnalisés pour chaque type de service
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
          >
            <span>💾</span>
            <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => {
                console.log('🔍 État actuel du composant:');
                console.log('Links:', serviceLinks);
                console.log('Schedules:', serviceSchedules);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg text-sm"
            >
              🔍 Debug
            </button>
          )}
        </div>
      </div>

      {/* Message de feedback */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          message.includes('✅') 
            ? 'bg-green-900/50 border-green-400 text-green-100' 
            : 'bg-red-900/50 border-red-400 text-red-100'
        }`}>
          <p className="font-medium text-center">{message}</p>
        </div>
      )}

      {/* Formulaires pour chaque service */}
      <div className="space-y-6">
        {services.map((service) => (
          <div key={service.key} className="bg-gray-800/50 border border-white/10 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">{service.icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                <p className="text-sm text-gray-400">{service.description}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lien Telegram pour {service.name.toLowerCase()}
              </label>
              <input
                type="url"
                value={serviceLinks[service.key]}
                onChange={(e) => updateServiceLink(service.key, e.target.value)}
                className="w-full bg-gray-700 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://t.me/votre_canal_livraison"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: https://t.me/nom_du_canal ou https://t.me/+lien_invite
              </p>
            </div>
            
            {/* Indicateur de statut */}
            <div className="mt-3 flex items-center gap-2">
              {serviceLinks[service.key] ? (
                <span className="inline-flex items-center gap-1 text-green-400 text-sm">
                  <span>✅</span>
                  Configuré
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-yellow-400 text-sm">
                  <span>⚠️</span>
                  Non configuré
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Informations importantes */}
      <div className="mt-6 bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-blue-400 font-medium mb-2 flex items-center">
          <span className="mr-2">💡</span>
          Comment ça fonctionne
        </h4>
        <ul className="text-blue-100 text-sm space-y-1">
          <li>• Chaque service aura son propre lien Telegram</li>
          <li>• Les commandes seront automatiquement dirigées vers le bon canal</li>
          <li>• Le message inclura le type de service choisi par le client</li>
          <li>• Si un lien n'est pas configuré, le système utilisera le lien principal</li>
        </ul>
      </div>

      {/* Section Horaires Personnalisés */}
      <div className="mt-8 bg-gray-800/30 border border-gray-600/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <span className="mr-2">⏰</span>
          Horaires Personnalisés
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          Configurez les créneaux horaires qui s'afficheront dans le panier pour les livraisons et meetups
        </p>

        {/* Horaires Livraison */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium flex items-center">
              <span className="mr-2">🚚</span>
              Créneaux de Livraison
            </h4>
            <button
              onClick={() => resetToDefault('livraison')}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded"
            >
              Remettre par défaut
            </button>
          </div>
          
          <div className="space-y-2 mb-3">
            {serviceSchedules.livraison_schedules.map((schedule, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700/50 rounded p-2">
                <span className="text-gray-300">{schedule}</span>
                <button
                  onClick={() => removeSchedule('livraison', index)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newScheduleInput.livraison}
              onChange={(e) => setNewScheduleInput(prev => ({...prev, livraison: e.target.value}))}
              placeholder="Nouveau créneau (ex: Week-end (9h-15h))"
              className="flex-1 bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addSchedule('livraison');
                }
              }}
            />
            <button
              onClick={() => addSchedule('livraison')}
              disabled={!newScheduleInput.livraison.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm"
            >
              Ajouter
            </button>
          </div>
        </div>

        {/* Horaires Meetup */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium flex items-center">
              <span className="mr-2">📍</span>
              Créneaux de Meetup
            </h4>
            <button
              onClick={() => resetToDefault('meetup')}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded"
            >
              Remettre par défaut
            </button>
          </div>
          
          <div className="space-y-2 mb-3">
            {serviceSchedules.meetup_schedules.map((schedule, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700/50 rounded p-2">
                <span className="text-gray-300">{schedule}</span>
                <button
                  onClick={() => removeSchedule('meetup', index)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newScheduleInput.meetup}
              onChange={(e) => setNewScheduleInput(prev => ({...prev, meetup: e.target.value}))}
              placeholder="Nouveau créneau (ex: Dimanche matin (10h-13h))"
              className="flex-1 bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addSchedule('meetup');
                }
              }}
            />
            <button
              onClick={() => addSchedule('meetup')}
              disabled={!newScheduleInput.meetup.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm"
            >
              Ajouter
            </button>
          </div>
        </div>

        {/* Horaires Envoi Postal */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium flex items-center">
              <span className="mr-2">📦</span>
              Options d'Envoi Postal
            </h4>
            <button
              onClick={() => resetToDefault('envoi')}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded"
            >
              Remettre par défaut
            </button>
          </div>
          
          <div className="space-y-2 mb-3">
            {serviceSchedules.envoi_schedules.map((schedule, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700/50 rounded p-2">
                <span className="text-gray-300">{schedule}</span>
                <button
                  onClick={() => removeSchedule('envoi', index)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newScheduleInput.envoi}
              onChange={(e) => setNewScheduleInput(prev => ({...prev, envoi: e.target.value}))}
              placeholder="Nouvelle option (ex: Envoi international, Envoi sécurisé...)"
              className="flex-1 bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addSchedule('envoi');
                }
              }}
            />
            <button
              onClick={() => addSchedule('envoi')}
              disabled={!newScheduleInput.envoi.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm"
            >
              Ajouter
            </button>
          </div>
        </div>

        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
          <p className="text-blue-100 text-sm">
            💡 <strong>Note :</strong> Ces informations s'afficheront automatiquement dans le panier :
          </p>
          <ul className="text-blue-100 text-xs mt-2 space-y-1">
            <li>• 🚚 <strong>Livraison :</strong> Créneaux horaires pour les rendez-vous</li>
            <li>• 📍 <strong>Meetup :</strong> Créneaux horaires pour les points de rencontre</li>
            <li>• 📦 <strong>Envoi postal :</strong> Options de délais/types d'envoi disponibles</li>
          </ul>
        </div>
      </div>

      {/* Aperçu du fonctionnement */}
      <div className="mt-6 bg-gray-800/30 border border-gray-600/30 rounded-lg p-4">
        <h4 className="text-gray-300 font-medium mb-3 flex items-center">
          <span className="mr-2">🔍</span>
          Aperçu du fonctionnement
        </h4>
        <div className="space-y-2 text-sm">
          {services.map((service) => (
            <div key={service.key} className="flex items-center justify-between bg-gray-700/50 rounded p-2">
              <span className="text-gray-300">
                {service.icon} Client choisit "{service.name}"
              </span>
              <span className="text-gray-400">→</span>
              <span className={`text-sm ${serviceLinks[service.key] ? 'text-green-400' : 'text-yellow-400'}`}>
                {serviceLinks[service.key] ? 
                  `Canal ${service.name.toLowerCase()}` : 
                  'Canal principal (fallback)'
                }
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}