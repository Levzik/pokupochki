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
  const isMain = currentSection === 'main';

  return (
    <div className="relative inline-flex p-1 rounded-2xl sm:rounded-full bg-[#EDE6DC]/85 border border-stone-200/60 shadow-inner w-full sm:w-[320px] select-none">
      {/* 
        Smooth Sliding Spring Capsule Background 
        Moves seamlessly between "Главные" and "Каждоднев"
      */}
      <div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl sm:rounded-full bg-gradient-to-b from-[#FED766] to-[#FDBF3B] shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none"
        style={{
          transform: isMain ? 'translateX(0px)' : 'translateX(calc(100%))'
        }}
      />

      <button
        type="button"
        onClick={() => onChange('main')}
        className={`relative z-10 flex-1 py-2 sm:py-2.5 rounded-xl sm:rounded-full text-sm font-bold transition-colors duration-200 text-center ${
          isMain ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        Главные
      </button>

      <button
        type="button"
        onClick={() => onChange('daily')}
        className={`relative z-10 flex-1 py-2 sm:py-2.5 rounded-xl sm:rounded-full text-sm font-bold transition-colors duration-200 text-center ${
          !isMain ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800'
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
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-6 py-2 flex items-center justify-around shadow-lg">
      <button
        onClick={() => onTabChange(activeTab === 'main' ? 'main' : 'daily')}
        className={`flex flex-col items-center gap-1 py-1 transition-all duration-200 active:scale-95 ${
          isPurchasesActive ? 'text-amber-900 font-bold' : 'text-stone-400 hover:text-stone-600'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-all duration-200 ${isPurchasesActive ? 'bg-[#FED766] shadow-xs' : ''}`}>
          <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
        </div>
        <span className="text-[11px]">Покупки</span>
      </button>

      <button
        onClick={() => onTabChange('stats')}
        className={`flex flex-col items-center gap-1 py-1 transition-all duration-200 active:scale-95 ${
          activeTab === 'stats' ? 'text-amber-900 font-bold' : 'text-stone-400 hover:text-stone-600'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-all duration-200 ${activeTab === 'stats' ? 'bg-[#FED766] shadow-xs' : ''}`}>
          <BarChart3 className="w-5 h-5 stroke-[2.2]" />
        </div>
        <span className="text-[11px]">Статистика</span>
      </button>

      <button
        onClick={() => onTabChange('settings')}
        className={`flex flex-col items-center gap-1 py-1 transition-all duration-200 active:scale-95 ${
          activeTab === 'settings' ? 'text-amber-900 font-bold' : 'text-stone-400 hover:text-stone-600'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-all duration-200 ${activeTab === 'settings' ? 'bg-[#FED766] shadow-xs' : ''}`}>
          <Settings className="w-5 h-5 stroke-[2.2]" />
        </div>
        <span className="text-[11px]">Настройки</span>
      </button>
    </nav>
  );
};
