'use client';
import { useState, useEffect } from 'react';

interface Product {
  _id?: string;
  name: string;
  farm: string;
  category: string;
  image: string;
  video?: string;
  prices: {
    '5g': number;
    '10g': number;
    '25g': number;
    '50g': number;
    '100g': number;
    '200g': number;
  };
  description?: string;
  isActive: boolean;
}

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [farms, setFarms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    farm: '',
    category: '',
    image: '',
    video: '',
    prices: {
      '5g': 0,
      '10g': 0,
      '25g': 0,
      '50g': 0,
      '100g': 0,
      '200g': 0
    },
    description: '',
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Début du chargement des données...');
      
      // Charger les produits
      console.log('📦 Chargement des produits...');
      const productsRes = await fetch('/api/cloudflare/products');
      console.log('📦 Réponse produits:', productsRes.status);
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        console.log('📦 Produits chargés:', productsData.length);
        setProducts(productsData);
      }

      // Charger les catégories
      console.log('🏷️ Chargement des catégories...');
      const categoriesRes = await fetch('/api/cloudflare/categories');
      console.log('🏷️ Réponse catégories:', categoriesRes.status);
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        console.log('🏷️ Catégories chargées:', categoriesData.length);
        setCategories(categoriesData.map((c: any) => c.name));
      }

      // Charger les farms
      console.log('🏭 Chargement des farms...');
      const farmsRes = await fetch('/api/cloudflare/farms');
      console.log('🏭 Réponse farms:', farmsRes.status);
      if (farmsRes.ok) {
        const farmsData = await farmsRes.json();
        console.log('🏭 Farms chargées:', farmsData.length);
        setFarms(farmsData.map((f: any) => f.name));
      }
      
      console.log('✅ Chargement terminé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      farm: '',
      category: '',
      image: '',
      video: '',
      prices: {
        '5g': 0,
        '10g': 0,
        '25g': 0,
        '50g': 0,
        '100g': 0,
        '200g': 0
      },
      description: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const url = editingProduct ? `/api/cloudflare/products/${editingProduct._id}` : '/api/cloudflare/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        loadData();
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (productId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        const response = await fetch(`/api/cloudflare/products/${productId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          loadData();
        } else {
          alert('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updatePrice = (weight: string, price: number) => {
    setFormData(prev => ({
      ...prev,
      prices: { ...prev.prices!, [weight]: price }
    }));
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
        <h1 className="text-2xl md:text-3xl font-bold text-white">Gestion des Produits</h1>
        <button
          onClick={handleAdd}
          className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded-lg flex items-center space-x-2 w-full sm:w-auto"
        >
          <span>➕</span>
          <span className="hidden sm:inline">Ajouter un produit</span>
          <span className="sm:hidden">Nouveau</span>
        </button>
      </div>

      {/* Liste des produits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-gray-900 border border-white/20 rounded-xl overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-white text-lg">{product.name}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  product.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {product.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">{product.farm}</p>
              <p className="text-gray-500 text-xs mb-3">{product.category}</p>
              <p className="text-white font-medium mb-4">À partir de {product.prices['5g']}€</p>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => handleDelete(product._id!)}
                  className="bg-red-600 hover:bg-red-500 text-white py-2 px-3 rounded text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateFormField('name', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Farm</label>
                <select
                  value={formData.farm || ''}
                  onChange={(e) => updateFormField('farm', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2"
                >
                  <option value="">Sélectionner une farm</option>
                  {farms.map(farm => (
                    <option key={farm} value={farm}>{farm}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => updateFormField('category', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
                <select
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => updateFormField('isActive', e.target.value === 'true')}
                  className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2"
                >
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">URL Image</label>
              <input
                type="url"
                value={formData.image || ''}
                onChange={(e) => updateFormField('image', e.target.value)}
                className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">URL Vidéo (optionnel)</label>
              <input
                type="url"
                value={formData.video || ''}
                onChange={(e) => updateFormField('video', e.target.value)}
                className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2"
                placeholder="https://example.com/video.mp4"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => updateFormField('description', e.target.value)}
                className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 h-20"
                placeholder="Description du produit..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-4">Prix par quantité</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(formData.prices || {}).map(([weight, price]) => (
                  <div key={weight}>
                    <label className="block text-xs text-gray-400 mb-1">{weight}</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => updatePrice(weight, Number(e.target.value))}
                      className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2"
                      placeholder="Prix en €"
                    />
                  </div>
                ))}
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