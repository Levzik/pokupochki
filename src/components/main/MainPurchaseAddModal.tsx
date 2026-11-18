import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Sparkles, Image as ImageIcon, Camera, Clipboard, Link2, Trash2 } from 'lucide-react';
import { MainPurchase } from '../../types';
import { processImageFile, readImageFromClipboard } from '../../utils/imageUtils';

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
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Support Ctrl+V paste of screenshot anywhere in add modal
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
        alert('В буфере обмена нет изображения. Сделайте скриншот и нажмите Ctrl+V!');
      }
    } catch (e) {
      console.warn(e);
    }
  };

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-stone-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full-bleed Airy Image Hero / Preview */}
        <div className="relative w-full h-48 sm:h-52 bg-stone-100 shrink-0 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-1.5 bg-gradient-to-b from-[#FAF8F5] to-stone-100">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs flex items-center justify-center text-stone-300">
                <ImageIcon className="w-6 h-6 stroke-1 text-stone-400" />
              </div>
              <span className="text-xs font-semibold text-stone-500">Добавьте фото или скриншот (Ctrl+V)</span>
            </div>
          )}

          {/* Floating Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-800 flex items-center justify-center shadow-md backdrop-blur-md transition-all active:scale-95"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scrim */}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Action Bar on Image */}
          <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-1 z-10">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-stone-900 font-bold text-[11px] shadow-md backdrop-blur-md inline-flex items-center gap-1 active:scale-95 transition-all"
                title="Выбрать скриншот из фото"
              >
                <Camera className="w-3.5 h-3.5 text-stone-700" />
                <span>Фото / скрин</span>
              </button>

              <button
                type="button"
                onClick={handlePasteClick}
                className="px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-stone-900 font-bold text-[11px] shadow-md backdrop-blur-md inline-flex items-center gap-1 active:scale-95 transition-all"
                title="Вставить из буфера"
              >
                <Clipboard className="w-3.5 h-3.5 text-stone-700" />
                <span>Вставить (Ctrl+V)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="p-1.5 rounded-xl bg-white/95 hover:bg-white text-stone-700 shadow-md backdrop-blur-md"
                title="Указать ссылку (URL)"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="p-1.5 rounded-xl bg-white/95 hover:bg-rose-50 text-rose-600 shadow-md backdrop-blur-md"
                title="Удалить фото"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* URL Presets if opened */}
        {showUrlInput && (
          <div className="p-3 bg-stone-50 border-b border-stone-100 space-y-1.5 animate-in fade-in">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-medium text-stone-800"
            />
            <div className="flex flex-wrap gap-1">
              {[
                { name: 'Монитор', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80' },
                { name: 'Наушники', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
                { name: 'Гитара', url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80' },
                { name: 'Ноутбук', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80' },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setImageUrl(item.url)}
                  className="px-2 py-0.5 rounded-lg bg-white border border-stone-200 text-[10px] text-stone-600"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
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
              inputMode="decimal"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="w-full bg-[#FAF8F5] border border-stone-200 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-amber-400 transition-colors"
            />
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
                  inputMode="decimal"
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
