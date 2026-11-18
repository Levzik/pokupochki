import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ActiveTab } from './types';
import { usePokupochki } from './hooks/usePokupochki';
import { Header } from './components/Header';
import { TabSwitch, MobileBottomNav } from './components/Navigation';
import { DailyListView } from './components/daily/DailyListView';
import { MainPurchasesView } from './components/main/MainPurchasesView';
import { StatsView } from './components/stats/StatsView';
import { SettingsView } from './components/settings/SettingsView';
import { AndroidWidgetModal } from './components/common/AndroidWidgetModal';

export const App: React.FC = () => {
  // Check URL param for initial tab (e.g. from PWA shortcuts)
  const getInitialTab = (): ActiveTab => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'main') return 'main';
      if (tabParam === 'daily') return 'daily';
      if (tabParam === 'stats') return 'stats';
      if (tabParam === 'settings') return 'settings';
    }
    return 'daily';
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>(getInitialTab);
  const [isMainAddModalOpen, setIsMainAddModalOpen] = useState(false);
  const [isAndroidWidgetOpen, setIsAndroidWidgetOpen] = useState(false);

  const {
    dailyItems,
    mainPurchases,
    settings,
    isLoading,
    addDailyItem,
    toggleDailyItem,
    updateDailyItem,
    deleteDailyItem,
    clearCompletedDaily,
    addMainPurchase,
    updateMainPurchase,
    deleteMainPurchase,
    updateSettings,
    triggerSync,
    reloadFromDB,
  } = usePokupochki();

  // Floating plus button click handler
  const handleFloatingPlusClick = () => {
    if (activeTab === 'main') {
      setIsMainAddModalOpen(true);
    } else {
      // Focus the input in daily list or scroll to it
      const input = document.querySelector('input[placeholder="Что купить?"]') as HTMLInputElement;
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FED766] animate-bounce flex items-center justify-center shadow-md">
            <span className="text-xl">🛍️</span>
          </div>
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Загрузка «Покупочек»...
          </p>
        </div>
      </div>
    );
  }

  const isShoppingSection = activeTab === 'main' || activeTab === 'daily';

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col selection:bg-amber-200 relative overflow-x-hidden">
      {/* Background Decorative Ambient Gradients & Geometric Circles (Minimal Bento Style as in reference photos) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Soft Ambient Radial Blur Glows */}
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#FED766]/30 via-[#FEE488]/15 to-transparent blur-3xl opacity-80" />
        <div className="absolute top-10 -right-28 w-[450px] h-[450px] rounded-full bg-gradient-to-bl from-[#F8B4C0]/25 via-[#FDE4E8]/15 to-transparent blur-3xl opacity-75" />
        <div className="absolute top-[45%] -left-32 w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-teal-200/20 via-emerald-100/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute -bottom-20 right-10 w-[420px] h-[420px] rounded-full bg-gradient-to-tl from-purple-200/20 via-indigo-100/10 to-transparent blur-3xl opacity-60" />

        {/* Floating Pastel Decorative Circles (Exact like in Reference Photos) */}
        {/* Top-Left Cluster */}
        <div className="absolute top-12 left-8 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#FED766]/20 border-2 border-[#FED766]/35" />
        <div className="absolute top-36 left-28 w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-[#FED766]/25" />
        <div className="absolute top-48 left-12 w-4 h-4 rounded-full bg-[#F8B4C0]/50" />

        {/* Top-Right Cluster */}
        <div className="absolute top-16 right-10 w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-[#F8B4C0]/20 border-2 border-[#F8B4C0]/30" />
        <div className="absolute top-48 right-24 w-14 h-14 sm:w-20 sm:h-20 rounded-full border-3 border-[#F8B4C0]/35" />
        <div className="absolute top-28 right-48 w-5 h-5 rounded-full bg-[#FED766]/60" />
        <div className="absolute top-64 right-12 w-3 h-3 rounded-full bg-rose-400/40" />

        {/* Mid-Screen Accents */}
        <div className="absolute top-[45%] -left-8 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-teal-100/30 border border-teal-200/40" />
        <div className="absolute top-[55%] left-16 w-10 h-10 rounded-full border-2 border-teal-300/30" />
        <div className="absolute top-[38%] right-8 w-8 h-8 rounded-full bg-purple-200/35" />

        {/* Bottom Cluster */}
        <div className="absolute bottom-24 right-12 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-purple-100/25 border border-purple-200/35" />
        <div className="absolute bottom-16 right-44 w-16 h-16 rounded-full bg-[#FED766]/20 border border-[#FED766]/30" />
        <div className="absolute bottom-40 left-8 w-5 h-5 rounded-full bg-amber-400/40" />

        {/* Subtle Decorative Bag Mascot (Desktop Background Watermark) */}
        <div className="hidden lg:block absolute bottom-12 left-10 opacity-15 select-none pointer-events-none transform -rotate-6">
          <svg className="w-48 h-48 text-[#FED766]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 8V6C8 4.34315 9.34315 3 11 3H13C14.6569 3 16 4.34315 16 6V8" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M4 8.5C4 7.67157 4.67157 7 5.5 7H18.5C19.3284 7 20 7.67157 20 8.5L19 19.5C19 20.3284 18.3284 21 17.5 21H6.5C5.67157 21 5 20.3284 5 19.5L4 8.5Z" stroke="#78350F" strokeWidth="1.5" />
            <path d="M9.5 13C10.5 14.5 13.5 14.5 14.5 13" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      </div>

      {/* Top Header */}
      <div className="relative z-10">
        <Header
          settings={settings}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenAddModal={() => {
            if (activeTab === 'main') {
              setIsMainAddModalOpen(true);
            } else {
              handleFloatingPlusClick();
            }
          }}
          onSyncClick={triggerSync}
          onOpenWidgetInfo={() => setIsAndroidWidgetOpen(true)}
        />
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-24 sm:pb-12">
        {/* Minimal Bento Segmented Switch (Visible in Shopping sections) */}
        {isShoppingSection && (
          <div className="flex justify-center mb-6">
            <TabSwitch
              currentSection={activeTab as 'main' | 'daily'}
              onChange={(section) => setActiveTab(section)}
            />
          </div>
        )}

        {/* Section Views */}
        {activeTab === 'daily' && (
          <DailyListView
            items={dailyItems}
            onAdd={addDailyItem}
            onToggle={toggleDailyItem}
            onUpdate={updateDailyItem}
            onDelete={deleteDailyItem}
            onClearCompleted={clearCompletedDaily}
          />
        )}

        {activeTab === 'main' && (
          <MainPurchasesView
            purchases={mainPurchases}
            onAdd={addMainPurchase}
            onUpdate={updateMainPurchase}
            onDelete={deleteMainPurchase}
            isAddModalOpen={isMainAddModalOpen}
            setIsAddModalOpen={setIsMainAddModalOpen}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            dailyItems={dailyItems}
            mainPurchases={mainPurchases}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={updateSettings}
            onTriggerSync={triggerSync}
            onOpenWidgetModal={() => setIsAndroidWidgetOpen(true)}
            onDataReloaded={reloadFromDB}
          />
        )}
      </main>

      {/* 
        Mobile Floating Action Button ("+")
        Styled in pastel pink/yellow as in the reference screens 
      */}
      {isShoppingSection && (
        <button
          onClick={handleFloatingPlusClick}
          aria-label="Добавить"
          className="sm:hidden fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-[#F8B4C0] hover:bg-[#F59BB0] active:scale-95 text-stone-900 flex items-center justify-center shadow-lg transition-transform duration-150"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Android Widget Modal */}
      <AndroidWidgetModal
        isOpen={isAndroidWidgetOpen}
        onClose={() => setIsAndroidWidgetOpen(false)}
      />
    </div>
  );
};
export default App;
