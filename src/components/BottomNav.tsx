import React from 'react';
import { Home, Flame, Image, Film, Grid } from 'lucide-react';
import { NavigationTab } from '../types/news';

interface BottomNavProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  breakingCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  breakingCount = 0
}) => {
  const navItems: { tab: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      tab: 'home',
      label: 'होम',
      icon: <Home className="w-5 h-5" />
    },
    {
      tab: 'breaking',
      label: 'ब्रेकिंग',
      icon: <Flame className="w-5 h-5" />,
      badge: breakingCount > 0 ? breakingCount : undefined
    },
    {
      tab: 'photos',
      label: 'फोटो',
      icon: <Image className="w-5 h-5" />
    },
    {
      tab: 'videos',
      label: 'वीडियो',
      icon: <Film className="w-5 h-5" />
    },
    {
      tab: 'categories',
      label: 'श्रेणियाँ',
      icon: <Grid className="w-5 h-5" />
    }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={`min-h-[44px] flex flex-col items-center justify-center relative transition-colors ${
                isActive ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-devanagari-heading mt-1 tracking-tight">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 bg-red-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
