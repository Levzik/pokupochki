import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, Check, ExternalLink, ChevronDown, ChevronUp, Image as ImageIcon, Sparkles, Camera, Clipboard, Link2 } from 'lucide-react';
import { MainPurchase, CardColorTheme } from '../../types';
import { CARD_THEMES } from '../../utils/cardThemes';
import { processImageFile, readImageFromClipboard } from '../../utils/imageUtils';

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
  const [colorTheme, setColorTheme] = useState<CardColorTheme | undefined>(purchase.colorTheme);
  const [piggyBankEnabled, setPiggyBankEnabled] = useState(purchase.piggyBankEnabled);
  const [savedAmount, setSavedAmount] = useState(purchase.savedAmount.toString());
  const [note, setNote] = useState(purchase.note || '');
  const [link, setLink] = useState(purchase.link || '');
  const [category, setCategory] = useState(purchase.category || '');

  const [showOptionalFields, setShowOptionalFields] = useState(Boolean(purchase.note || purchase.link || purchase.category));
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  useEffect(() => {
    setTitle(purchase.title);
    setPrice(purchase.price.toString());
    setImageUrl(purchase.imageUrl || '');
    setColorTheme(purchase.colorTheme);
    setPiggyBankEnabled(purchase.piggyBankEnabled);
    setSavedAmount(purchase.savedAmount.toString());
    setNote(purchase.note || '');
    setLink(purchase.link || '');
    setCategory(purchase.category || '');
  }, [purchase]);

  // Support Ctrl+V paste of screenshot anywhere in the modal!
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            try {
              const dataUrl = await processImageFile(file);
              setImageUrl(dataUrl);
            } catch (err) {
              console.warn('Failed to process pasted screenshot:', err);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processImageFile(file);
      setImageUrl(dataUrl);
    } catch (err) {
      console.warn('Failed to upload image file:', err);
    }
  };

  const handlePasteClick = async () => {
    try {
      const dataUrl = await readImageFromClipboard();
      if (dataUrl) {
        setImageUrl(dataUrl);
      } else {
        alert('В буфере обмена нет изображения. Нажмите Ctrl+V или сделайте скриншот!');
      }
    } catch (e) {
      console.warn(e);
    }
  };

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
      colorTheme: colorTheme || undefined,
      piggyBankEnabled,
      savedAmount: numSaved,
      note: note.trim() || undefined,
      link: link.trim() || undefined,
      category: category.trim() || undefined,
    });
    onClose();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[32px] w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border border-stone-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full-Bleed Airy Hero Image (Edge-to-edge covering top) */}
        <div className="relative w-full h-56 sm:h-64 bg-stone-100 shrink-0 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-2 bg-gradient-to-b from-[#FAF8F5] to-stone-100">
              <div className="w-16 h-16 rounded-3xl bg-white/80 shadow-sm flex items-center justify-center text-stone-300">
                <ImageIcon className="w-8 h-8 stroke-1 text-stone-400" />
              </div>
              <p className="text-xs font-semibold text-stone-500">Добавьте фото или вставьте скриншот (Ctrl+V)</p>
            </div>
          )}

          {/* Floating Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-800 flex items-center justify-center shadow-md backdrop-blur-md transition-all active:scale-95"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Gradient scrim for bottom controls */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

          {/* Hidden native file input for picking screenshot/photo from mobile gallery or PC */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Image Action Bar on hero image */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-1.5 z-10">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-stone-900 font-bold text-xs shadow-md backdrop-blur-md inline-flex items-center gap-1.5 active:scale-95 transition-all"
                title="Выбрать скриншот из фото или файлов"
              >
                <Camera className="w-3.5 h-3.5 text-stone-700" />
                <span>Фото / скриншот</span>
              </button>

              <button
                type="button"
                onClick={handlePasteClick}
                className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-stone-900 font-bold text-xs shadow-md backdrop-blur-md inline-flex items-center gap-1.5 active:scale-95 transition-all"
                title="Вставить картинку из буфера обмена (Ctrl+V)"
              >
                <Clipboard className="w-3.5 h-3.5 text-stone-700" />
                <span>Вставить (Ctrl+V)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="p-1.5 rounded-xl bg-white/90 hover:bg-white text-stone-700 shadow-md backdrop-blur-md transition-all"
                title="Указать URL изображения"
              >
                <Link2 className="w-4 h-4" />
              </button>
            </div>

            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="p-1.5 rounded-xl bg-white/90 hover:bg-rose-50 text-rose-600 shadow-md backdrop-blur-md transition-all"
                title="Удалить фото"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* URL Input Accordion (if user wants URL) */}
        {showUrlInput && (
          <div className="p-3 bg-stone-50 border-b border-stone-100 space-y-2 animate-in fade-in">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Вставьте ссылку на картинку (https://...)"
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 focus:border-amber-400"
            />
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] text-stone-400 self-center">Быстрые:</span>
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

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
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
                inputMode="decimal"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-2xl px-4 py-3 text-base font-bold text-stone-900 focus:bg-white focus:border-amber-400"
              />
            </div>
          </div>

          {/* Piggy Bank section */}
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

              {/* iOS switch */}
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
                    inputMode="decimal"
                    min="0"
                    max={numPrice}
                    value={savedAmount}
                    onChange={(e) => setSavedAmount(e.target.value)}
                    placeholder="Сколько уже отложено?"
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-bold text-stone-900 focus:border-amber-400"
                  />
                </div>

                {percent >= 100 && (
                  <div className="flex items-center gap-2 bg-emerald-100/80 border border-emerald-200 rounded-xl p-2.5 text-xs font-bold text-emerald-800 animate-in zoom-in-95">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Ура! Сумма накоплена полностью! 🎉</span>
                  </div>
                )}

                {/* Live Progress Preview */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-semibold text-stone-600">
                    <span>
                      {remaining > 0 ? `Осталось: ${remaining.toLocaleString('ru-RU')} ₽` : 'Вся сумма собрана!'}
                    </span>
                    <span className={`font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
                      percent >= 100 ? 'text-emerald-700 bg-emerald-50' : 'text-teal-700 bg-teal-50'
                    }`}>
                      {percent}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-stone-200/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        percent >= 100
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                          : 'bg-gradient-to-r from-teal-400 to-teal-500'
                      }`}
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
        <div className="px-6 py-4 bg-white border-t border-stone-100 flex items-center justify-between gap-3 shrink-0 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xs">
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
    </div>,
    document.body
  );
};
