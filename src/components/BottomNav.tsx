'use client';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  {
    id: 'menu',
    label: 'Menu',
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    )
  },
  {
    id: 'infos',
    label: 'Infos',
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 'social',
    label: 'Réseaux',
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12h0M12 12h0M9 12h0" />
      </svg>
    )
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  }
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Déterminer l'onglet actif basé sur l'URL
  const getActiveTab = () => {
    if (pathname === '/info') return 'infos';
    if (pathname === '/contact') return 'contact';
    if (pathname === '/social') return 'social';
    return 'menu';
  };
  
  const activeTab = getActiveTab();
  
  const handleTabClick = (tabId: string) => {
    // Navigation basée sur l'ID
    switch (tabId) {
      case 'menu':
        router.push('/');
        break;
      case 'infos':
        router.push('/info');
        break;
      case 'contact':
        router.push('/contact');
        break;
      case 'social':
        router.push('/social');
        break;
    }
  };

  return (
    <nav 
      className="bottom-nav-container bg-black/80 backdrop-blur-sm border-t border-white/10 safe-area-padding"
    >
      <div className="flex items-center justify-around py-1.5 sm:py-2 px-2 sm:px-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`flex flex-col items-center justify-center py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg transition-all duration-200 touch-manipulation min-w-0 flex-1 max-w-[80px] ${
              activeTab === item.id
                ? 'text-white bg-white/10 border border-white/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            style={{ 
              touchAction: 'manipulation',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
          >
            <div className={`transition-transform duration-200 ${
              activeTab === item.id ? 'scale-110' : ''
            }`}>
              {item.icon}
            </div>
            <span className="text-xxs sm:text-xs font-medium mt-0.5 sm:mt-1 tracking-wide truncate w-full text-center">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}