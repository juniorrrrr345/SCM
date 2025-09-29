'use client';
import { useState } from 'react';
import ProductsManager from './ProductsManager';
import SettingsManager from './SettingsManager';
import CategoriesManager from './CategoriesManager';
import FarmsManager from './FarmsManager';
import PagesManager from './PagesManager';
import SocialLinksManager from './SocialLinksManager';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Produits', icon: '🛍️' },
    { id: 'categories', label: 'Catégories', icon: '🏷️' },
    { id: 'farms', label: 'Farms', icon: '🏭' },
    { id: 'settings', label: 'Configuration', icon: '⚙️' },
    { id: 'pages', label: 'Pages', icon: '📄' },
    { id: 'social', label: 'Réseaux sociaux', icon: '🌐' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsManager />;
      case 'categories':
        return <CategoriesManager />;
      case 'farms':
        return <FarmsManager />;
      case 'settings':
        return <SettingsManager />;
      case 'pages':
        return <PagesManager />;
      case 'social':
        return <SocialLinksManager />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-900 border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-white">HashBurger Admin</h1>
            <p className="text-gray-400 text-xs">Administration</p>
          </div>
          <button
            onClick={onLogout}
            className="text-red-400 hover:text-red-300 p-2"
          >
            🚪
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-gray-900 border-r border-white/20 min-h-screen">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <h1 className="text-xl font-black text-white">HashBurger</h1>
            <p className="text-gray-400 text-sm">Administration</p>
          </div>

          {/* Menu */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="absolute bottom-4 left-4 right-4 max-w-56">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
            >
              <span className="text-lg">🚪</span>
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-white/20">
        <div className="grid grid-cols-4 gap-1 p-2">
          {menuItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
        {menuItems.length > 4 && (
          <div className="grid grid-cols-3 gap-1 p-2 pt-0">
            {menuItems.slice(4).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-lg mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardHome() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard HashBurger</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats cards */}
        <div className="bg-gray-900 border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Produits actifs</p>
              <p className="text-2xl font-bold text-white">6</p>
            </div>
            <div className="text-3xl">🛍️</div>
          </div>
        </div>

        <div className="bg-gray-900 border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Catégories</p>
              <p className="text-2xl font-bold text-white">6</p>
            </div>
            <div className="text-3xl">🏷️</div>
          </div>
        </div>

        <div className="bg-gray-900 border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Farms</p>
              <p className="text-2xl font-bold text-white">5</p>
            </div>
            <div className="text-3xl">🏭</div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-gray-900 border border-white/20 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <span className="text-2xl mb-2">➕</span>
            <span className="text-white text-sm">Ajouter un produit</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <span className="text-2xl mb-2">🏷️</span>
            <span className="text-white text-sm">Nouvelle catégorie</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <span className="text-2xl mb-2">⚙️</span>
            <span className="text-white text-sm">Paramètres</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <span className="text-2xl mb-2">📊</span>
            <span className="text-white text-sm">Statistiques</span>
          </button>
        </div>
      </div>
    </div>
  );
}