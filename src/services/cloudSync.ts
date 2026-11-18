import { AppData, DailyItem, MainPurchase } from '../types';
import { db } from './db';

/**
 * Universal Peer/Room Cloud Sync
 * Allows effortless syncing between the Android APK and the Web App (levzik.github.io/pokupochki)
 * without needing to create or remember GitHub developer tokens on mobile.
 */

export interface CloudSyncResult {
  success: boolean;
  message: string;
  lastSyncTime?: string;
  error?: string;
}

export class CloudSyncService {
  private syncEndpoint = 'https://ntfy.sh'; // Lightweight, free, zero-config key-value messaging

  /**
   * Pushes latest snapshot to the designated room
   */
  async pushToRoom(roomCode: string, snapshot: AppData): Promise<boolean> {
    const cleanRoom = 'pokupochki_' + roomCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    try {
      const res = await fetch(`${this.syncEndpoint}/${cleanRoom}`, {
        method: 'POST',
        headers: {
          'Title': 'SyncData',
          'Tags': 'package',
        },
        body: JSON.stringify(snapshot),
      });
      return res.ok;
    } catch (e) {
      console.warn('Cloud sync push error:', e);
      return false;
    }
  }

  /**
   * Pulls latest snapshot from the room
   */
  async pullFromRoom(roomCode: string): Promise<AppData | null> {
    const cleanRoom = 'pokupochki_' + roomCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    try {
      const res = await fetch(`${this.syncEndpoint}/${cleanRoom}/json?poll=1&since=all`);
      if (!res.ok) return null;
      const text = await res.text();
      const lines = text.trim().split('\n').filter(Boolean);
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const entry = JSON.parse(lines[i]);
          if (entry.message) {
            const data: AppData = JSON.parse(entry.message);
            if (data.dailyItems || data.mainPurchases) {
              return data;
            }
          }
        } catch {}
      }
    } catch (e) {
      console.warn('Cloud sync pull error:', e);
    }
    return null;
  }

  /**
   * Performs full two-way merge using the sync room
   */
  async sync(roomCode: string): Promise<CloudSyncResult> {
    if (!roomCode.trim()) {
      return { success: false, message: 'Укажите код комнаты синхронизации' };
    }

    try {
      const local = await db.exportSnapshot();
      const remote = await this.pullFromRoom(roomCode);

      // Merge snapshots
      const merged = this.merge(local, remote);
      await db.importSnapshot(merged, true);

      // Push back merged state
      await this.pushToRoom(roomCode, merged);

      return {
        success: true,
        message: 'Синхронизировано через облако',
        lastSyncTime: new Date().toISOString(),
      };
    } catch (e: unknown) {
      return {
        success: false,
        message: 'Ошибка облачной синхронизации',
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  private merge(local: AppData, remote: AppData | null): AppData {
    if (!remote) return local;

    const dailyMap = new Map<string, DailyItem>();
    for (const item of (remote.dailyItems || [])) {
      dailyMap.set(item.id, item);
    }
    for (const item of (local.dailyItems || [])) {
      const existing = dailyMap.get(item.id);
      if (!existing || new Date(item.updatedAt || 0).getTime() >= new Date(existing.updatedAt || 0).getTime()) {
        dailyMap.set(item.id, item);
      }
    }

    const mainMap = new Map<string, MainPurchase>();
    for (const item of (remote.mainPurchases || [])) {
      mainMap.set(item.id, item);
    }
    for (const item of (local.mainPurchases || [])) {
      const existing = mainMap.get(item.id);
      if (!existing || new Date(item.updatedAt || 0).getTime() >= new Date(existing.updatedAt || 0).getTime()) {
        mainMap.set(item.id, item);
      }
    }

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      dailyItems: Array.from(dailyMap.values()),
      mainPurchases: Array.from(mainMap.values()),
      lastModified: new Date().toISOString(),
    };
  }
}

export const cloudSync = new CloudSyncService();
