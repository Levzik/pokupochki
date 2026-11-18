import React, { useState, useMemo } from 'react';
import { History, CheckCheck } from 'lucide-react';
import { DailyItem } from '../../types';
import { DailyItemRow } from './DailyItemRow';
import { DailyQuickAdd } from './DailyQuickAdd';
import { DailyHistoryModal } from './DailyHistoryModal';

interface DailyListViewProps {
  items: DailyItem[];
  onAdd: (title: string, price: number) => void;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<DailyItem>) => void;
  onDelete: (id: string) => void;
  onClearCompleted: () => void;
}

export const DailyListView: React.FC<DailyListViewProps> = ({
  items,
  onAdd,
  onToggle,
  onUpdate,
  onDelete,
  onClearCompleted,
}) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const activeItems = useMemo(() => items.filter((i) => !i.completed), [items]);
  const completedItems = useMemo(() => items.filter((i) => i.completed), [items]);

  // Calculate sum of active (uncompleted) items
  const totalActive = useMemo(
    () => activeItems.reduce((acc, item) => acc + (item.price || 0), 0),
    [activeItems]
  );

  return (
    <div className="w-full max-w-xl mx-auto">
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
                onToggle={onToggle}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))
          )}
        </div>

        {/* Total Sum Bar (as seen in visual reference) */}
        <div className="mt-4 bg-[#FEF3C7] rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-xs">
          <span className="text-base sm:text-lg font-bold text-stone-900">
            Итого
          </span>
          <span className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight tabular-nums">
            {totalActive.toLocaleString('ru-RU')} ₽
          </span>
        </div>

        {/* Instant Quick Add Row (no modals!) */}
        <DailyQuickAdd onAdd={onAdd} />
      </div>

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
