import { useState, useEffect, useCallback, useRef } from 'react';
import { DailyItem, MainPurchase, SyncSettings } from '../types';
import { db } from '../services/db';
import { githubSync } from '../services/githubSync';

// Initial demo items matching the visual references if DB is freshly opened
const INITIAL_DAILY: DailyItem[] = [
  {
    id: 'd-1',
    title: 'Хлеб',
    price: 90,
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'd-2',
    title: 'Молоко',
    price: 130,
    completed: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'd-3',
    title: 'Чай',
    price: 270,
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

      setDailyItems(daily);
      setMainPurchases(main);
      setSettings(loadedSettings);
    } catch (err) {
      console.error('Failed to load from IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
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
  const addDailyItem = useCallback(async (title: string, price: number) => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    const newItem: DailyItem = {
      id: 'd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: title.trim(),
      price: Math.max(0, price || 0),
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    setDailyItems(prev => [newItem, ...prev]);
    await db.saveDailyItem(newItem);
    scheduleSync(settings);
  }, [settings, scheduleSync]);

  const toggleDailyItem = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    setDailyItems(prev => prev.map(item => {
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
    }));
    scheduleSync(settings);
  }, [settings, scheduleSync]);

  const updateDailyItem = useCallback(async (id: string, updates: Partial<DailyItem>) => {
    const now = new Date().toISOString();
    setDailyItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = {
          ...item,
          ...updates,
          updatedAt: now
        };
        db.saveDailyItem(updated);
        return updated;
      }
      return item;
    }));
    scheduleSync(settings);
  }, [settings, scheduleSync]);

  const deleteDailyItem = useCallback(async (id: string) => {
    setDailyItems(prev => prev.filter(item => item.id !== id));
    await db.deleteDailyItem(id);
    scheduleSync(settings);
  }, [settings, scheduleSync]);

  const clearCompletedDaily = useCallback(async () => {
    const active = dailyItems.filter(item => !item.completed);
    const completedIds = dailyItems.filter(item => item.completed).map(i => i.id);
    setDailyItems(active);
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
    deleteMainPurchase,
    // Settings & Sync actions
    updateSettings,
    triggerSync,
    reloadFromDB: loadData
  };
}
