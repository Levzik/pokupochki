import React, { useState, useRef } from 'react';
import { 
  Github, 
  Download, 
  Upload, 
  Check, 
  RefreshCw, 
  Key, 
  FolderGit2, 
  Eye, 
  EyeOff, 
  Smartphone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SyncSettings } from '../../types';
import { githubSync } from '../../services/githubSync';
import { cloudSync } from '../../services/cloudSync';
import { exportBackupToFile, importBackupFromFile } from '../../services/exportImport';

interface SettingsViewProps {
  settings: SyncSettings;
  onUpdateSettings: (newSettings: Partial<SyncSettings>) => void;
  onTriggerSync: () => Promise<{ success: boolean; message: string; error?: string }>;
  onOpenWidgetModal: () => void;
  onDataReloaded: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onTriggerSync,
  onOpenWidgetModal,
  onDataReloaded,
}) => {
  const [token, setToken] = useState(settings.githubToken);
  const [repo, setRepo] = useState(settings.githubRepo || 'Levzik/pokupochki');
  const [branch, setBranch] = useState(settings.githubBranch || 'main');
  const [filePath, setFilePath] = useState(settings.githubFilePath || 'pokupochki-data.json');
  const [autoSync, setAutoSync] = useState(settings.autoSync);
  const [showToken, setShowToken] = useState(false);

  const [cloudRoom, setCloudRoom] = useState(() => localStorage.getItem('pokupochki_cloud_room') || 'levzik');
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [cloudFeedback, setCloudFeedback] = useState<string | null>(null);

  const handleCloudSync = async () => {
    if (!cloudRoom.trim()) return;
    localStorage.setItem('pokupochki_cloud_room', cloudRoom.trim());
    setCloudSyncing(true);
    setCloudFeedback(null);
    const res = await cloudSync.sync(cloudRoom.trim());
    setCloudSyncing(false);
    setCloudFeedback(res.message);
    if (res.success) {
      onDataReloaded();
    }
    setTimeout(() => setCloudFeedback(null), 4000);
  };

  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncingNow, setSyncingNow] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveGitHubConfig = () => {
    onUpdateSettings({
      githubToken: token.trim(),
      githubRepo: repo.trim(),
      githubBranch: branch.trim() || 'main',
      githubFilePath: filePath.trim() || 'pokupochki-data.json',
      autoSync
    });
    setTestResult({ success: true, message: 'Настройки GitHub сохранены локально!' });
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleTestConnection = async () => {
    if (!token.trim() || !repo.trim()) {
      setTestResult({ success: false, message: 'Укажите токен и имя репозитория' });
      return;
    }
    setTestingConnection(true);
    setTestResult(null);
    const res = await githubSync.testConnection(token, repo);
    setTestingConnection(false);
    setTestResult(res);
  };

  const handleManualSync = async () => {
    setSyncingNow(true);
    setSyncFeedback(null);
    const res = await onTriggerSync();
    setSyncingNow(false);
    setSyncFeedback(res.message);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const handleExport = async () => {
    try {
      await exportBackupToFile();
    } catch {
      alert('Ошибка при экспорте резервной копии');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await importBackupFromFile(file, false);
    if (res.success) {
      setImportStatus(`Успешно: импортировано данных (Каждоднев: ${res.count?.daily}, Главные: ${res.count?.main})`);
      onDataReloaded();
    } else {
      setImportStatus(`Ошибка: ${res.message}`);
    }
    setTimeout(() => setImportStatus(null), 5000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in pb-12">
      {/* Page Title */}
      <div className="px-1">
        <h2 className="text-2xl font-black text-stone-900 tracking-tight">Настройки и Синхронизация</h2>
        <p className="text-xs sm:text-sm text-stone-500 font-medium">
          Offline-first хранилище, приватный GitHub и резервные копии
        </p>
      </div>

      {/* 1-Click Cloud Sync between APK and https://levzik.github.io/pokupochki/ */}
      <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/70 rounded-[28px] p-6 shadow-soft border border-amber-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FED766] text-stone-900 flex items-center justify-center font-black text-lg shadow-xs">
              ⚡
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                Синхронизация APK с сайтом
              </h3>
              <p className="text-xs text-stone-600 font-medium">
                Мгновенный обмен данными между Android APK и levzik.github.io/pokupochki
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          Введите одинаковый код синхронизации на телефоне и на сайте (по умолчанию <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-bold text-stone-800">levzik</code>), чтобы данные на обоих устройствах объединились:
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="text"
            value={cloudRoom}
            onChange={(e) => setCloudRoom(e.target.value)}
            placeholder="Код синхронизации (например: levzik)"
            className="flex-1 bg-white border border-amber-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-stone-900 focus:border-amber-400 shadow-2xs"
          />
          <button
            type="button"
            onClick={handleCloudSync}
            disabled={cloudSyncing || !cloudRoom.trim()}
            className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-[#FED766] to-[#FDBF3B] hover:brightness-105 active:scale-95 text-stone-900 font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 shrink-0"
          >
            {cloudSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-stone-900" />
            ) : (
              <span>⚡ Синхронизировать сейчас</span>
            )}
          </button>
        </div>

        {cloudFeedback && (
          <p className="text-xs font-bold text-emerald-700 animate-in fade-in">
            ✓ {cloudFeedback}
          </p>
        )}
      </div>

      {/* GitHub Sync Card */}
      <div className="bg-white rounded-[28px] p-6 shadow-soft border border-stone-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-white flex items-center justify-center">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                Синхронизация с GitHub
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Приватный репозиторий для безопасного бэкапа и кросс-девайса
              </p>
            </div>
          </div>

          {/* Auto-sync Switch */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-600 hidden sm:inline">Автосинхронизация</span>
            <button
              type="button"
              role="switch"
              aria-checked={autoSync}
              onClick={() => {
                const next = !autoSync;
                setAutoSync(next);
                onUpdateSettings({ autoSync: next });
              }}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                autoSync ? 'bg-[#FED766]' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform absolute top-0.5 ${
                  autoSync ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          {/* GitHub Token */}
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-stone-400" />
              <span>GitHub Personal Access Token (PAT)</span>
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-stone-900 focus:bg-white focus:border-amber-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Токен хранится исключительно локально в браузере (IndexedDB). Требуются права <code className="bg-stone-100 px-1 rounded">repo</code>.
            </p>
          </div>

          {/* GitHub Repo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-stone-400" />
                <span>Репозиторий (owner/repo)</span>
              </label>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="например: username/my-pokupochki"
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-stone-900 focus:bg-white focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">
                Имя файла данных
              </label>
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="pokupochki-data.json"
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-stone-900 focus:bg-white focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Sync Feedback Message */}
        {syncFeedback && (
          <div className="p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-2">
            <RefreshCw className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={handleSaveGitHubConfig}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Сохранить настройки</span>
          </button>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
          >
            {testingConnection ? 'Проверка...' : 'Проверить подключение'}
          </button>

          <button
            type="button"
            onClick={handleManualSync}
            disabled={syncingNow}
            className="px-4 py-2 bg-[#FED766] hover:bg-[#FDC830] text-stone-900 rounded-xl text-xs font-extrabold transition-colors disabled:opacity-50 flex items-center gap-1.5 ml-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingNow ? 'animate-spin' : ''}`} />
            <span>{syncingNow ? 'Синхронизация...' : 'Синхронизировать сейчас'}</span>
          </button>
        </div>
      </div>

      {/* Backup Export / Import Card */}
      <div className="bg-white rounded-[28px] p-6 shadow-soft border border-stone-100 space-y-4">
        <div>
          <h3 className="text-base font-bold text-stone-900 leading-tight">
            Резервные копии (Экспорт и Импорт)
          </h3>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Сохраняйте копию всех данных на компьютере или смартфоне в формате JSON
          </p>
        </div>

        {importStatus && (
          <div className="p-3 rounded-xl bg-amber-50 text-stone-800 border border-amber-200 text-xs font-semibold">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-stone-600" />
            <span>Скачать резервную копию (JSON)</span>
          </button>

          {/* Import Button */}
          <label className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-stone-600" />
            <span>Восстановить из файла JSON</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Android Widget Section */}
      <div className="bg-gradient-to-br from-amber-50/60 to-rose-50/40 rounded-[28px] p-6 border border-amber-100 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FED766] flex items-center justify-center text-stone-900 shrink-0 shadow-xs">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 leading-tight">
              Виджет для Android (Google Keep style)
            </h3>
            <p className="text-xs text-stone-600 font-medium mt-0.5">
              Настоящий нативный виджет рабочего стола с галочками и быстрым добавлением
            </p>
          </div>
        </div>

        <button
          onClick={onOpenWidgetModal}
          className="px-5 py-2.5 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-900 text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto"
        >
          Инструкция и код Kotlin
        </button>
      </div>
    </div>
  );
};
