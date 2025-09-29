'use client';

import { DeliveryService } from '@/lib/cartStore';
import { Truck, Package, MapPin } from 'lucide-react';

interface ServiceSelectorProps {
  selectedService?: 'livraison' | 'envoi' | 'meetup';
  onServiceSelect: (service: 'livraison' | 'envoi' | 'meetup') => void;
}

const DELIVERY_SERVICES: DeliveryService[] = [
  {
    id: 'livraison',
    name: 'Livraison à domicile',
    icon: '🚚',
    description: 'Livraison directe à votre adresse',
    needsSchedule: true
  },
  {
    id: 'envoi',
    name: 'Envoi postal',
    icon: '📦',
    description: 'Envoi par courrier/transporteur',
    needsSchedule: true
  },
  {
    id: 'meetup',
    name: 'Point de rencontre',
    icon: '📍',
    description: 'Rendez-vous à un point convenu',
    needsSchedule: true
  }
];

export default function ServiceSelector({ selectedService, onServiceSelect }: ServiceSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <span>🚛</span>
        Choisissez votre mode de réception :
      </h3>
      
      <div className="space-y-2">
        {DELIVERY_SERVICES.map((service) => (
          <button
            key={service.id}
            onClick={() => onServiceSelect(service.id)}
            className={`w-full p-4 rounded-lg border transition-all ${
              selectedService === service.id
                ? 'border-green-500 bg-green-500/20 text-white'
                : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{service.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{service.name}</div>
                <div className="text-sm opacity-80">{service.description}</div>
                {service.needsSchedule && (
                  <div className="text-xs text-green-400 mt-1">
                    ⏰ Nécessite un créneau horaire
                  </div>
                )}
              </div>
              {selectedService === service.id && (
                <span className="text-green-400">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}