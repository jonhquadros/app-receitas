import React from 'react';
import { Home, Search, Heart, MoreHorizontal } from 'lucide-react';

export type TabType = 'home' | 'search' | 'favorites' | 'more';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Início', icon: Home },
    { id: 'search' as TabType, label: 'Buscar', icon: Search },
    { id: 'favorites' as TabType, label: 'Favoritos', icon: Heart },
    { id: 'more' as TabType, label: 'Mais', icon: MoreHorizontal },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1E2220]/95 backdrop-blur-md border-t border-emerald-100 dark:border-emerald-950/60 shadow-lg px-2 pb-safe"
      aria-label="Navegação principal"
    >
      <div className="max-w-lg mx-auto grid grid-cols-4 h-[68px] items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[52px] w-full rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-800 dark:text-emerald-400 font-bold bg-emerald-50/80 dark:bg-emerald-950/40'
                  : 'text-stone-600 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`w-6 h-6 transition-transform duration-200 ${
                  isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[2]'
                }`}
              />
              <span className="text-[13px] tracking-tight mt-1 leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
