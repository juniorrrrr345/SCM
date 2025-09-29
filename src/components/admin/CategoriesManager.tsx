'use client';
import { useState, useEffect } from 'react';
import { notifyAdminUpdate } from '../../hooks/useAdminSync';

interface Category {
  id?: number;
  name: string;
  description?: string;
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log('🏷️ Admin: Chargement des catégories...');
      const response = await fetch('/api/cloudflare/categories');
      console.log('🏷️ Admin: Réponse catégories:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('🏷️ Admin: Catégories chargées:', data.length);
        
        // Adapter les données API (id → _id) pour compatibilité interface
        const adaptedData = data.map((category: any) => ({
          ...category,
          _id: category.id?.toString() || category._id
        }));
        
        console.log('🏷️ Catégories adaptées:', adaptedData);
        setCategories(adaptedData);
      } else {
        console.error('🏷️ Admin: Erreur HTTP:', response.status);
      }
    } catch (error) {
      console.error('❌ Admin: Erreur lors du chargement des catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData(category);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Veuillez entrer un nom pour la catégorie');
      return;
    }

    try {
      const url = editingCategory ? `/api/cloudflare/categories/${editingCategory._id}` : '/api/cloudflare/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      console.log('💾 Sauvegarde catégorie:', { url, method, data: formData });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Message de succès
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-8 py-4 rounded-lg shadow-2xl z-[9999] transition-all duration-500 border-2 border-green-400';
        successMsg.innerHTML = `
          <div class="flex items-center space-x-3">
            <div class="text-2xl">✅</div>
            <div>
              <div class="font-bold text-lg">${editingCategory ? 'Catégorie modifiée avec succès!' : 'Catégorie ajoutée avec succès!'}</div>
              <div class="text-green-100 text-sm">Disponible immédiatement dans la boutique</div>
            </div>
          </div>
        `;
        document.body.appendChild(successMsg);
        setTimeout(() => {
          successMsg.style.opacity = '0';
          successMsg.style.transform = 'translateX(100%)';
          setTimeout(() => successMsg.remove(), 500);
        }, 4000);
        
        // Notifier les autres onglets du changement
        notifyAdminUpdate('categories', editingCategory ? 'update' : 'create', { id: editingCategory?._id });
        
        setShowModal(false);
        await loadCategories();
        
        // Forcer la synchronisation et revalidation
        try {
          await fetch('/api/cache/invalidate', { method: 'POST' });
          await fetch('/api/revalidate', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: '/' })
          });
          console.log('✅ Cache invalidé et boutique revalidée');
        } catch (e) {
          console.error('Erreur invalidation/revalidation cache:', e);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur sauvegarde:', errorText);
        alert(`Erreur: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (categoryId: string) => {
    const categoryName = categories.find(c => c._id === categoryId)?.name || 'cette catégorie';
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${categoryName}" ?\n\n⚠️ ATTENTION: Tous les produits de cette catégorie seront également supprimés !`)) {
      try {
        // Suppression optimiste - retirer immédiatement de l'interface
        const originalCategories = [...categories];
        setCategories(prev => prev.filter(cat => cat._id !== categoryId));

        console.log('🗑️ Suppression catégorie avec produits:', categoryId);
        
        // Utiliser la nouvelle API qui gère automatiquement les produits
        const response = await fetch('/api/delete-category', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            categoryName: categoryName
          }),
        });

        console.log('📡 Réponse suppression:', response.status);
        const result = await response.json();

        if (response.ok && result.success) {
          console.log('✅ Catégorie et produits supprimés avec succès');
          
          // Notifier les autres onglets de la suppression
          notifyAdminUpdate('categories', 'delete', { id: categoryId });
          notifyAdminUpdate('products', 'delete', { category: categoryName });
          
          // Vider le localStorage pour forcer le rechargement
          localStorage.removeItem('categories');
          localStorage.removeItem('products');
          localStorage.removeItem('adminData');
          
          // Recharger les données depuis l'API après suppression
          setTimeout(() => {
            loadCategories();
          }, 500);
          
          // Afficher message de succès avec détails
          const successMsg = document.createElement('div');
          successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]';
          successMsg.innerHTML = `
            <div class="font-bold">✅ "${categoryName}" supprimée!</div>
            <div class="text-sm">${result.productsMoved || 0} produits supprimés</div>
          `;
          document.body.appendChild(successMsg);
          
          setTimeout(() => successMsg.remove(), 4000);
        } else {
          // En cas d'erreur, restaurer l'état original
          console.error('❌ Erreur suppression, restauration...');
          setCategories(originalCategories);
          
          const errorMsg = document.createElement('div');
          errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]';
          errorMsg.textContent = `❌ Erreur: ${result.error || 'Impossible de supprimer la catégorie'}`;
          document.body.appendChild(errorMsg);
          
          setTimeout(() => errorMsg.remove(), 5000);
        }
      } catch (error) {
        console.error('❌ Erreur suppression catégorie:', error);
        
        // Restaurer en cas d'erreur
        setCategories(originalCategories);
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]';
        errorMsg.textContent = `❌ Erreur: ${error.message}`;
        document.body.appendChild(errorMsg);
        
        setTimeout(() => errorMsg.remove(), 5000);
      }
    }
  };

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Gestion des Catégories</h1>
        <button
          onClick={handleAdd}
          className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded-lg flex items-center space-x-2 w-full sm:w-auto"
        >
          <span>➕</span>
          <span className="hidden sm:inline">Ajouter une catégorie</span>
          <span className="sm:hidden">Nouvelle</span>
        </button>
      </div>

      {/* Liste des catégories avec scroll */}
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <div key={category._id} className="bg-gray-900 border border-white/20 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-white text-xl">{category.name}</h3>
              </div>
            
            {category.description && (
              <p className="text-gray-400 text-sm mb-4">{category.description}</p>
            )}
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(category)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm"
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => handleDelete(category._id!)}
                className="bg-red-600 hover:bg-red-500 text-white py-2 px-3 rounded text-sm"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Modal d'édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateFormField('name', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2"
                  placeholder="Ex: 120U ++ 🇲🇦"
                />
              </div>


            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleSave}
                className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded-lg flex-1"
              >
                💾 Sauvegarder
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
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