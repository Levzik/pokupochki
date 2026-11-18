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
        className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group min-w-0"
      >
        <img
          src="./app-logo.png"
          alt="Покупочки"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl shadow-sm object-cover group-hover:scale-105 transition-transform duration-200 shrink-0"
        />
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 font-sans leading-none whitespace-nowrap">
            Покупочки
          </h1>
          <p className="hidden sm:block text-xs text-stone-500 font-medium mt-1 whitespace-nowrap">
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
