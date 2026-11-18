export type ActiveTab = 'main' | 'daily' | 'stats' | 'settings';

export interface DailyItem {
  id: string;
  title: string;
  price?: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CardColorTheme = 'peach' | 'pink' | 'mint' | 'lavender' | 'vanilla' | 'sky';

export interface MainPurchase {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  colorTheme?: CardColorTheme;
  // Копилка (Piggy bank / Goal savings)
  piggyBankEnabled: boolean;
  savedAmount: number;
  // Optional extra fields (inside detailed card only)
  category?: string;
  targetDate?: string;
  link?: string;
  note?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncSettings {
  githubToken: string;
  githubRepo: string; // "owner/repo"
  githubBranch: string; // default "main"
  githubFilePath: string; // default "pokupochki-data.json"
  autoSync: boolean;
  lastSyncTime?: string;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
  lastError?: string;
}

export interface AppData {
  version: number;
  exportedAt: string;
  dailyItems: DailyItem[];
  mainPurchases: MainPurchase[];
  lastModified: string;
}

export interface StatsPeriod {
  label: string;
  totalSpent: number;
  dailySpent: number;
  mainSpent: number;
  itemsCount: number;
}
