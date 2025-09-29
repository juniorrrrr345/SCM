'use client';
import { useEffect, useState } from 'react';
import { Product } from './ProductCard';
import { useCartStore } from '@/lib/cartStore';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import MediaDisplay from './MediaDisplay';
import { parseMarkdown, renderMarkdownToJSX } from '@/lib/markdownParser';

interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const { addItem } = useCartStore();

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [product]);

  const handleAddToCart = (weight: string, price: number, originalPrice: number, discount: number) => {
    if (!product) return;
    
    addItem({
      productId: product.id.toString(),
      productName: product.name,
      image: product.image_url,
      weight,
      price,
      originalPrice,
      discount
    });
    
    toast.success(`${product.name} (${weight}) ajouté au panier !`);
  };

  if (!product) return null;

  // Debug du produit
  console.log('🔍 ProductDetail - Produit reçu:', {
    name: product.name,
    image_url: product.image_url,
    video_url: product.video_url,
    hasImage: !!(product.image_url && product.image_url.trim() !== ''),
    hasVideo: !!(product.video_url && product.video_url.trim() !== '')
  });

  // Créer une liste des prix avec promotions
  const priceList = Object.entries(product.prices || {})
    .filter(([, price]) => {
      return price !== undefined && 
             price !== null && 
             price !== 0 && 
             price !== '' && 
             !isNaN(Number(price)) && 
             Number(price) > 0;
    })
    .map(([weight, price]) => {
      const promo = product.promotions?.[weight as keyof typeof product.promotions] || 0;
      const originalPrice = Number(price);
      const finalPrice = promo > 0 ? originalPrice * (1 - promo / 100) : originalPrice;
      
      return {
        weight,
        originalPrice,
        finalPrice,
        discount: promo
      };
    })
    .sort((a, b) => {
      const weightA = parseInt(a.weight);
      const weightB = parseInt(b.weight);
      return weightA - weightB;
    });

  return (
    <div className="fixed inset-0 z-[100000] bg-black">
      {/* Contenu principal */}
      <div className="relative w-full h-full bg-gray-900 flex flex-col">
        {/* Header avec bouton fermer - fixe */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black to-transparent">
          <button 
            onClick={onClose}
            className="ml-auto block text-white hover:text-gray-300 bg-black/50 backdrop-blur-sm rounded-full p-2.5"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenu scrollable avec padding bottom pour éviter que le contenu soit caché */}
        <div className="w-full h-full overflow-y-auto pb-20">
          {/* Vidéo en priorité dans page détails */}
          <div className="relative w-full aspect-square bg-black">
            {product.video_url && product.video_url.trim() !== '' ? (
              // Affichage vidéo en priorité dans les détails
              <video 
                src={product.video_url}
                className="w-full h-full object-contain"
                controls
                muted
                playsInline
                preload="metadata"
                onLoadStart={() => console.log('🎥 Début chargement vidéo:', product.video_url)}
                onLoadedData={() => console.log('✅ Vidéo chargée avec succès')}
                onError={(e) => console.error('❌ Erreur chargement vidéo:', e, product.video_url)}
              >
                <source src={product.video_url} type="video/mp4" />
                <source src={product.video_url} type="video/webm" />
                <source src={product.video_url} type="video/ogg" />
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            ) : product.image_url && product.image_url.trim() !== '' ? (
              // Fallback sur image si pas de vidéo
              <img 
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain"
                loading="lazy"
                onLoad={() => console.log('✅ Image chargée avec succès:', product.image_url)}
                onError={(e) => console.error('❌ Erreur chargement image:', e, product.image_url)}
              />
            ) : (
              // Placeholder si ni vidéo ni image
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <div>Aucun média</div>
                </div>
              </div>
            )}
          </div>

          {/* Infos produit */}
          <div className="p-4 space-y-4">
            <div>
              <p className="text-gray-400 font-medium mb-2">
                {product.category.replace(/\s*📦\s*/g, '').trim()}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wide">
                {product.name}
              </h2>
            </div>
            
            {/* Description du produit avec support Markdown */}
            {product.description && (
              <div className="p-3 sm:p-4 bg-gray-800/50 rounded-lg border border-white/10">
                <div className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                  {renderMarkdownToJSX(parseMarkdown(product.description))}
                </div>
              </div>
            )}

            {/* Liste des prix */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                <span className="mr-2">💰</span>
                Tarifs disponibles :
              </h3>
              <div className="space-y-2">
                {priceList.map(({ weight, originalPrice, finalPrice, discount }, idx) => (
                  <div key={idx} className="bg-gray-800 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{weight}</span>
                      {discount > 0 && (
                        <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-xs font-bold">
                          -{discount}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        {discount > 0 && (
                          <span className="text-gray-500 line-through text-xs block">{originalPrice}€</span>
                        )}
                        <span className="font-bold text-white">{finalPrice.toFixed(2)}€</span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(weight, finalPrice, originalPrice, discount)}
                        className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 text-sm"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="hidden sm:inline">Ajouter</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}