import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';

interface DailyQuickAddProps {
  onAdd: (title: string, price: number) => void;
}

export const DailyQuickAdd: React.FC<DailyQuickAddProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const parsedPrice = parseFloat(price.replace(/\s/g, '')) || 0;
    onAdd(title.trim(), parsedPrice);
    
    setTitle('');
    setPrice('');
    // Keep focus for rapid consecutive entries (Google Keep widget style!)
    titleInputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3 mt-4">
      {/* Title Input */}
      <div className="flex-1">
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Что купить?"
          className="w-full bg-[#FAF8F5] border border-stone-200/80 rounded-2xl px-4 py-3 text-sm sm:text-base font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-amber-400 focus:shadow-xs transition-all duration-150"
        />
      </div>

      {/* Price Input */}
      <div className="w-24 sm:w-28 relative">
        <input
          type="number"
          min="0"
          step="any"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Цена"
          className="w-full bg-[#FAF8F5] border border-stone-200/80 rounded-2xl px-3 py-3 text-sm sm:text-base font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-amber-400 focus:shadow-xs transition-all duration-150 text-right pr-6"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-semibold select-none pointer-events-none">
          ₽
        </span>
      </div>

      {/* Add Button */}
      <button
        type="submit"
        disabled={!title.trim()}
        aria-label="Добавить товар"
        className="w-12 h-12 rounded-2xl bg-[#FED766] hover:bg-[#FDC830] active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-stone-900 flex items-center justify-center transition-all duration-150 shrink-0 shadow-sm"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>
    </form>
  );
};
