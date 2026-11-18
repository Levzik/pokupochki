import React from 'react';
import { X, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react';
import { DailyItem } from '../../types';
import { matchProduct } from '../../data/productCatalog';

interface DailyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedItems: DailyItem[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const DailyHistoryModal: React.FC<DailyHistoryModalProps> = ({
  isOpen,
  onClose,
  completedItems,
  onRestore,
  onDelete,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const totalSpent = completedItems.reduce((acc, item) => acc + (item.price || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl border border-stone-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-stone-900">История покупок</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {completedItems.length === 0 ? (
            <div className="text-center py-10 text-stone-400">
              <p className="text-sm">История пуста. Купленные товары появятся здесь.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-3 bg-amber-50/60 rounded-2xl flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-stone-600">Всего куплено товаров:</span>
                <span className="text-sm font-bold text-stone-900">
                  {completedItems.length} шт. ({totalSpent.toLocaleString('ru-RU')} ₽)
                </span>
              </div>

              {completedItems.map((item) => {
                const img = item.imageUrl || matchProduct(item.title)?.image;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 hover:bg-stone-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      {img ? (
                        <img
                          src={img}
                          alt={item.title}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-2xs border border-stone-200/60"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-amber-100/60 flex items-center justify-center text-base shrink-0">
                          🛒
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-800 truncate">{item.title}</p>
                        <p className="text-xs text-stone-400">
                          {item.completedAt ? new Date(item.completedAt).toLocaleDateString('ru-RU') : 'Ранее'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-900 tabular-nums">
                        {item.price !== undefined && item.price !== null ? `${item.price.toLocaleString('ru-RU')} ₽` : '—'}
                      </span>
                      <button
                        onClick={() => onRestore(item.id)}
                        title="Вернуть в список покупок"
                        className="p-1.5 text-stone-500 hover:text-amber-600 hover:bg-amber-100/50 rounded-xl transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        title="Удалить навсегда"
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {completedItems.length > 0 && (
          <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
            <button
              onClick={onClearAll}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              Очистить историю
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
