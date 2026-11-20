import React from 'react';
import { Check, Cloud, CloudOff, RefreshCw, AlertCircle, HardDrive } from 'lucide-react';
import { SyncSettings } from '../../types';

interface SyncBadgeProps {
  settings: SyncSettings;
  onSyncClick: () => void;
}

export const SyncBadge: React.FC<SyncBadgeProps> = ({ settings, onSyncClick }) => {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const hasGitHub = Boolean(settings.githubToken && settings.githubRepo);

  let icon = <HardDrive className="w-4 h-4 text-stone-600" />;
  let tooltip = 'Сохранено локально';
  let text: string | null = null; // No text for local save per user request!
  let bg = 'bg-white hover:bg-stone-100 text-stone-700 shadow-2xs';
  let border = 'border-stone-200/80';

  if (!isOnline) {
    icon = <CloudOff className="w-4 h-4 text-amber-600" />;
    tooltip = 'Офлайн (сохранено на устройстве)';
    border = 'border-amber-200';
    bg = 'bg-amber-50 hover:bg-amber-100 text-amber-800';
  } else if (settings.syncStatus === 'syncing') {
    icon = <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />;
    tooltip = 'Синхронизация с GitHub...';
    border = 'border-amber-200';
    bg = 'bg-amber-50 text-amber-800';
  } else if (settings.syncStatus === 'error') {
    icon = <AlertCircle className="w-4 h-4 text-rose-500" />;
    tooltip = settings.lastError 
      ? `${settings.lastError} (нажмите для повтора)` 
      : 'Ошибка синхронизации (нажмите для повтора)';
    border = 'border-rose-200';
    bg = 'bg-rose-50 hover:bg-rose-100 text-rose-700';
  } else if (hasGitHub && settings.syncStatus === 'synced') {
    icon = <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />;
    tooltip = settings.lastSyncTime
      ? `Синхронизировано (${new Date(settings.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
      : 'Синхронизировано с GitHub';
    border = 'border-emerald-200';
    bg = 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800';
  } else if (hasGitHub) {
    icon = <Cloud className="w-4 h-4 text-emerald-600" />;
    tooltip = 'GitHub подключен';
    border = 'border-emerald-200';
    bg = 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800';
  }

  return (
    <button
      onClick={onSyncClick}
      title={tooltip}
      aria-label={tooltip}
      className={`inline-flex items-center justify-center p-2.5 rounded-2xl transition-all duration-150 border ${bg} ${border} active:scale-95`}
    >
      {icon}
      {text && <span className="text-xs font-semibold ml-1.5">{text}</span>}
    </button>
  );
};
