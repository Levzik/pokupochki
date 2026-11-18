import { AppData, DailyItem, MainPurchase, SyncSettings } from '../types';
import { db } from './db';

// Unicode-safe Base64 encoding and decoding
function utf8ToBase64(str: string): string {
  return window.btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

function base64ToUtf8(str: string): string {
  return decodeURIComponent(
    Array.prototype.map
      .call(window.atob(str), (c: string) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
}

export interface SyncResult {
  success: boolean;
  message: string;
  lastSyncTime?: string;
  error?: string;
}

export class GitHubSyncService {
  /**
   * Performs two-way synchronization between local IndexedDB and private GitHub repo.
   * Offline-safe: never throws exceptions that block the UI.
   */
  async sync(settings: SyncSettings): Promise<SyncResult> {
    if (!navigator.onLine) {
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
      
      const getResponse = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Pokupochki-PWA'
        }
      });

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
      } else if (getResponse.status === 401 || getResponse.status === 403) {
        return {
          success: false,
          message: 'Ошибка авторизации GitHub (проверьте токен)',
          error: `HTTP ${getResponse.status}: Недействительный токен или нет прав доступа к репозиторию`
        };
      } else {
        return {
          success: false,
          message: `Ошибка GitHub (${getResponse.status})`,
          error: `GitHub API вернул статус ${getResponse.status}`
        };
      }

      // Read current local state
      const localSnapshot = await db.exportSnapshot();

      // Merge remote with local if remote exists
      const mergedSnapshot: AppData = this.mergeSnapshots(localSnapshot, remoteData);

      // Save merged snapshot locally
      await db.importSnapshot(mergedSnapshot, true);

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

      const putResponse = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Pokupochki-PWA'
        },
        body: JSON.stringify(putBody)
      });

      if (!putResponse.ok) {
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
      return {
        success: false,
        message: 'Ошибка сети при синхронизации',
        error: err instanceof Error ? err.message : String(err)
      };
    }
  }

  /**
   * Conflict resolution: merges two datasets using per-item updatedAt timestamps.
   */
  private mergeSnapshots(local: AppData, remote: AppData | null): AppData {
    if (!remote) return local;

    // Merge Daily items
    const dailyMap = new Map<string, DailyItem>();
    for (const item of (remote.dailyItems || [])) {
      dailyMap.set(item.id, item);
    }
    for (const item of (local.dailyItems || [])) {
      const existing = dailyMap.get(item.id);
      if (!existing || new Date(item.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
        dailyMap.set(item.id, item);
      }
    }

    // Merge Main purchases
    const mainMap = new Map<string, MainPurchase>();
    for (const item of (remote.mainPurchases || [])) {
      mainMap.set(item.id, item);
    }
    for (const item of (local.mainPurchases || [])) {
      const existing = mainMap.get(item.id);
      if (!existing || new Date(item.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
        mainMap.set(item.id, item);
      }
    }

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      dailyItems: Array.from(dailyMap.values()),
      mainPurchases: Array.from(mainMap.values()),
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
      return { success: false, message: `Ошибка GitHub: HTTP ${res.status}` };
    } catch (e: unknown) {
      return { success: false, message: e instanceof Error ? e.message : 'Сетевая ошибка' };
    }
  }
}

export const githubSync = new GitHubSyncService();
