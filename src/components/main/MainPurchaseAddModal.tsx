import React, { useState } from 'react';
import { X, Plus, Sparkles, Image as ImageIcon } from 'lucide-react';
import { MainPurchase } from '../../types';

interface MainPurchaseAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (purchase: Omit<MainPurchase, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => void;
}

export const MainPurchaseAddModal: React.FC<MainPurchaseAddModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [enablePiggyBank, setEnablePiggyBank] = useState(false);
  const [savedAmount, setSavedAmount] = useState('');
  const [showImagePresets, setShowImagePresets] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const numPrice = Math.max(0, parseFloat(price) || 0);
    const numSaved = enablePiggyBank ? Math.max(0, parseFloat(savedAmount) || 0) : 0;

    onAdd({
      title: title.trim(),
      price: numPrice,
      imageUrl: imageUrl.trim() || undefined,
      piggyBankEnabled: enablePiggyBank,
      savedAmount: numSaved,
    });

    // Reset form
    setTitle('');
    setPrice('');
    setImageUrl('');
    setEnablePiggyBank(false);
    setSavedAmount('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-stone-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">Новая главная покупка</h2>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
              Название товара *
            </label>
            <input
              type="text"
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Монитор, Наушники..."
              className="w-full bg-[#FAF8F5] border border-stone-200 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-amber-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
              Стоимость (₽)
            </label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="w-full bg-[#FAF8F5] border border-stone-200 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Optional Image */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Фото (необязательно)
              </label>
              <button
                type="button"
                onClick={() => setShowImagePresets(!showImagePresets)}
                className="text-[11px] font-semibold text-amber-700 hover:text-amber-800"
              >
                {showImagePresets ? 'Скрыть варианты' : 'Выбрать пример'}
              </button>
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Ссылка на изображение (https://...)"
              className="w-full bg-[#FAF8F5] border border-stone-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:bg-white focus:border-amber-400"
            />

            {showImagePresets && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { name: 'Монитор', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80' },
                  { name: 'Наушники', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
                  { name: 'Гитара', url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80' },
                  { name: 'Ноутбук', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80' },
                  { name: 'Камера', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80' },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setImageUrl(item.url)}
                    className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-[11px] text-stone-700 font-medium transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Piggy Bank Toggle */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-stone-800">Включить копилку</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enablePiggyBank}
                onClick={() => setEnablePiggyBank(!enablePiggyBank)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  enablePiggyBank ? 'bg-[#FED766]' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform absolute top-0.5 ${
                    enablePiggyBank ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {enablePiggyBank && (
              <div className="pt-2 animate-in fade-in">
                <input
                  type="number"
                  min="0"
                  value={savedAmount}
                  onChange={(e) => setSavedAmount(e.target.value)}
                  placeholder="Сколько уже отложено? (₽)"
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:border-amber-400"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-6 py-2.5 rounded-2xl bg-[#FED766] hover:bg-[#FDC830] active:scale-95 disabled:opacity-40 text-stone-900 text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Добавить</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
