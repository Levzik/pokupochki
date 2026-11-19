import React, { useState, useMemo, useRef, useEffect } from 'react';
import { History, CheckCheck, X } from 'lucide-react';
import { DailyItem } from '../../types';
import { DailyItemRow } from './DailyItemRow';
import { DailyQuickAdd } from './DailyQuickAdd';
import { DailyHistoryModal } from './DailyHistoryModal';

interface DailyListViewProps {
  items: DailyItem[];
  onAdd: (title: string, price?: number) => void;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<DailyItem>) => void;
  onDelete: (id: string) => void;
  onClearCompleted: () => void;
  onModalStateChange?: (isOpen: boolean) => void;
}

interface UndoToastState {
  id: string;
  title: string;
}

export const DailyListView: React.FC<DailyListViewProps> = ({
  items,
  onAdd,
  onToggle,
  onUpdate,
  onDelete,
  onClearCompleted,
  onModalStateChange,
}) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [undoToast, setUndoToast] = useState<UndoToastState | null>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onModalStateChange?.(isHistoryOpen);
  }, [isHistoryOpen, onModalStateChange]);

  const activeItems = useMemo(() => items.filter((i) => !i.completed), [items]);
  const completedItems = useMemo(() => items.filter((i) => i.completed), [items]);

  // Calculate sum of active (uncompleted) items
  const totalActive = useMemo(
    () => activeItems.reduce((acc, item) => acc + (item.price || 0), 0),
    [activeItems]
  );

  const handleToggle = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item && !item.completed) {
      setUndoToast({ id, title: item.title });
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => {
        setUndoToast(null);
      }, 4500);
    } else if (undoToast?.id === id) {
      setUndoToast(null);
    }
    onToggle(id);
  };

  const handleUndo = () => {
    if (undoToast) {
      onToggle(undoToast.id);
      setUndoToast(null);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Section Header (Matching референс 2.png) */}
      <div className="px-1">
        <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
          Каждоднев
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
          Быстрый список повседневных покупок
        </p>
      </div>

      {/* Main Bento Card */}
      <div className="bg-white rounded-[28px] p-5 sm:p-7 shadow-soft border border-stone-100 transition-all">
        {/* Card Header & History link */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Список покупок
            </span>
            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-[11px] font-bold text-stone-600">
              {activeItems.length}
            </span>
          </div>

          {completedItems.length > 0 && (
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1 rounded-full transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Куплено: {completedItems.length}</span>
            </button>
          )}
        </div>

        {/* Active Items List */}
        <div className="divide-y divide-stone-100 min-h-[140px]">
          {activeItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-stone-400 select-none">
              <CheckCheck className="w-10 h-10 stroke-1 text-stone-300 mb-2" />
              <p className="text-sm font-medium">Список покупок пуст</p>
              <p className="text-xs text-stone-400 mt-1">Добавьте нужные товары в поле ниже</p>
            </div>
          ) : (
            activeItems.map((item) => (
              <DailyItemRow
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))
          )}
        </div>

        {/* Remaining / Total Bar (dynamic empty state celebration or sum) */}
        {activeItems.length === 0 ? (
          <div className="mt-4 bg-emerald-50/90 border border-emerald-100 rounded-2xl px-5 py-3.5 flex items-center justify-between text-emerald-900 shadow-xs transition-all">
            <div className="flex items-center gap-2">
              <span className="text-base">🎉</span>
              <span className="text-sm sm:text-base font-bold">Все покупки сделаны!</span>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
              Список пуст
            </span>
          </div>
        ) : (
          <div className="mt-4 bg-[#FEF3C7] rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-xs transition-all">
            <span className="text-sm sm:text-base font-bold text-stone-900">
              Осталось купить
            </span>
            <span className="text-base sm:text-xl font-extrabold text-stone-900 tracking-tight tabular-nums">
              {totalActive > 0 ? `${totalActive.toLocaleString('ru-RU')} ₽` : `${activeItems.length} поз.`}
            </span>
          </div>
        )}

        {/* Instant Quick Add Row (no modals!) */}
        <DailyQuickAdd onAdd={onAdd} />
      </div>

      {/* Undo Toast Notification */}
      {undoToast && (
        <div className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-stone-900/95 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-800 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="truncate max-w-[200px]">Куплено: «{undoToast.title}»</span>
          <button
            onClick={handleUndo}
            className="text-amber-300 hover:text-amber-200 font-bold underline underline-offset-2 ml-1 text-xs sm:text-sm shrink-0"
          >
            Отменить
          </button>
          <button
            onClick={() => setUndoToast(null)}
            className="text-stone-400 hover:text-stone-200 p-1 -mr-1"
            aria-label="Закрыть"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* History Modal */}
      <DailyHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        completedItems={completedItems}
        onRestore={onToggle}
        onDelete={onDelete}
        onClearAll={onClearCompleted}
      />
    </div>
  );
};
