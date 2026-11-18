import React from 'react';
import { ShoppingBag, BarChart3, Settings } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const TabSwitch: React.FC<{
  currentSection: 'main' | 'daily';
  onChange: (section: 'main' | 'daily') => void;
}> = ({ currentSection, onChange }) => {
  return (
    <div className="inline-flex p-1 rounded-2xl sm:rounded-full bg-[#F2EDE4]/80 backdrop-blur-xs border border-stone-200/50 shadow-inner w-full sm:w-auto">
      <button
        type="button"
        onClick={() => onChange('main')}
        className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl sm:rounded-full text-sm font-bold transition-all duration-200 ${
          currentSection === 'main'
            ? 'bg-[#FED766] text-stone-900 shadow-sm'
            : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        Главные
      </button>
      <button
        type="button"
        onClick={() => onChange('daily')}
        className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl sm:rounded-full text-sm font-bold transition-all duration-200 ${
          currentSection === 'daily'
            ? 'bg-[#FED766] text-stone-900 shadow-sm'
            : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        Каждоднев
      </button>
    </div>
  );
};

export const MobileBottomNav: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const isPurchasesActive = activeTab === 'main' || activeTab === 'daily';

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-stone-200/80 px-6 py-2 flex items-center justify-around shadow-lg">
      <button
        onClick={() => onTabChange(activeTab === 'main' ? 'main' : 'daily')}
        className={`flex flex-col items-center gap-1 py-1 transition-colors ${
          isPurchasesActive ? 'text-amber-800 font-bold' : 'text-stone-400'
        }`}
      >
        <div className={`p-1.5 rounded-xl ${isPurchasesActive ? 'bg-[#FED766]' : ''}`}>
          <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
        </div>
        <span className="text-[11px]">Покупки</span>
      </button>

      <button
        onClick={() => onTabChange('stats')}
        className={`flex flex-col items-center gap-1 py-1 transition-colors ${
          activeTab === 'stats' ? 'text-amber-800 font-bold' : 'text-stone-400'
        }`}
      >
        <div className={`p-1.5 rounded-xl ${activeTab === 'stats' ? 'bg-[#FED766]' : ''}`}>
          <BarChart3 className="w-5 h-5 stroke-[2.2]" />
        </div>
        <span className="text-[11px]">Статистика</span>
      </button>

      <button
        onClick={() => onTabChange('settings')}
        className={`flex flex-col items-center gap-1 py-1 transition-colors ${
          activeTab === 'settings' ? 'text-amber-800 font-bold' : 'text-stone-400'
        }`}
      >
        <div className={`p-1.5 rounded-xl ${activeTab === 'settings' ? 'bg-[#FED766]' : ''}`}>
          <Settings className="w-5 h-5 stroke-[2.2]" />
        </div>
        <span className="text-[11px]">Настройки</span>
      </button>
    </nav>
  );
};
