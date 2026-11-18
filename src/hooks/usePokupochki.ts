import { useState, useEffect, useCallback, useRef } from 'react';
import { DailyItem, MainPurchase, SyncSettings } from '../types';
import { db } from '../services/db';
import { githubSync } from '../services/githubSync';
import { matchProduct } from '../data/productCatalog';

// Initial demo items matching the visual references if DB is freshly opened
const INITIAL_DAILY: DailyItem[] = [
  {
    id: 'd-1',
    title: 'Хлеб',
    price: 90,
    imageUrl: './products/bread.jpg',
    category: 'Хлеб и выпечка',
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'd-2',
    title: 'Молоко',
    price: 130,
    imageUrl: './products/milk.jpg',
    category: 'Молочные продукты и яйца',
    completed: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'd-3',
    title: 'Чай',
    price: 270,
    imageUrl: './products/tea.jpg',
    category: 'Заморозка и напитки',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const INITIAL_MAIN: MainPurchase[] = [
  {
    id: 'm-1',
    title: 'Монитор',
    price: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
    piggyBankEnabled: true,
    savedAmount: 12000,
    category: 'Электроника',
    note: '4K IPS 27 дюймов для работы',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'm-2',
    title: 'Наушники',
    price: 18000,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    piggyBankEnabled: false,
    savedAmount: 6000,
    category: 'Гаджеты',
    note: 'Беспроводные с шумоподавлением',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'm-3',
    title: 'Гитара',
    price: 32000,
    imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
    piggyBankEnabled: false,
    savedAmount: 0,
    category: 'Хобби',
    note: 'Электрогитара типа Stratocaster',
    completed: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

export function usePokupochki() {
  const [dailyItems, setDailyItems] = useState<DailyItem[]>([]);
  const [mainPurchases, setMainPurchases] = useState<MainPurchase[]>([]);
  const [settings, setSettings] = useState<SyncSettings>({
    githubToken: '',
    githubRepo: '',
    githubBranch: 'main',
    githubFilePath: 'pokupochki-data.json',
    autoSync: true,
    syncStatus: 'idle',
  });
  const [isLoading, setIsLoading] = useState(true);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to notify native Android widget bridge if running inside native Android App
  const syncToAndroidBridge = (items: DailyItem[]) => {
    if (typeof window !== 'undefined' && (window as any).AndroidBridge?.syncDailyItemsToWidget) {
      try {
        (window as any).AndroidBridge.syncDailyItemsToWidget(JSON.stringify(items));
      } catch (e) {
        console.warn('AndroidBridge sync error:', e);
      }
    }
  };

  // Load from IndexedDB on startup
  const loadData = useCallback(async () => {
    try {
      let daily = await db.getAllDailyItems();
      let main = await db.getAllMainPurchases();
      const loadedSettings = await db.getSettings();

      // Seed initial demo data on fresh install
      if (daily.length === 0 && main.length === 0) {
        await db.setAllDailyItems(INITIAL_DAILY);
        await db.setAllMainPurchases(INITIAL_MAIN);
        daily = INITIAL_DAILY;
        main = INITIAL_MAIN;
      }

      // Check if native Android widget bridge has items (e.g. added or deleted from home screen)
      if (typeof window !== 'undefined' && (window as any).AndroidBridge?.getDailyItemsFromWidget) {
        try {
          const raw = (window as any).AndroidBridge.getDailyItemsFromWidget();
          const widgetItems: DailyItem[] = JSON.parse(raw);
          if (Array.isArray(widgetItems) && widgetItems.length > 0) {
            const map = new Map<string, DailyItem>();
            daily.forEach(i => map.set(i.id, i));
            widgetItems.forEach(w => {
              const matched = matchProduct(w.title);
              const fullItem: DailyItem = {
                ...w,
                imageUrl: w.imageUrl || matched?.image,
                category: w.category || matched?.category,
              };
              const ex = map.get(w.id);
              if (!ex || new Date(w.updatedAt || 0) >= new Date(ex.updatedAt || 0)) {
                map.set(w.id, fullItem);
              }
            });
            daily = Array.from(map.values());
            await db.setAllDailyItems(daily);
          }
        } catch (e) {
          console.warn('Failed to merge widget items:', e);
        }
      }

      setDailyItems(daily);
      setMainPurchases(main);
      setSettings(loadedSettings);
      syncToAndroidBridge(daily);
    } catch (err) {
      console.error('Failed to load from IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleVisibility = () => {
      if (!document.hidden) {
        loadData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadData]);

  // Schedule auto sync debounced
  const scheduleSync = useCallback((currentSettings: SyncSettings) => {
    if (!currentSettings.autoSync || !currentSettings.githubToken || !currentSettings.githubRepo) {
      return;
    }
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(async () => {
      setSettings(prev => ({ ...prev, syncStatus: 'syncing' }));
      const result = await githubSync.sync(currentSettings);
      setSettings(prev => {
        const next: SyncSettings = {
          ...prev,
          syncStatus: result.success ? 'synced' : (navigator.onLine ? 'error' : 'offline'),
          lastSyncTime: result.lastSyncTime || prev.lastSyncTime,
          lastError: result.error
        };
        db.saveSettings(next);
        return next;
      });
    }, 2000);
  }, []);

  // Manual Trigger Sync
  const triggerSync = useCallback(async () => {
    setSettings(prev => ({ ...prev, syncStatus: 'syncing', lastError: undefined }));
    const result = await githubSync.sync(settings);
    // Reload local DB after sync to pick up remote merges
    const updatedDaily = await db.getAllDailyItems();
    const updatedMain = await db.getAllMainPurchases();
    setDailyItems(updatedDaily);
    setMainPurchases(updatedMain);

    setSettings(prev => {
      const next: SyncSettings = {
        ...prev,
        syncStatus: result.success ? 'synced' : (navigator.onLine ? 'error' : 'offline'),
        lastSyncTime: result.lastSyncTime || prev.lastSyncTime,
        lastError: result.error
      };
      db.saveSettings(next);
      return next;
    });
    return result;
  }, [settings]);

  // Save Settings
  const updateSettings = useCallback(async (newSettings: Partial<SyncSettings>) => {
    const updated: SyncSettings = { ...settings, ...newSettings };
    setSettings(updated);
    await db.saveSettings(updated);
  }, [settings]);

  // --- Daily Items Actions ---
  const addDailyItem = useCallback(async (title: string, price?: number) => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    const matched = matchProduct(title);
    const newItem: DailyItem = {
      id: 'd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: title.trim(),
      price: price !== undefined && !isNaN(price) ? Math.max(0, price) : undefined,
      imageUrl: matched?.image,
      category: matched?.category,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    setDailyItems(prev => {
      const next = [newItem, ...prev];
      syncToAndroidBridge(next);
      return next;
    });
    await db.saveDailyItem(newItem);
    scheduleSync(settings);
  }, [settings, scheduleSync]);

  const toggleDailyItem = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    setDailyItems(prev => {
      const next = prev.map(item => {
        if (item.id === id) {
          const updated = {
            ...item,
            completed: !item.completed,
            completedAt: !item.completed ? now : undefined,
            updatedAt: now
          };
          db.saveDailyItem(updated);
          return updated;
        }
        return item;
      });
      syncToAndroidBridge(next);
      return next;
    });
    scheduleSync(settings);
  }, [settings, scheduleSync]);

  const updateDailyItem = useCallback(async (id: string, updates: Partial<DailyItem>) => {
    const now = new Date().toISOString();
    setDailyItems(prev => {
      const next = prev.map(item => {
        if (item.id === id) {
          const newTitle = updates.title !== undefined ? updates.title : item.title;
          const matched = updates.title ? matchProduct(updates.title) : null;
          const updated = {
            ...item,
            ...updates,
            imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : (matched?.image || item.imageUrl),
            category: updates.category !== undefined ? updates.category : (matched?.category || item.category),
            updatedAt: now
          };
          db.saveDailyItem(updated);
          return updated;
        }
        return item;
      });
      syncToAndroidBridge(next);
      return next;
    });
    scheduleSync(settings);
  }, [settings, scheduleSync]);

  const deleteDailyItem = useCallback(async (id: string) => {
    setDailyItems(prev => {
      const next = prev.filter(item => item.id !== id);
      syncToAndroidBridge(next);
      return next;
    });
    await db.deleteDailyItem(id);
    scheduleSync(settings);
  }, [settings, scheduleSync]);

  const clearCompletedDaily = useCallback(async () => {
    const active = dailyItems.filter(item => !item.completed);
    const completedIds = dailyItems.filter(item => item.completed).map(i => i.id);
    setDailyItems(active);
    syncToAndroidBridge(active);
    for (const id of completedIds) {
      await db.deleteDailyItem(id);
    }
    scheduleSync(settings);
  }, [dailyItems, settings, scheduleSync]);

  // --- Main Purchases Actions ---
  const addMainPurchase = useCallback(async (purchase: Omit<MainPurchase, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => {
    const now = new Date().toISOString();
    const newItem: MainPurchase = {
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ...purchase,
      completed: false,
      createdAt: now,
      updatedAt: now
    };

    setMainPurchases(prev => [newItem, ...prev]);
    await db.saveMainPurchase(newItem);
    scheduleSync(settings);
    return newItem;
  }, [settings, scheduleSync]);

  const updateMainPurchase = useCallback(async (id: string, updates: Partial<MainPurchase>) => {
    const now = new Date().toISOString();
    setMainPurchases(prev => prev.map(item => {
      if (item.id === id) {
        const updated = {
          ...item,
          ...updates,
          updatedAt: now
        };
        db.saveMainPurchase(updated);
        return updated;
      }
      return item;
    }));
    scheduleSync(settings);
  }, [settings, scheduleSync]);

  const toggleCompleteMainPurchase = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    setMainPurchases(prev => prev.map(item => {
      if (item.id === id) {
        const willBeCompleted = !item.completed;
        const updated = {
          ...item,
          completed: willBeCompleted,
          completedAt: willBeCompleted ? now : undefined,
          updatedAt: now
        };
        db.saveMainPurchase(updated);
        return updated;
      }
      return item;
    }));
    scheduleSync(settings);
  }, [settings, scheduleSync]);

  const deleteMainPurchase = useCallback(async (id: string) => {
    setMainPurchases(prev => prev.filter(item => item.id !== id));
    await db.deleteMainPurchase(id);
    scheduleSync(settings);
  }, [settings, scheduleSync]);

  // Listen for online / offline events
  useEffect(() => {
    const handleOnline = () => {
      setSettings(prev => ({ ...prev, syncStatus: 'idle' }));
      if (settings.autoSync) {
        triggerSync();
      }
    };
    const handleOffline = () => {
      setSettings(prev => ({ ...prev, syncStatus: 'offline' }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [settings.autoSync, triggerSync]);

  return {
    dailyItems,
    mainPurchases,
    settings,
    isLoading,
    // Daily actions
    addDailyItem,
    toggleDailyItem,
    updateDailyItem,
    deleteDailyItem,
    clearCompletedDaily,
    // Main actions
    addMainPurchase,
    updateMainPurchase,
    toggleCompleteMainPurchase,
    deleteMainPurchase,
    // Settings & Sync actions
    updateSettings,
    triggerSync,
    reloadFromDB: loadData
  };
}
