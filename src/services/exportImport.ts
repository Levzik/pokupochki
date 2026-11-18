import { db } from './db';
import { AppData } from '../types';

export async function exportBackupToFile(): Promise<void> {
  const data = await db.exportSnapshot();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `pokupochki-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importBackupFromFile(
  file: File, 
  overwrite: boolean = false
): Promise<{ success: boolean; message: string; count?: { daily: number; main: number } }> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text) as AppData;

    if (!parsed || (!Array.isArray(parsed.dailyItems) && !Array.isArray(parsed.mainPurchases))) {
      return {
        success: false,
        message: 'Некорректный формат файла резервной копии'
      };
    }

    const safeData: AppData = {
      version: parsed.version || 1,
      exportedAt: parsed.exportedAt || new Date().toISOString(),
      dailyItems: Array.isArray(parsed.dailyItems) ? parsed.dailyItems : [],
      mainPurchases: Array.isArray(parsed.mainPurchases) ? parsed.mainPurchases : [],
      lastModified: parsed.lastModified || new Date().toISOString()
    };

    await db.importSnapshot(safeData, overwrite);

    return {
      success: true,
      message: overwrite ? 'Данные успешно восстановлены' : 'Данные успешно объединены',
      count: {
        daily: safeData.dailyItems.length,
        main: safeData.mainPurchases.length
      }
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Ошибка при чтении файла'
    };
  }
}
