'use client';
import { useState, useEffect } from 'react';

interface ServiceSchedules {
  livraison_schedules: string[];
  meetup_schedules: string[];
  envoi_schedules: string[];
}

export default function ScheduleManager() {
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
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const response = await fetch('/api/cloudflare/settings');
      if (response.ok) {
        const data = await response.json();
        console.log('📅 Horaires reçus:', data);
        
        setServiceSchedules({
          livraison_schedules: data.livraison_schedules || ['Matin (9h-12h)', 'Après-midi (14h-17h)', 'Soirée (17h-20h)', 'Flexible (à convenir)'],
          meetup_schedules: data.meetup_schedules || ['Lundi au Vendredi (9h-18h)', 'Weekend (10h-17h)', 'Soirée en semaine (18h-21h)', 'Flexible (à convenir)'],
          envoi_schedules: data.envoi_schedules || ['Envoi sous 24h', 'Envoi sous 48h', 'Envoi express', 'Délai à convenir']
        });
      }
    } catch (error) {
      console.error('❌ Erreur chargement horaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    
    try {
      setSaving(true);
      setMessage('');
      
      // Récupérer les settings actuels
      const currentResponse = await fetch('/api/cloudflare/settings');
      let currentSettings = {};
      if (currentResponse.ok) {
        currentSettings = await currentResponse.json();
      }
      
      // Fusionner avec les horaires
      const updatedSettings = {
        ...currentSettings,
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
        setMessage('✅ Horaires de service sauvegardés avec succès !');
        setTimeout(() => setMessage(''), 5000);
        
        // Invalider le cache
        try {
          await fetch('/api/cache/invalidate', { method: 'POST' });
        } catch (e) {
          console.log('Cache invalidation skipped:', e);
        }
      } else {
        setMessage(`❌ Erreur lors de la sauvegarde: ${response.status}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      setMessage(`❌ Erreur lors de la sauvegarde`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-white">Chargement des horaires...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-white/20 rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="mr-2">⏰</span>
            Horaires par Service
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Configurez des horaires personnalisés pour chaque type de service
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-white hover:bg-gray-100 disabled:bg-gray-600 text-black font-medium py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <span>💾</span>
            <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
        </div>
      </div>

      {/* Message de statut */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('✅') ? 'bg-green-900/30 border border-green-500/30 text-green-400' :
          'bg-red-900/30 border border-red-500/30 text-red-400'
        }`}>
          <p className="font-medium text-center">{message}</p>
        </div>
      )}

      {/* Note Signal */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
        <p className="text-blue-400 text-sm">
          💡 <strong>Note :</strong> Les liens Signal se configurent dans <strong>Settings</strong>. 
          Ici vous gérez seulement les horaires disponibles pour chaque service.
        </p>
      </div>
      
      {/* Gestion des horaires par service */}
      <div className="space-y-8">
        {/* Horaires Livraison */}
        <div className="bg-gray-800/50 border border-white/10 rounded-lg p-4">
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
              onChange={(e) => setNewScheduleInput(prev => ({ ...prev, livraison: e.target.value }))}
              className="flex-1 bg-gray-700 border border-white/20 text-white rounded px-3 py-2 text-sm"
              placeholder="Nouveau créneau de livraison"
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
        <div className="bg-gray-800/50 border border-white/10 rounded-lg p-4">
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
              onChange={(e) => setNewScheduleInput(prev => ({ ...prev, meetup: e.target.value }))}
              className="flex-1 bg-gray-700 border border-white/20 text-white rounded px-3 py-2 text-sm"
              placeholder="Nouveau créneau de meetup"
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

        {/* Horaires Envoi */}
        <div className="bg-gray-800/50 border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium flex items-center">
              <span className="mr-2">📦</span>
              Créneaux d'Envoi
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
              onChange={(e) => setNewScheduleInput(prev => ({ ...prev, envoi: e.target.value }))}
              className="flex-1 bg-gray-700 border border-white/20 text-white rounded px-3 py-2 text-sm"
              placeholder="Nouveau créneau d'envoi"
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
      </div>
    </div>
  );
}