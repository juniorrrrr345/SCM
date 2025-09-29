import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  productName: string;
  image: string;
  weight: string;
  price: number;
  quantity: number;
  originalPrice: number;
  discount: number;
  service?: 'livraison' | 'envoi' | 'meetup';
  schedule?: string;
}

export interface DeliveryService {
  id: 'livraison' | 'envoi' | 'meetup';
  name: string;
  icon: string;
  description: string;
  needsSchedule: boolean;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string, weight: string) => void;
  updateQuantity: (productId: string, weight: string, quantity: number) => void;
  updateService: (productId: string, weight: string, service: 'livraison' | 'envoi' | 'meetup') => void;
  updateSchedule: (productId: string, weight: string, schedule: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  setIsOpen: (isOpen: boolean) => void;
  getItemsNeedingService: () => CartItem[];
  getItemsNeedingSchedule: () => CartItem[];
  isCartReadyForOrder: () => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (item) => set((state) => {
        const existingItemIndex = state.items.findIndex(
          (i) => i.productId === item.productId && i.weight === item.weight
        );
        
        if (existingItemIndex > -1) {
          const newItems = [...state.items];
          newItems[existingItemIndex].quantity += 1;
          return { items: newItems };
        }
        
        return { items: [...state.items, { ...item, quantity: 1 }] };
      }),
      
      removeItem: (productId, weight) => set((state) => ({
        items: state.items.filter(
          (item) => !(item.productId === productId && item.weight === weight)
        )
      })),
      
      updateQuantity: (productId, weight, quantity) => set((state) => {
        if (quantity <= 0) {
          return {
            items: state.items.filter(
              (item) => !(item.productId === productId && item.weight === weight)
            )
          };
        }
        
        const newItems = state.items.map((item) =>
          item.productId === productId && item.weight === weight
            ? { ...item, quantity }
            : item
        );
        
        return { items: newItems };
      }),
      
      clearCart: () => set({ items: [] }),
      
      getTotalPrice: () => {
        const items = get().items;
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getTotalItems: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      updateService: (productId, weight, service) => set((state) => {
        const newItems = state.items.map((item) =>
          item.productId === productId && item.weight === weight
            ? { ...item, service }
            : item
        );
        return { items: newItems };
      }),
      
      updateSchedule: (productId, weight, schedule) => set((state) => {
        const newItems = state.items.map((item) =>
          item.productId === productId && item.weight === weight
            ? { ...item, schedule }
            : item
        );
        return { items: newItems };
      }),
      
      getItemsNeedingService: () => {
        const items = get().items;
        return items.filter(item => !item.service);
      },
      
      getItemsNeedingSchedule: () => {
        const items = get().items;
        return items.filter(item => item.service && !item.schedule);
      },
      
      isCartReadyForOrder: () => {
        const items = get().items;
        return items.length > 0 && items.every(item => {
          // Chaque item doit avoir un service
          if (!item.service) return false;
          // Tous les services nécessitent maintenant une option/horaire
          if (!item.schedule) return false;
          return true;
        });
      },
      
      setIsOpen: (isOpen) => set({ isOpen })
    }),
    {
      name: 'cart-storage'
    }
  )
);