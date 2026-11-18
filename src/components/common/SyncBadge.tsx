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

  let badgeContent = {
    icon: <HardDrive className="w-3.5 h-3.5 text-stone-500" />,
    text: 'Сохранено локально',
    bg: 'bg-white hover:bg-stone-50 text-stone-700 shadow-2xs',
    border: 'border-stone-200/80'
  };

  if (!isOnline) {
    badgeContent = {
      icon: <CloudOff className="w-3.5 h-3.5 text-amber-600" />,
      text: 'Офлайн (сохранено)',
      bg: 'bg-amber-50 hover:bg-amber-100 text-amber-800',
      border: 'border-amber-200'
    };
  } else if (settings.syncStatus === 'syncing') {
    badgeContent = {
      icon: <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />,
      text: 'Синхронизация...',
      bg: 'bg-amber-50 text-amber-800',
      border: 'border-amber-200'
    };
  } else if (settings.syncStatus === 'error') {
    badgeContent = {
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" />,
      text: 'Ошибка сети',
      bg: 'bg-rose-50 hover:bg-rose-100 text-rose-700',
      border: 'border-rose-200'
    };
  } else if (hasGitHub && settings.syncStatus === 'synced') {
    badgeContent = {
      icon: <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />,
      text: 'Синхронизировано с GitHub',
      bg: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800',
      border: 'border-emerald-200'
    };
  } else if (hasGitHub) {
    badgeContent = {
      icon: <Cloud className="w-3.5 h-3.5 text-emerald-600" />,
      text: 'GitHub подключен',
      bg: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800',
      border: 'border-emerald-200'
    };
  }

  return (
    <button
      onClick={onSyncClick}
      title={settings.lastError || (settings.lastSyncTime ? `Последняя синхронизация: ${new Date(settings.lastSyncTime).toLocaleTimeString()}` : 'Нажмите для синхронизации')}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 border ${badgeContent.bg} ${badgeContent.border}`}
    >
      {badgeContent.icon}
      <span className="truncate max-w-[150px]">{badgeContent.text}</span>
    </button>
  );
};
