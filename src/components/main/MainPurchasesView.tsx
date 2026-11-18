import React, { useState } from 'react';
import { Plus, Sparkles, ShoppingBag } from 'lucide-react';
import { MainPurchase } from '../../types';
import { MainPurchaseCard } from './MainPurchaseCard';
import { MainPurchaseModal } from './MainPurchaseModal';
import { MainPurchaseAddModal } from './MainPurchaseAddModal';

interface MainPurchasesViewProps {
  purchases: MainPurchase[];
  onAdd: (purchase: Omit<MainPurchase, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => void;
  onUpdate: (id: string, updates: Partial<MainPurchase>) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const MainPurchasesView: React.FC<MainPurchasesViewProps> = ({
  purchases,
  onAdd,
  onUpdate,
  onDelete,
  onToggleComplete,
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const [selectedPurchase, setSelectedPurchase] = useState<MainPurchase | null>(null);

  // Stats summary for header pill
  const totalGoal = purchases.reduce((sum, p) => sum + (p.price || 0), 0);
  const totalSaved = purchases.reduce((sum, p) => sum + (p.piggyBankEnabled ? (p.savedAmount || 0) : 0), 0);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Главные покупки
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            Запланированные и важные цели
          </p>
        </div>

        {totalSaved > 0 && (
          <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>
              В копилках: {totalSaved.toLocaleString('ru-RU')} ₽ из {totalGoal.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        )}
      </div>

      {/* Grid of Minimal Bento Cards */}
      {purchases.length === 0 ? (
        <div className="bg-white rounded-[32px] p-10 text-center shadow-soft border border-stone-100 flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 mb-3">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">Список главных покупок пуст</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm">
            Добавьте крупные цели, технику или подарки. При желании включите копилку для отслеживания прогресса.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-5 px-5 py-2.5 rounded-2xl bg-[#FED766] hover:bg-[#FDC830] active:scale-95 text-stone-900 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Добавить первую покупку</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {purchases.map((purchase, idx) => (
            <MainPurchaseCard
              key={purchase.id}
              purchase={purchase}
              index={idx}
              onClick={() => setSelectedPurchase(purchase)}
              onEdit={() => setSelectedPurchase(purchase)}
              onDelete={() => onDelete(purchase.id)}
              onToggleComplete={() => onToggleComplete(purchase.id)}
            />
          ))}

          {/* Minimal Bento Quick Add Card (Matching референс 1.png) */}
          <div
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-[28px] border-2 border-dashed border-stone-300 bg-white/40 hover:bg-white/80 min-h-[280px] p-6 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#FCE7F3] group-hover:bg-[#FED766] flex items-center justify-center text-stone-900 transition-all duration-200 mb-3 shadow-xs group-hover:scale-105">
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </div>
            <span className="text-base font-bold text-stone-900">Добавить покупку</span>
          </div>
        </div>
      )}

      {/* Details / Edit Modal */}
      <MainPurchaseModal
        purchase={selectedPurchase}
        isOpen={Boolean(selectedPurchase)}
        onClose={() => setSelectedPurchase(null)}
        onSave={onUpdate}
        onDelete={onDelete}
      />

      {/* Add Modal */}
      <MainPurchaseAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAdd}
      />
    </div>
  );
};
