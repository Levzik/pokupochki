import { DailyItem, MainPurchase, SyncSettings, AppData } from '../types';

const DB_NAME = 'pokupochki_db';
const DB_VERSION = 1;

class PokupochkiDB {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('daily_items')) {
          const dailyStore = db.createObjectStore('daily_items', { keyPath: 'id' });
          dailyStore.createIndex('completed', 'completed', { unique: false });
          dailyStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('main_purchases')) {
          const mainStore = db.createObjectStore('main_purchases', { keyPath: 'id' });
          mainStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- Daily Items ---
  async getAllDailyItems(): Promise<DailyItem[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('daily_items', 'readonly');
      const store = tx.objectStore('daily_items');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async saveDailyItem(item: DailyItem): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('daily_items', 'readwrite');
      const store = tx.objectStore('daily_items');
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteDailyItem(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('daily_items', 'readwrite');
      const store = tx.objectStore('daily_items');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async setAllDailyItems(items: DailyItem[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('daily_items', 'readwrite');
      const store = tx.objectStore('daily_items');
      store.clear();
      for (const item of items) {
        store.put(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Main Purchases ---
  async getAllMainPurchases(): Promise<MainPurchase[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('main_purchases', 'readonly');
      const store = tx.objectStore('main_purchases');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async saveMainPurchase(purchase: MainPurchase): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('main_purchases', 'readwrite');
      const store = tx.objectStore('main_purchases');
      const req = store.put(purchase);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteMainPurchase(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('main_purchases', 'readwrite');
      const store = tx.objectStore('main_purchases');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async setAllMainPurchases(purchases: MainPurchase[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('main_purchases', 'readwrite');
      const store = tx.objectStore('main_purchases');
      store.clear();
      for (const purchase of purchases) {
        store.put(purchase);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Settings ---
  async getSettings(): Promise<SyncSettings> {
    const defaultSettings: SyncSettings = {
      githubToken: '',
      githubRepo: '',
      githubBranch: 'main',
      githubFilePath: 'pokupochki-data.json',
      autoSync: true,
      syncStatus: 'idle',
    };

    const db = await this.getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get('sync_settings');
      req.onsuccess = () => {
        if (req.result && req.result.value) {
          resolve({ ...defaultSettings, ...req.result.value });
        } else {
          resolve(defaultSettings);
        }
      };
      req.onerror = () => resolve(defaultSettings);
    });
  }

  async saveSettings(settings: SyncSettings): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const req = store.put({ key: 'sync_settings', value: settings });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Export Full Snapshot ---
  async exportSnapshot(): Promise<AppData> {
    const [dailyItems, mainPurchases] = await Promise.all([
      this.getAllDailyItems(),
      this.getAllMainPurchases()
    ]);

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      dailyItems,
      mainPurchases,
      lastModified: new Date().toISOString()
    };
  }

  // --- Import Snapshot with Merging ---
  async importSnapshot(data: AppData, overwrite: boolean = false): Promise<void> {
    if (overwrite) {
      await Promise.all([
        this.setAllDailyItems(data.dailyItems || []),
        this.setAllMainPurchases(data.mainPurchases || [])
      ]);
      return;
    }

    // Merge: conflict resolution based on updatedAt
    const currentDaily = await this.getAllDailyItems();
    const dailyMap = new Map(currentDaily.map(i => [i.id, i]));
    for (const incoming of (data.dailyItems || [])) {
      const existing = dailyMap.get(incoming.id);
      if (!existing || new Date(incoming.updatedAt) > new Date(existing.updatedAt)) {
        dailyMap.set(incoming.id, incoming);
      }
    }
    await this.setAllDailyItems(Array.from(dailyMap.values()));

    const currentMain = await this.getAllMainPurchases();
    const mainMap = new Map(currentMain.map(i => [i.id, i]));
    for (const incoming of (data.mainPurchases || [])) {
      const existing = mainMap.get(incoming.id);
      if (!existing || new Date(incoming.updatedAt) > new Date(existing.updatedAt)) {
        mainMap.set(incoming.id, incoming);
      }
    }
    await this.setAllMainPurchases(Array.from(mainMap.values()));
  }
}

export const db = new PokupochkiDB();
