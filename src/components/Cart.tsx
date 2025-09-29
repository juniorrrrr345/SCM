'use client';

import { useCartStore } from '@/lib/cartStore';
// Removed Next Image import - using regular img for better compatibility
import { X, Minus, Plus, Trash2, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ServiceSelector from './ServiceSelector';
import ScheduleSelector from './ScheduleSelector';

export default function Cart() {
  const { 
    items, 
    isOpen, 
    setIsOpen, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getTotalPrice,
    updateService,
    updateSchedule,
    getItemsNeedingService,
    getItemsNeedingSchedule,
    isCartReadyForOrder
  } = useCartStore();
  const [orderLink, setOrderLink] = useState('#'); // Lien de commande par défaut
  const [serviceLinks, setServiceLinks] = useState({
    livraison: '',
    envoi: '',
    meetup: ''
  });
  const [customSchedules, setCustomSchedules] = useState({
    livraison: [] as string[],
    meetup: [] as string[],
    envoi: [] as string[]
  });
  const [currentStep, setCurrentStep] = useState<'cart' | 'service' | 'schedule' | 'review'>('cart');
  
  // Auto-navigation entre les étapes (désactivée pour permettre la modification)
  useEffect(() => {
    if (items.length === 0) {
      setCurrentStep('cart');
      return;
    }
    
    // On supprime la navigation automatique pour permettre la modification des services
    // L'utilisateur peut maintenant naviguer librement entre les étapes pour modifier ses choix
    
  }, [items]);
  
  useEffect(() => {
    // Charger les liens de commande depuis les settings Cloudflare
    fetch('/api/cloudflare/settings')
      .then(res => res.json())
      .then(data => {
        console.log('📱 Settings reçus pour commandes:', data);
        
        // Charger les liens de service spécifiques
        setServiceLinks({
          livraison: data.telegram_livraison || data.livraison || '',
          envoi: data.telegram_envoi || data.envoi || '',
          meetup: data.telegram_meetup || data.meetup || ''
        });
        
        // Charger les horaires personnalisés
        setCustomSchedules({
          livraison: data.livraison_schedules || [],
          meetup: data.meetup_schedules || [],
          envoi: data.envoi_schedules || []
        });
        
        // Lien de commande principal (fallback)
        // Priorité 1: whatsapp_link (colonne dédiée)
        if (data.whatsapp_link) {
          setOrderLink(data.whatsapp_link);
          console.log('📱 Lien de commande principal configuré:', data.whatsapp_link);
        }
        // Priorité 2: contact_info (fallback)
        else if (data.contact_info) {
          setOrderLink(data.contact_info);
          console.log('📱 Lien depuis contact_info:', data.contact_info);
        }
        // Priorité 3: ancien champ whatsappLink (compatibilité)
        else if (data.whatsappLink) {
          setOrderLink(data.whatsappLink);
          console.log('📱 Lien WhatsApp (legacy):', data.whatsappLink);
        }
        
        console.log('📱 Liens de service chargés:', {
          livraison: data.telegram_livraison || data.livraison,
          envoi: data.telegram_envoi || data.envoi,
          meetup: data.telegram_meetup || data.meetup
        });
        
        console.log('⏰ Horaires personnalisés chargés:', {
          livraison: data.livraison_schedules,
          meetup: data.meetup_schedules,
          envoi: data.envoi_schedules
        });
      })
      .catch((error) => {
        console.error('❌ Erreur chargement settings commande:', error);
      });
  }, []);
  
  // Fonction pour copier et préparer une commande pour Signal
  const handleSendOrderByService = async (targetService: 'livraison' | 'envoi' | 'meetup') => {
    // Filtrer les articles pour ce service
    const serviceItems = items.filter(item => item.service === targetService);
    
    if (serviceItems.length === 0) {
      toast.error(`Aucun article sélectionné pour ${targetService}`);
      return;
    }
    
    // Calculer le total pour ce service
    const serviceTotal = serviceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Construire le message pour ce service spécifique
    const serviceIcon = targetService === 'livraison' ? '🚚' : targetService === 'envoi' ? '📦' : '📍';
    const serviceName = targetService === 'livraison' ? 'Livraison à domicile' : targetService === 'envoi' ? 'Envoi postal' : 'Point de rencontre';
    
    // Format optimisé pour Signal
    let message = `${serviceIcon} COMMANDE SCM - ${serviceName.toUpperCase()}\n\n`;
    
    serviceItems.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      
      message += `${index + 1}. ${item.productName}\n`;
      message += `• Quantité: ${item.quantity}x ${item.weight}\n`;
      message += `• Prix unitaire: ${item.originalPrice}€\n`;
      message += `• Total: ${itemTotal.toFixed(2)}€\n`;
      
      if (item.discount > 0) {
        message += `• Remise: -${item.discount}%\n`;
      }
      
      if (item.schedule) {
        message += `• Horaire demandé: ${item.schedule}\n`;
      }
      
      message += '\n';
    });
    
    message += `💰 TOTAL ${serviceName.toUpperCase()}: ${serviceTotal.toFixed(2)}€\n\n`;
    message += `📍 Service: ${serviceIcon} ${serviceName}\n\n`;
    message += `Commande depuis le site SCM\n`;
    message += `Merci de confirmer votre commande !`;
    
    // Choisir le bon lien selon le service pour Signal
    let chosenLink = orderLink; // Fallback par défaut
    
    if (serviceLinks[targetService]) {
      chosenLink = serviceLinks[targetService];
      console.log(`📱 Utilisation du lien Signal spécifique pour ${targetService}:`, chosenLink);
    } else {
      console.log(`📱 Pas de lien Signal configuré pour ${targetService}, utilisation du lien principal`);
    }
    
    // Copier le message dans le presse-papiers ET rediriger vers Signal
    try {
      await navigator.clipboard.writeText(message);
      console.log(`📋 Message copié pour ${targetService}:`, message);
      
      // Rediriger vers Signal après avoir copié
      if (chosenLink && chosenLink.trim() !== '') {
        // Encoder le message pour l'URL
        const encodedMessage = encodeURIComponent(message);
        
        // Construire l'URL Signal
        let finalUrl = chosenLink;
        
        // Signal supporte différents formats
        if (chosenLink.includes('signal.me') || chosenLink.includes('signal.org') || chosenLink.includes('signal://')) {
          // Pour Signal, on ne peut pas pré-remplir le message dans l'URL
          // On ouvre juste Signal et on laisse l'utilisateur coller
          finalUrl = chosenLink;
        } else if (chosenLink.includes('wa.me') || chosenLink.includes('whatsapp.com')) {
          // WhatsApp supporte le paramètre text
          const separator = chosenLink.includes('?') ? '&' : '?';
          finalUrl = `${chosenLink}${separator}text=${encodedMessage}`;
        } else if (chosenLink.includes('t.me')) {
          // Telegram supporte le paramètre text (sauf liens d'invitation)
          if (chosenLink.includes('/+')) {
            finalUrl = chosenLink;
          } else {
            const separator = chosenLink.includes('?') ? '&' : '?';
            finalUrl = `${chosenLink}${separator}text=${encodedMessage}`;
          }
        } else {
          // Autre lien personnalisé
          finalUrl = chosenLink;
        }
        
        console.log(`📱 Redirection vers Signal:`, finalUrl);
        window.open(finalUrl, '_blank');
        
        if (chosenLink.includes('signal')) {
          toast.success(
            `📱 Signal ouvert ! Message copié pour ${serviceName} - collez-le (Ctrl+V)`,
            { duration: 6000 }
          );
        } else {
          toast.success(
            `📱 Redirection vers Signal ! Le message est déjà copié pour être collé`,
            { duration: 4000 }
          );
        }
      } else {
        // Pas de lien configuré, juste copier
        toast.success(
          `📋 Message copié ! Ouvrez Signal et collez votre commande ${serviceName}`,
          { duration: 6000 }
        );
      }
      
      // Vider le panier après 2 secondes
      setTimeout(() => {
        clearCart();
        setIsOpen(false);
      }, 2000);
      
    } catch (err) {
      console.error('❌ Erreur copie presse-papiers:', err);
      
      // Fallback : rediriger vers Signal sans copie automatique
      if (chosenLink && chosenLink.trim() !== '') {
        window.open(chosenLink, '_blank');
        alert(`Voici votre commande à copier-coller dans Signal :\n\n${message}`);
      } else {
        alert(`Voici votre commande à copier-coller dans Signal :\n\n${message}`);
      }
      
      toast.success(`📱 Copiez le message affiché et envoyez-le dans Signal !`);
    }
  };

  // Fonction pour créer une commande complète pour Signal
  const handleSendCompleteOrder = async () => {
    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }
    
    if (!isCartReadyForOrder()) {
      toast.error('Veuillez compléter toutes les informations de livraison');
      return;
    }
    
    // Grouper par service
    const serviceGroups = items.reduce((acc: Record<string, any[]>, item) => {
      const key = item.service!;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
    
    const services = Object.keys(serviceGroups) as ('livraison' | 'envoi' | 'meetup')[];
    const totalPrice = getTotalPrice();
    
    // Construire un message complet pour toute la commande
    let completeMessage = `🛒 COMMANDE COMPLÈTE SCM\n\n`;
    
    services.forEach((service) => {
      const serviceItems = serviceGroups[service];
      const serviceIcon = service === 'livraison' ? '🚚' : service === 'envoi' ? '📦' : '📍';
      const serviceName = service === 'livraison' ? 'Livraison' : service === 'envoi' ? 'Envoi' : 'Meetup';
      const serviceTotal = serviceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      completeMessage += `${serviceIcon} ${serviceName.toUpperCase()}\n`;
      
      serviceItems.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        completeMessage += `${index + 1}. ${item.productName}\n`;
        completeMessage += `   • ${item.quantity}x ${item.weight} - ${itemTotal.toFixed(2)}€\n`;
        if (item.schedule) {
          completeMessage += `   • Horaire: ${item.schedule}\n`;
        }
      });
      
      completeMessage += `   💰 Sous-total ${serviceName}: ${serviceTotal.toFixed(2)}€\n\n`;
    });
    
    completeMessage += `💰 TOTAL GÉNÉRAL: ${totalPrice.toFixed(2)}€\n\n`;
    completeMessage += `Commande depuis le site SCM\n`;
    completeMessage += `Merci de confirmer votre commande !`;
    
    // Copier le message ET rediriger vers Signal
    try {
      await navigator.clipboard.writeText(completeMessage);
      console.log('📋 Message complet copié:', completeMessage);
      
      // Choisir le lien Signal principal
      let signalLink = orderLink;
      
      // Rediriger vers Signal après avoir copié
      if (signalLink && signalLink.trim() !== '') {
        // Encoder le message pour l'URL
        const encodedMessage = encodeURIComponent(completeMessage);
        
        // Construire l'URL Signal
        let finalUrl = signalLink;
        
        // Signal supporte différents formats
        if (signalLink.includes('signal.me') || signalLink.includes('signal.org') || signalLink.includes('signal://')) {
          // Pour Signal, on ne peut pas pré-remplir le message dans l'URL
          // On ouvre juste Signal et on laisse l'utilisateur coller
          finalUrl = signalLink;
        } else if (signalLink.includes('wa.me') || signalLink.includes('whatsapp.com')) {
          // WhatsApp supporte le paramètre text
          const separator = signalLink.includes('?') ? '&' : '?';
          finalUrl = `${signalLink}${separator}text=${encodedMessage}`;
        } else if (signalLink.includes('t.me')) {
          // Telegram supporte le paramètre text (sauf liens d'invitation)
          if (signalLink.includes('/+')) {
            finalUrl = signalLink;
          } else {
            const separator = signalLink.includes('?') ? '&' : '?';
            finalUrl = `${signalLink}${separator}text=${encodedMessage}`;
          }
        } else {
          // Autre lien personnalisé
          finalUrl = signalLink;
        }
        
        console.log(`📱 Redirection vers Signal avec commande complète:`, finalUrl);
        window.open(finalUrl, '_blank');
        
        if (chosenLink.includes('signal')) {
          toast.success(
            `📱 Signal ouvert ! Le message est copié - collez-le (Ctrl+V) dans la conversation`,
            { duration: 6000 }
          );
        } else {
          toast.success(
            `📱 Redirection vers Signal ! Le message est déjà copié, collez-le directement`,
            { duration: 4000 }
          );
        }
      } else {
        // Pas de lien configuré, juste copier
        toast.success(
          '📋 Commande complète copiée ! Ouvrez Signal et collez votre commande',
          { duration: 6000 }
        );
      }
      
      // Vider le panier après 2 secondes
      setTimeout(() => {
        clearCart();
        setIsOpen(false);
      }, 2000);
      
    } catch (err) {
      console.error('❌ Erreur copie presse-papiers:', err);
      
      // Fallback : rediriger vers Signal sans copie automatique
      let signalLink = orderLink;
      if (signalLink && signalLink.trim() !== '') {
        window.open(signalLink, '_blank');
        alert(`Voici votre commande complète à copier-coller dans Signal :\n\n${completeMessage}`);
      } else {
        alert(`Voici votre commande complète à copier-coller dans Signal :\n\n${completeMessage}`);
      }
      
      toast.success('📱 Copiez le message affiché et envoyez-le dans Signal !');
    }
  };
  
  if (!isOpen) return null;
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = getTotalPrice();
  
  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 shadow-xl pointer-events-auto overflow-hidden">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">
                  {currentStep === 'cart' && 'Mon Panier'}
                  {currentStep === 'service' && 'Mode de livraison'}
                  {currentStep === 'schedule' && 'Options & Horaires'}
                  {currentStep === 'review' && 'Récapitulatif'}
                </h2>
                <span className="rounded-full bg-green-500 px-2 py-1 text-sm font-medium text-black">
                  {totalItems} article{totalItems > 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Indicateur d'étapes */}
            {items.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <div className={`flex items-center gap-1 ${currentStep === 'cart' ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${currentStep === 'cart' ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                  Panier
                </div>
                <ArrowRight className="w-3 h-3 text-gray-600" />
                <div className={`flex items-center gap-1 ${currentStep === 'service' ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${currentStep === 'service' || (currentStep === 'schedule' || currentStep === 'review') && getItemsNeedingService().length === 0 ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                  Service
                </div>
                <ArrowRight className="w-3 h-3 text-gray-600" />
                <div className={`flex items-center gap-1 ${currentStep === 'schedule' ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${currentStep === 'schedule' || (currentStep === 'review' && getItemsNeedingSchedule().length === 0) ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                  Options
                </div>
                <ArrowRight className="w-3 h-3 text-gray-600" />
                <div className={`flex items-center gap-1 ${currentStep === 'review' ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${currentStep === 'review' ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                  Commande
                </div>
              </div>
            )}
          </div>
          
          {/* Content dynamique selon l'étape */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart className="h-16 w-16 mb-4" />
                <p>Votre panier est vide</p>
              </div>
            ) : (
              <div>
                {/* Étape 1: Affichage du panier */}
                {currentStep === 'cart' && (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={`${item.productId}-${item.weight}`} className="rounded-lg bg-gray-800/50 p-4">
                        <div className="flex gap-4">
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-medium text-white">{item.productName}</h3>
                            <p className="text-sm text-gray-400">
                              {item.weight} - {item.originalPrice}€
                              {item.discount > 0 && (
                                <span className="ml-2 rounded bg-green-500/20 px-1.5 py-0.5 text-xs font-medium text-green-400">
                                  -{item.discount}%
                                </span>
                              )}
                            </p>
                            <p className="mt-1 text-lg font-bold text-green-400">
                              {(item.price * item.quantity).toFixed(2)}€
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.productId, item.weight, item.quantity - 1)}
                                className="rounded bg-gray-700 p-1 hover:bg-gray-600 transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center font-medium text-white">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.weight, item.quantity + 1)}
                                className="rounded bg-gray-700 p-1 hover:bg-gray-600 transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.productId, item.weight)}
                              className="rounded p-1 text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Étape 2: Sélection du service */}
                {currentStep === 'service' && (
                  <div className="space-y-6">
                    <div className="text-sm text-gray-400 bg-gray-800/30 p-3 rounded-lg">
                      Choisissez votre mode de réception :
                    </div>
                    
                    {items.map((item) => (
                      <div key={`service-${item.productId}-${item.weight}`} className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                          <img src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <p className="font-medium text-white">{item.productName}</p>
                            <p className="text-sm text-gray-400">{item.weight}</p>
                            {item.service && (
                              <p className="text-xs text-green-400 mt-1">
                                Actuellement: {item.service === 'livraison' ? '🚚 Livraison' : 
                                               item.service === 'envoi' ? '📦 Envoi' : 
                                               '📍 Meetup'}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <ServiceSelector
                          selectedService={item.service}
                          onServiceSelect={(service) => updateService(item.productId, item.weight, service)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Étape 3: Sélection des horaires */}
                {currentStep === 'schedule' && (
                  <div className="space-y-6">
                    <div className="text-sm text-gray-400 bg-gray-800/30 p-3 rounded-lg">
                      Choisissez ou modifiez vos options de livraison/envoi
                    </div>
                    
                    {items.filter(item => item.service && (item.service === 'livraison' || item.service === 'meetup' || item.service === 'envoi')).map((item) => (
                      <div key={`schedule-${item.productId}-${item.weight}`} className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                          <img src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <p className="font-medium text-white">{item.productName}</p>
                            <p className="text-sm text-gray-400">{item.weight}</p>
                            <p className="text-sm text-green-400">
                              {item.service === 'livraison' ? '🚚 Livraison' : 
                               item.service === 'envoi' ? '📦 Envoi postal' : 
                               '📍 Point de rencontre'}
                            </p>
                            {item.schedule && (
                              <p className="text-xs text-blue-400 mt-1">
                                Actuellement: {item.schedule}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <ScheduleSelector
                          selectedSchedule={item.schedule}
                          onScheduleSelect={(schedule) => updateSchedule(item.productId, item.weight, schedule)}
                          serviceType={item.service as 'livraison' | 'meetup' | 'envoi'}
                          customSchedules={
                            item.service === 'livraison' ? customSchedules.livraison : 
                            item.service === 'meetup' ? customSchedules.meetup : 
                            customSchedules.envoi
                          }
                        />
                      </div>
                    ))}
                    
                    {items.filter(item => item.service && (item.service === 'livraison' || item.service === 'meetup' || item.service === 'envoi')).length === 0 && (
                      <div className="text-center text-gray-400 py-8">
                        <p>Aucun article n'a de service nécessitant des options.</p>
                        <p className="text-sm mt-2">Retournez à l'étape précédente pour choisir vos services.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Étape 4: Récapitulatif */}
                {currentStep === 'review' && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-400 bg-gray-800/30 p-3 rounded-lg">
                      Vérifiez votre commande avant envoi
                    </div>
                    
                    <div className="text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-start gap-2">
                      <span className="text-lg">📱</span>
                      <div>
                        <div className="font-medium">Comment ça marche :</div>
                        <div className="text-xs opacity-90 mt-1">
                          • Telegram s'ouvrira avec votre commande pré-remplie<br/>
                          • Chaque service est dirigé vers son canal dédié<br/>
                          • Il vous suffira de cliquer "Envoyer" dans Telegram<br/>
                          • Aucune copie/collage nécessaire !
                        </div>
                      </div>
                    </div>
                    
                    {items.map((item) => (
                      <div key={`review-${item.productId}-${item.weight}`} className="rounded-lg bg-gray-800/50 p-4">
                        <div className="flex gap-4">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-medium text-white">{item.productName}</h3>
                            <p className="text-sm text-gray-400">{item.weight} × {item.quantity}</p>
                            <p className="text-lg font-bold text-green-400">
                              {(item.price * item.quantity).toFixed(2)}€
                            </p>
                            
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400">Service:</span>
                                <span className="text-white">
                                  {item.service === 'livraison' ? '🚚 Livraison' : 
                                   item.service === 'envoi' ? '📦 Envoi postal' : 
                                   '📍 Point de rencontre'}
                                </span>
                              </div>
                              {item.schedule && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-gray-400">Horaire:</span>
                                  <span className="text-white">{item.schedule}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg text-gray-400">Total:</span>
                <span className="text-2xl font-bold text-green-400">{total.toFixed(2)}€</span>
              </div>
              
              {/* Boutons de navigation entre étapes */}
              <div className="space-y-3">
                {currentStep === 'cart' && (
                  <button
                    onClick={() => setCurrentStep('service')}
                    className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 py-3 font-medium text-white hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                    COMMANDER
                  </button>
                )}

                {currentStep === 'service' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        // Retourner au panier (étape précédente)
                        setCurrentStep('cart');
                      }}
                      className="flex-1 rounded-lg bg-gray-700 py-3 font-medium text-white hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </button>
                    <button
                      onClick={() => {
                        const itemsNeedingService = getItemsNeedingService();
                        if (itemsNeedingService.length === 0) {
                          // Tous les articles ont un service, vérifier si on a besoin d'options/horaires
                          const itemsNeedingSchedule = items.filter(item => 
                            item.service && (item.service === 'livraison' || item.service === 'meetup' || item.service === 'envoi') && !item.schedule
                          );
                          if (itemsNeedingSchedule.length > 0) {
                            setCurrentStep('schedule');
                          } else {
                            setCurrentStep('review');
                          }
                        } else {
                          toast.error('Veuillez choisir un service pour tous les articles');
                        }
                      }}
                      disabled={getItemsNeedingService().length > 0}
                      className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-medium text-white hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuer
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {currentStep === 'schedule' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        // Retourner à l'étape précédente (service)
                        setCurrentStep('service');
                      }}
                      className="flex-1 rounded-lg bg-gray-700 py-3 font-medium text-white hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </button>
                    <button
                      onClick={() => {
                        const itemsNeedingSchedule = items.filter(item => 
                          item.service && (item.service === 'livraison' || item.service === 'meetup' || item.service === 'envoi') && !item.schedule
                        );
                        if (itemsNeedingSchedule.length === 0) {
                          setCurrentStep('review');
                        } else {
                          toast.error('Veuillez choisir des options pour tous les articles nécessaires');
                        }
                      }}
                      disabled={items.filter(item => 
                        item.service && (item.service === 'livraison' || item.service === 'meetup' || item.service === 'envoi') && !item.schedule
                      ).length > 0}
                      className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-medium text-white hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Finaliser
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {currentStep === 'review' && (
                  <div className="space-y-3">
                    {/* Afficher les options d'envoi selon les services */}
                    {(() => {
                      const serviceGroups = items.reduce((acc: Record<string, any[]>, item) => {
                        const key = item.service!;
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(item);
                        return acc;
                      }, {});
                      
                      const services = Object.keys(serviceGroups) as ('livraison' | 'envoi' | 'meetup')[];
                      
                      if (services.length === 1) {
                        // Un seul service : bouton simple
                        const service = services[0];
                        const serviceIcon = service === 'livraison' ? '🚚' : service === 'envoi' ? '📦' : '📍';
                        const serviceName = service === 'livraison' ? 'Livraison' : service === 'envoi' ? 'Envoi' : 'Meetup';
                        const hasConfiguredLink = serviceLinks[service];
                        
                        return (
                          <div className="space-y-2">
                            <div className="text-xs text-blue-400 bg-blue-500/10 p-2 rounded border border-blue-500/20">
                              📱 Copie automatique + redirection vers Signal
                            </div>
                            <button
                              onClick={() => handleSendOrderByService(service)}
                              disabled={!isCartReadyForOrder()}
                              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-medium text-white hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                              </svg>
                              📱 {serviceIcon} Envoyer via Signal - {serviceName}
                            </button>
                          </div>
                        );
                      } else {
                        // Plusieurs services : boutons séparés + option globale
                        return (
                          <div className="space-y-3">
                            <div className="text-sm text-blue-400 bg-blue-500/10 p-3 rounded border border-blue-500/20">
                              <p className="font-medium mb-2">📋 Plusieurs services détectés :</p>
                              <p className="text-xs">Redirection automatique vers Signal avec message copié</p>
                            </div>
                            
                            {/* Boutons par service */}
                            {services.map(service => {
                              const serviceItems = serviceGroups[service];
                              const serviceIcon = service === 'livraison' ? '🚚' : service === 'envoi' ? '📦' : '📍';
                              const serviceName = service === 'livraison' ? 'Livraison' : service === 'envoi' ? 'Envoi' : 'Meetup';
                              const serviceTotal = serviceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                              const hasConfiguredLink = serviceLinks[service];
                              
                              return (
                                <div key={service} className="space-y-1">
                                  <button
                                    onClick={() => handleSendOrderByService(service)}
                                    className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-medium text-white hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-between px-4"
                                  >
                                    <span className="flex items-center gap-2">
                                      📱 {serviceIcon} Signal {serviceName}
                                    </span>
                                    <span className="text-sm">{serviceTotal.toFixed(2)}€ • {serviceItems.length} art.</span>
                                  </button>
                                </div>
                              );
                            })}
                            
                            {/* Bouton pour tout copier */}
                            <div className="pt-2 border-t border-gray-600">
                              <button
                                onClick={handleSendCompleteOrder}
                                disabled={!isCartReadyForOrder()}
                                className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 py-3 font-medium text-white hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                </svg>
                                📱 Envoyer TOUT via Signal
                              </button>
                            </div>
                          </div>
                        );
                      }
                    })()}
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          // Retour logique : review → schedule → service → cart
                          setCurrentStep('schedule');
                        }}
                        className="flex-1 rounded-lg bg-gray-700 py-3 font-medium text-white hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Modifier options
                      </button>
                      <button
                        onClick={() => setCurrentStep('service')}
                        className="flex-1 rounded-lg bg-gray-600 py-3 font-medium text-white hover:bg-gray-500 transition-colors"
                      >
                        Modifier services
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="mt-3 w-full rounded-lg bg-gray-600 py-2 font-medium text-white hover:bg-gray-500 transition-colors text-sm"
              >
                Continuer les achats
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}