import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, ExternalLink, ChevronDown, ChevronUp, Image as ImageIcon, Sparkles } from 'lucide-react';
import { MainPurchase } from '../../types';

interface MainPurchaseModalProps {
  purchase: MainPurchase | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<MainPurchase>) => void;
  onDelete: (id: string) => void;
}

export const MainPurchaseModal: React.FC<MainPurchaseModalProps> = ({
  purchase,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !purchase) return null;

  const [title, setTitle] = useState(purchase.title);
  const [price, setPrice] = useState(purchase.price.toString());
  const [imageUrl, setImageUrl] = useState(purchase.imageUrl || '');
  const [piggyBankEnabled, setPiggyBankEnabled] = useState(purchase.piggyBankEnabled);
  const [savedAmount, setSavedAmount] = useState(purchase.savedAmount.toString());
  const [note, setNote] = useState(purchase.note || '');
  const [link, setLink] = useState(purchase.link || '');
  const [category, setCategory] = useState(purchase.category || '');

  const [showOptionalFields, setShowOptionalFields] = useState(Boolean(purchase.note || purchase.link || purchase.category));
  const [showImageInput, setShowImageInput] = useState(false);

  useEffect(() => {
    setTitle(purchase.title);
    setPrice(purchase.price.toString());
    setImageUrl(purchase.imageUrl || '');
    setPiggyBankEnabled(purchase.piggyBankEnabled);
    setSavedAmount(purchase.savedAmount.toString());
    setNote(purchase.note || '');
    setLink(purchase.link || '');
    setCategory(purchase.category || '');
  }, [purchase]);

  const numPrice = Math.max(0, parseFloat(price) || 0);
  const numSaved = Math.max(0, parseFloat(savedAmount) || 0);
  const remaining = Math.max(0, numPrice - numSaved);
  const percent = numPrice > 0 ? Math.min(100, Math.round((numSaved / numPrice) * 100)) : 0;

  const handleSave = () => {
    if (!title.trim()) return;

    onSave(purchase.id, {
      title: title.trim(),
      price: numPrice,
      imageUrl: imageUrl.trim() || undefined,
      piggyBankEnabled,
      // Persist saved amount even if disabled so re-enabling keeps the state!
      savedAmount: numSaved,
      note: note.trim() || undefined,
      link: link.trim() || undefined,
      category: category.trim() || undefined,
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[32px] w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl border border-stone-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <span className="text-sm font-bold text-stone-500">Покупка</span>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Image & Image URL selector */}
          <div className="relative group">
            <div className="w-full h-48 sm:h-56 rounded-2xl bg-[#FAF8F5] border border-stone-100 overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-contain p-3"
                  onError={() => setImageUrl('')}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-stone-300 gap-2">
                  <ImageIcon className="w-12 h-12 stroke-1" />
                  <span className="text-xs font-medium text-stone-400">Нет изображения</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className="mt-2 text-xs font-semibold text-amber-700 hover:text-amber-800 underline inline-flex items-center gap-1"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              {imageUrl ? 'Изменить изображение (URL)' : 'Добавить ссылку на изображение'}
            </button>

            {showImageInput && (
              <div className="mt-2 p-3 bg-stone-50 rounded-2xl border border-stone-100 space-y-2 animate-in fade-in">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Вставьте ссылку на картинку (https://...)"
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 focus:border-amber-400"
                />
                {/* Fast sample image presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-stone-400 mr-1 self-center">Быстрые:</span>
                  {[
                    { name: 'Монитор', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Наушники', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Гитара', url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Камера', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Ноутбук', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80' },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className="px-2 py-0.5 rounded-lg bg-white border border-stone-200 text-[11px] text-stone-600 hover:border-amber-400"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Title & Price Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                Название
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название покупки"
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-2xl px-4 py-3 text-base font-bold text-stone-900 focus:bg-white focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                Цена (₽)
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-2xl px-4 py-3 text-base font-bold text-stone-900 focus:bg-white focus:border-amber-400"
              />
            </div>
          </div>

          {/* 
            «КОПИЛКА» (Piggy Bank) section
            Can be toggled, edited, disabled, re-enabled. Settings and saved amount persist!
          */}
          <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 leading-tight">Копилка</h4>
                  <p className="text-[11px] text-stone-500 font-medium">Отслеживать накопления на покупку</p>
                </div>
              </div>

              {/* iOS style switch */}
              <button
                type="button"
                role="switch"
                aria-checked={piggyBankEnabled}
                onClick={() => setPiggyBankEnabled(!piggyBankEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  piggyBankEnabled ? 'bg-[#FED766]' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform absolute top-0.5 ${
                    piggyBankEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* When Piggy Bank is Enabled */}
            {piggyBankEnabled && (
              <div className="pt-3 border-t border-stone-200/60 space-y-3 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Отложено (₽)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={numPrice}
                    value={savedAmount}
                    onChange={(e) => setSavedAmount(e.target.value)}
                    placeholder="Сколько уже отложено?"
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-bold text-stone-900 focus:border-amber-400"
                  />
                </div>

                {/* Live Progress Preview */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-semibold text-stone-600">
                    <span>Осталось: {remaining.toLocaleString('ru-RU')} ₽</span>
                    <span className="font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md tabular-nums">
                      {percent}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-stone-200/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full transition-all duration-200"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Optional extra fields toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="w-full flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider py-2"
            >
              <span>Дополнительные поля (необязательно)</span>
              {showOptionalFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showOptionalFields && (
              <div className="space-y-3 pt-2 animate-in fade-in">
                {/* Note */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Заметка</label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Характеристики, цвет, промокод..."
                    className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 focus:bg-white focus:border-amber-400 resize-none"
                  />
                </div>

                {/* Link */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Ссылка на магазин</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-[#FAF8F5] border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 focus:bg-white focus:border-amber-400"
                    />
                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                        title="Открыть ссылку"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Категория</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Электроника, Для дома, Спорт..."
                    className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 focus:bg-white focus:border-amber-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-3">
          {/* Delete Button */}
          <button
            type="button"
            onClick={() => {
              onDelete(purchase.id);
              onClose();
            }}
            className="p-3 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-2xl transition-colors shrink-0"
            title="Удалить покупку"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 py-3 px-6 rounded-2xl bg-[#FED766] hover:bg-[#FDC830] active:scale-95 disabled:opacity-50 text-stone-900 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Сохранить</span>
          </button>
        </div>
      </div>
    </div>
  );
};
