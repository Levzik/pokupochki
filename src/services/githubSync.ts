import { AppData, DailyItem, MainPurchase, SyncSettings } from '../types';
import { db } from './db';

// High-performance, chunked Unicode-safe Base64 encoding/decoding
// Safely handles large JSON snapshots with base64 images without call stack limits
export function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 0x8000; // 32KB chunks
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return window.btoa(binary);
}

export function base64ToUtf8(base64: string): string {
  const clean = base64.replace(/\s+/g, '');
  const binary = window.atob(clean);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export interface SyncResult {
  success: boolean;
  message: string;
  lastSyncTime?: string;
  error?: string;
}

// Timeout wrapper for fetch requests (default 8 seconds)
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

// Check if snapshot contains any real data changes vs remote
function hasSignificantChanges(a: AppData, b: AppData | null): boolean {
  if (!b) return true;
  const aDaily = a.dailyItems || [];
  const bDaily = b.dailyItems || [];
  if (aDaily.length !== bDaily.length) return true;

  const aMain = a.mainPurchases || [];
  const bMain = b.mainPurchases || [];
  if (aMain.length !== bMain.length) return true;

  const aDel = a.deletedIds || {};
  const bDel = b.deletedIds || {};
  const aDelKeys = Object.keys(aDel);
  const bDelKeys = Object.keys(bDel);
  if (aDelKeys.length !== bDelKeys.length) return true;
  for (const k of aDelKeys) {
    if (aDel[k] !== bDel[k]) return true;
  }

  const bDailyMap = new Map(bDaily.map(i => [i.id, i]));
  for (const item of aDaily) {
    const existing = bDailyMap.get(item.id);
    if (!existing) return true;
    if (item.title !== existing.title ||
        item.completed !== existing.completed ||
        item.price !== existing.price ||
        item.updatedAt !== existing.updatedAt ||
        item.order !== existing.order) {
      return true;
    }
  }

  const bMainMap = new Map(bMain.map(i => [i.id, i]));
  for (const item of aMain) {
    const existing = bMainMap.get(item.id);
    if (!existing) return true;
    if (item.title !== existing.title ||
        item.price !== existing.price ||
        item.savedAmount !== existing.savedAmount ||
        item.completed !== existing.completed ||
        item.piggyBankEnabled !== existing.piggyBankEnabled ||
        item.updatedAt !== existing.updatedAt ||
        item.imageUrl !== existing.imageUrl ||
        item.order !== existing.order) {
      return true;
    }
  }

  return false;
}

export class GitHubSyncService {
  /**
   * Performs fast two-way synchronization between local IndexedDB and private GitHub repo.
   * Tracks tombstones to permanently delete removed items, and only pushes when real changes exist.
   */
  async sync(settings: SyncSettings): Promise<SyncResult> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        success: false,
        message: 'Офлайн (сохранено на устройстве)',
        error: 'Отсутствует подключение к интернету'
      };
    }

    if (!settings.githubToken.trim() || !settings.githubRepo.trim()) {
      return {
        success: true,
        message: 'Сохранено локально (GitHub не подключен)'
      };
    }

    const repo = settings.githubRepo.trim().replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '');
    const path = settings.githubFilePath.trim() || 'pokupochki-data.json';
    const branch = settings.githubBranch.trim() || 'main';
    const token = settings.githubToken.trim();

    try {
      const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;
      
      const getResponse = await fetchWithTimeout(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Pokupochki-PWA'
        }
      }, 8000);

      let remoteData: AppData | null = null;
      let remoteSha: string | null = null;

      if (getResponse.status === 200) {
        const fileInfo = await getResponse.json();
        remoteSha = fileInfo.sha;
        const decodedContent = base64ToUtf8(fileInfo.content.replace(/\s/g, ''));
        try {
          remoteData = JSON.parse(decodedContent);
        } catch {
          console.warn('Failed to parse remote JSON, will overwrite with local snapshot.');
        }
      } else if (getResponse.status === 404) {
        // File does not exist yet; will create fresh
        remoteData = null;
      } else if (getResponse.status === 403 || getResponse.status === 429) {
        const remaining = getResponse.headers.get('x-ratelimit-remaining');
        const resetTime = getResponse.headers.get('x-ratelimit-reset');
        if (remaining === '0' && resetTime) {
          const resetDate = new Date(parseInt(resetTime, 10) * 1000);
          const timeStr = resetDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
          return {
            success: false,
            message: `Лимит GitHub исчерпан (сброс в ${timeStr})`,
            error: `Превышен лимит запросов GitHub (5000/час). Лимит обновится в ${timeStr}. Локальные данные сохранены!`
          };
        }
        return {
          success: false,
          message: 'Ошибка доступа к GitHub (403)',
          error: `HTTP ${getResponse.status}: Недействительный токен или превышен лимит коммитов`
        };
      } else if (getResponse.status === 401) {
        return {
          success: false,
          message: 'Ошибка авторизации GitHub (проверьте токен)',
          error: `HTTP 401: Недействительный токен доступа`
        };
      } else {
        return {
          success: false,
          message: `Ошибка GitHub (${getResponse.status})`,
          error: `GitHub API вернул статус ${getResponse.status}`
        };
      }

      // Read current local state (includes tombstones)
      const localSnapshot = await db.exportSnapshot();

      // Merge remote with local using tombstones
      const mergedSnapshot: AppData = this.mergeSnapshots(localSnapshot, remoteData);

      // Save merged snapshot locally (overwrite=true with tombstones applied)
      await db.importSnapshot(mergedSnapshot, true);

      // Check if merged snapshot is identical to remote data
      // If no changes need to be pushed, skip PUT request to avoid hitting GitHub commit rate limits!
      if (!hasSignificantChanges(mergedSnapshot, remoteData)) {
        return {
          success: true,
          message: 'Синхронизировано',
          lastSyncTime: new Date().toISOString()
        };
      }

      // Push merged snapshot to GitHub
      const fileContent = JSON.stringify(mergedSnapshot, null, 2);
      const encodedContent = utf8ToBase64(fileContent);

      const putBody: Record<string, unknown> = {
        message: `Sync Pokupochki data [${new Date().toLocaleString('ru-RU')}]`,
        content: encodedContent,
        branch: branch
      };
      if (remoteSha) {
        putBody.sha = remoteSha;
      }

      let putResponse = await fetchWithTimeout(`https://api.github.com/repos/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Pokupochki-PWA'
        },
        body: JSON.stringify(putBody)
      }, 10000);

      // Handle 409 Conflict: auto-retry once with the latest sha
      if (putResponse.status === 409) {
        console.warn('Sync conflict 409 detected, fetching latest remote sha and retrying...');
        const refetchRes = await fetchWithTimeout(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Pokupochki-PWA'
          }
        }, 8000);
        if (refetchRes.status === 200) {
          const freshInfo = await refetchRes.json();
          putBody.sha = freshInfo.sha;
          putResponse = await fetchWithTimeout(`https://api.github.com/repos/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
              'User-Agent': 'Pokupochki-PWA'
            },
            body: JSON.stringify(putBody)
          }, 10000);
        }
      }

      if (!putResponse.ok) {
        const remaining = putResponse.headers.get('x-ratelimit-remaining');
        const resetTime = putResponse.headers.get('x-ratelimit-reset');
        if (remaining === '0' && resetTime) {
          const resetDate = new Date(parseInt(resetTime, 10) * 1000);
          const timeStr = resetDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
          return {
            success: false,
            message: `Лимит GitHub исчерпан (сброс в ${timeStr})`,
            error: `Лимит запросов GitHub исчерпан. Сброс в ${timeStr}. Все данные сохранены на устройстве.`
          };
        }
        const errJson = await putResponse.json().catch(() => ({}));
        return {
          success: false,
          message: 'Ошибка сохранения на GitHub',
          error: errJson.message || `HTTP ${putResponse.status}`
        };
      }

      const syncTime = new Date().toISOString();
      return {
        success: true,
        message: 'Синхронизировано',
        lastSyncTime: syncTime
      };

    } catch (err: unknown) {
      console.warn('Sync network error:', err);
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      const msg = isAbort ? 'Таймаут синхронизации (проверьте интернет)' : (err instanceof Error ? err.message : String(err));
      return {
        success: false,
        message: 'Ошибка сети при синхронизации',
        error: msg
      };
    }
  }

  /**
   * Conflict resolution: merges two datasets using per-item updatedAt timestamps and tombstones (deletedIds).
   */
  mergeSnapshots(local: AppData, remote: AppData | null): AppData {
    if (!remote) return local;

    // 1. Merge tombstones (deletedIds)
    const now = Date.now();
    const maxTombstoneAgeMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    const mergedDeletedIds: Record<string, string> = {};

    const combineTombstones = (map?: Record<string, string>) => {
      if (!map) return;
      for (const [id, dateStr] of Object.entries(map)) {
        const time = new Date(dateStr).getTime();
        if (now - time < maxTombstoneAgeMs) {
          if (!mergedDeletedIds[id] || time > new Date(mergedDeletedIds[id]).getTime()) {
            mergedDeletedIds[id] = dateStr;
          }
        }
      }
    };

    combineTombstones(remote.deletedIds);
    combineTombstones(local.deletedIds);

    const isDeleted = (id: string, updatedAtStr?: string, createdAtStr?: string): boolean => {
      const delStr = mergedDeletedIds[id];
      if (!delStr) return false;
      const delTime = new Date(delStr).getTime();
      const itemTime = new Date(updatedAtStr || createdAtStr || 0).getTime();
      return delTime >= itemTime;
    };

    // 2. Merge Daily items
    const dailyMap = new Map<string, DailyItem>();
    for (const item of (remote.dailyItems || [])) {
      if (!isDeleted(item.id, item.updatedAt, item.createdAt)) {
        dailyMap.set(item.id, item);
      }
    }
    for (const item of (local.dailyItems || [])) {
      if (!isDeleted(item.id, item.updatedAt, item.createdAt)) {
        const existing = dailyMap.get(item.id);
        if (!existing || new Date(item.updatedAt || item.createdAt || 0).getTime() >= new Date(existing.updatedAt || existing.createdAt || 0).getTime()) {
          dailyMap.set(item.id, item);
        }
      }
    }

    // 3. Merge Main purchases
    const mainMap = new Map<string, MainPurchase>();
    for (const item of (remote.mainPurchases || [])) {
      if (!isDeleted(item.id, item.updatedAt, item.createdAt)) {
        mainMap.set(item.id, item);
      }
    }
    for (const item of (local.mainPurchases || [])) {
      if (!isDeleted(item.id, item.updatedAt, item.createdAt)) {
        const existing = mainMap.get(item.id);
        if (!existing || new Date(item.updatedAt || item.createdAt || 0).getTime() >= new Date(existing.updatedAt || existing.createdAt || 0).getTime()) {
          mainMap.set(item.id, item);
        }
      }
    }

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      dailyItems: Array.from(dailyMap.values()),
      mainPurchases: Array.from(mainMap.values()),
      deletedIds: mergedDeletedIds,
      lastModified: new Date().toISOString()
    };
  }

  /**
   * Tests connection to GitHub repository
   */
  async testConnection(token: string, repo: string): Promise<{ success: boolean; message: string }> {
    const cleanRepo = repo.trim().replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '');
    try {
      const res = await fetch(`https://api.github.com/repos/${cleanRepo}`, {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Pokupochki-PWA'
        }
      });
      if (res.status === 200) {
        const json = await res.json();
        return { 
          success: true, 
          message: `Подключено: ${json.full_name} (${json.private ? 'приватный' : 'публичный'})` 
        };
      }
      if (res.status === 404) {
        return { success: false, message: 'Репозиторий не найден (проверьте имя и права токена)' };
      }
      if (res.status === 401) {
        return { success: false, message: 'Неверный токен авторизации' };
      }
      if (res.status === 403 || res.status === 429) {
        const remaining = res.headers.get('x-ratelimit-remaining');
        const resetTime = res.headers.get('x-ratelimit-reset');
        if (remaining === '0' && resetTime) {
          const resetDate = new Date(parseInt(resetTime, 10) * 1000);
          const timeStr = resetDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
          return { success: false, message: `Лимит запросов GitHub исчерпан (сброс в ${timeStr})` };
        }
        return { success: false, message: 'Нет прав доступа к репозиторию (403)' };
      }
      return { success: false, message: `Ошибка GitHub: HTTP ${res.status}` };
    } catch (e: unknown) {
      return { success: false, message: e instanceof Error ? e.message : 'Сетевая ошибка' };
    }
  }
}

export const githubSync = new GitHubSyncService();
