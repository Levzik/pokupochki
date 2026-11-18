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
      {/* Background Decorative Ambient Pastel Circles (Matching reference mockups) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Soft corner pastel shapes exactly like references */}
        <div className="absolute -top-10 -left-14 w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-[#FED766]/35" />
        <div className="absolute top-28 -right-16 w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[#F8B4C0]/30" />
        <div className="absolute -bottom-12 -left-12 w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-[#A7F3D0]/30" />
        <div className="absolute -bottom-10 -right-10 w-44 h-44 sm:w-60 sm:h-60 rounded-full bg-[#DDD6FE]/30" />

        {/* Delicate ambient glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-100/30 rounded-full blur-3xl opacity-60" />
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
