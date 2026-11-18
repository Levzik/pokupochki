import React from 'react';
import { BarChart3, Settings, Plus, Sparkles } from 'lucide-react';
import { SyncSettings, ActiveTab } from '../types';
import { SyncBadge } from './common/SyncBadge';

interface HeaderProps {
  settings: SyncSettings;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onSyncClick: () => void;
  onOpenWidgetInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeTab,
  onTabChange,
  onOpenAddModal,
  onSyncClick,
  onOpenWidgetInfo,
}) => {
  return (
    <header className="w-full pt-4 pb-2 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex items-center justify-between transition-all">
      {/* Brand logo & title */}
      <div 
        onClick={() => onTabChange(activeTab === 'stats' || activeTab === 'settings' ? 'daily' : activeTab)}
        className="flex items-center gap-3 cursor-pointer select-none group"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#FED766] to-[#FDB927] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
          <svg className="w-6 h-6 text-stone-900 drop-shadow-xs" viewBox="0 0 24 24" fill="none">
            {/* Bag handle */}
            <path d="M8 8V6C8 4.34315 9.34315 3 11 3H13C14.6569 3 16 4.34315 16 6V8" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" />
            {/* Bag body */}
            <path d="M4 8.5C4 7.67157 4.67157 7 5.5 7H18.5C19.3284 7 20 7.67157 20 8.5L19 19.5C19 20.3284 18.3284 21 17.5 21H6.5C5.67157 21 5 20.3284 5 19.5L4 8.5Z" fill="#FEE488" stroke="#78350F" strokeWidth="2" />
            {/* Smile */}
            <path d="M9.5 13C10.5 14.5 13.5 14.5 14.5 13" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 font-sans leading-none">
            Покупочки
          </h1>
          <p className="hidden sm:block text-xs text-stone-500 font-medium mt-0.5">
            Планируй и покупай без лишнего
          </p>
        </div>
      </div>

      {/* Action items on right */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sync status */}
        <SyncBadge settings={settings} onSyncClick={onSyncClick} />

        {/* Android Widget Pill (Google Keep style) */}
        <button
          onClick={onOpenWidgetInfo}
          title="Виджет Android (Google Keep)"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Виджет Android</span>
        </button>

        {/* Stats Button */}
        <button
          onClick={() => onTabChange(activeTab === 'stats' ? 'daily' : 'stats')}
          title="Статистика"
          className={`p-2.5 rounded-2xl transition-all duration-150 ${
            activeTab === 'stats'
              ? 'bg-[#FED766] text-stone-900 shadow-sm'
              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/80'
          }`}
        >
          <BarChart3 className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Settings Button */}
        <button
          onClick={() => onTabChange(activeTab === 'settings' ? 'daily' : 'settings')}
          title="Настройки"
          className={`p-2.5 rounded-2xl transition-all duration-150 ${
            activeTab === 'settings'
              ? 'bg-[#FED766] text-stone-900 shadow-sm'
              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/80'
          }`}
        >
          <Settings className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Plus Button (visible on Desktop / Windows) */}
        <button
          onClick={onOpenAddModal}
          title="Добавить покупку"
          className="hidden sm:flex items-center justify-center w-10 h-10 rounded-2xl bg-[#FED766] hover:bg-[#FDC830] active:scale-95 text-stone-900 shadow-sm transition-all duration-150"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </header>
  );
};
