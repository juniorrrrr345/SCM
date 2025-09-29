'use client';

import { useState } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface ScheduleSelectorProps {
  selectedSchedule?: string;
  onScheduleSelect: (schedule: string) => void;
  serviceType: 'livraison' | 'meetup' | 'envoi';
  customSchedules?: string[];
}

export default function ScheduleSelector({ selectedSchedule, onScheduleSelect, serviceType, customSchedules }: ScheduleSelectorProps) {
  const [customSchedule, setCustomSchedule] = useState('');
  
  // Créneaux prédéfinis selon le type de service
  const getTimeSlots = () => {
    // Utiliser les horaires personnalisés s'ils sont fournis
    if (customSchedules && customSchedules.length > 0) {
      return customSchedules;
    }
    
    // Fallback vers les horaires par défaut
    if (serviceType === 'livraison') {
      return [
        'Matin (9h-12h)',
        'Après-midi (14h-17h)',
        'Soirée (17h-20h)',
        'Flexible (à convenir)'
      ];
    } else if (serviceType === 'meetup') {
      return [
        'Lundi au Vendredi (9h-18h)',
        'Weekend (10h-17h)',
        'Soirée en semaine (18h-21h)',
        'Flexible (à convenir)'
      ];
    } else { // envoi
      return [
        'Envoi sous 24h',
        'Envoi sous 48h',
        'Envoi express',
        'Délai à convenir'
      ];
    }
  };

  const timeSlots = getTimeSlots();
  
  const handleCustomScheduleSubmit = () => {
    if (customSchedule.trim()) {
      onScheduleSelect(customSchedule.trim());
      setCustomSchedule('');
    }
  };

  const getTitle = () => {
    if (serviceType === 'livraison') {
      return '📅 Choisissez un créneau de livraison :';
    } else if (serviceType === 'meetup') {
      return '📅 Choisissez un créneau de rendez-vous :';
    } else {
      return '📦 Choisissez vos options d\'envoi :';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Clock className="w-5 h-5" />
        {getTitle()}
      </h3>
      
      {/* Créneaux prédéfinis */}
      <div className="space-y-2">
        {timeSlots.map((slot) => (
          <button
            key={slot}
            onClick={() => onScheduleSelect(slot)}
            className={`w-full p-3 rounded-lg border transition-all text-left ${
              selectedSchedule === slot
                ? 'border-green-500 bg-green-500/20 text-white'
                : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{slot}</span>
              {selectedSchedule === slot && (
                <span className="text-green-400">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Option personnalisée */}
      <div className="space-y-2">
        <p className="text-sm text-gray-400">
          {serviceType === 'envoi' ? 
            'Ou spécifiez une option d\'envoi personnalisée :' : 
            'Ou spécifiez un créneau personnalisé :'
          }
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customSchedule}
            onChange={(e) => setCustomSchedule(e.target.value)}
            placeholder={serviceType === 'envoi' ? 
              'Ex: Envoi international, Envoi sécurisé...' : 
              'Ex: Mardi 15h ou Weekend matin...'
            }
            className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCustomScheduleSubmit();
              }
            }}
          />
          <button
            onClick={handleCustomScheduleSubmit}
            disabled={!customSchedule.trim()}
            className="px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}