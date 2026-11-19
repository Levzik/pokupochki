import React, { useState, useRef, useEffect } from 'react';
import { Check, Trash2, Edit2, X, GripVertical } from 'lucide-react';
import { DailyItem } from '../../types';
import { matchProduct } from '../../data/productCatalog';

interface DailyItemRowProps {
  item: DailyItem;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<DailyItem>) => void;
  onDelete: (id: string) => void;
  onTouchDragStart?: (e: React.TouchEvent) => void;
  onTouchDragMove?: (e: React.TouchEvent) => void;
  onTouchDragEnd?: (e: React.TouchEvent) => void;
}

export const DailyItemRow: React.FC<DailyItemRowProps> = ({
  item,
  onToggle,
  onUpdate,
  onDelete,
  onTouchDragStart,
  onTouchDragMove,
  onTouchDragEnd,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editPrice, setEditPrice] = useState(
    item.price !== undefined && item.price !== null ? item.price.toString() : ''
  );
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (!editTitle.trim()) {
      onDelete(item.id);
      return;
    }
    let parsedPrice: number | undefined = undefined;
    const cleanPrice = editPrice.trim().replace(/\s/g, '').replace(',', '.');
    if (cleanPrice !== '') {
      const p = parseFloat(cleanPrice);
      if (!isNaN(p)) {
        parsedPrice = Math.max(0, p);
      }
    }

    onUpdate(item.id, {
      title: editTitle.trim(),
      price: parsedPrice
    });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditTitle(item.title);
      setEditPrice(item.price !== undefined && item.price !== null ? item.price.toString() : '');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 py-2 px-1 border-b border-stone-100 bg-amber-50/40 rounded-xl px-2">
        <input
          ref={titleInputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Название"
          className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-sm font-medium text-stone-900 focus:border-amber-400"
        />
        <div className="relative w-24">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="0"
            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-sm font-medium text-stone-900 focus:border-amber-400 pr-6 text-right"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-medium">₽</span>
        </div>
        <button
          onClick={handleSave}
          className="p-1.5 bg-[#FED766] hover:bg-[#FDC830] active:scale-95 text-stone-900 rounded-xl transition-all"
          title="Сохранить"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          onClick={() => {
            setEditTitle(item.title);
            setEditPrice(item.price !== undefined && item.price !== null ? item.price.toString() : '');
            setIsEditing(false);
          }}
          className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-colors"
          title="Отмена"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const productImage = item.imageUrl || matchProduct(item.title)?.image;

  return (
    <div className="group flex items-center justify-between py-2.5 sm:py-3 border-b border-stone-100 last:border-b-0 transition-colors hover:bg-stone-50/60 rounded-xl px-1 sm:px-2">
      {/* Checkbox, Thumbnail, Title and Drag Handle */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0 pr-2">
        {/* Drag handle */}
        {!item.completed && (
          <div
            onTouchStart={onTouchDragStart}
            onTouchMove={onTouchDragMove}
            onTouchEnd={onTouchDragEnd}
            className="p-1 -ml-1 text-stone-300 hover:text-stone-600 active:text-amber-500 cursor-grab active:cursor-grabbing touch-none select-none transition-colors shrink-0"
            title="Перетащить в очереди"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        <button
          type="button"
          onClick={() => onToggle(item.id)}
          aria-label={item.completed ? "Отметить как некупленное" : "Отметить как купленное"}
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 active:scale-90 ${
            item.completed
              ? 'bg-[#FED766] border-[#FED766] text-stone-900 shadow-xs'
              : 'border-2 border-stone-300 hover:border-amber-400 bg-white hover:scale-105'
          }`}
        >
          {item.completed && <Check className="w-4 h-4 stroke-[3] text-stone-900 animate-in zoom-in-75 duration-150" />}
        </button>

        {productImage && (
          <img
            src={productImage}
            alt=""
            className={`w-8 h-8 rounded-xl object-cover shrink-0 shadow-2xs border border-stone-100 transition-all ${
              item.completed ? 'opacity-40 grayscale' : 'opacity-100'
            }`}
          />
        )}

        <span
          onClick={() => setIsEditing(true)}
          className={`text-base font-semibold truncate cursor-pointer transition-all duration-200 ${
            item.completed
              ? 'line-through text-stone-400 font-normal decoration-stone-300'
              : 'text-stone-800 hover:text-stone-950'
          }`}
          title="Нажмите для редактирования"
        >
          {item.title}
        </span>
      </div>

      {/* Price and Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <span
          onClick={() => setIsEditing(true)}
          className={`text-sm sm:text-base font-bold tabular-nums cursor-pointer px-1.5 py-0.5 rounded hover:bg-stone-100 transition-colors ${
            item.completed ? 'text-stone-400 line-through font-normal' : 'text-stone-900'
          }`}
          title="Нажмите для редактирования цены"
        >
          {item.price === undefined || item.price === null ? (
            <span className="text-stone-300 font-medium select-none" title="Цена не указана">—</span>
          ) : item.price === 0 ? (
            <span className="text-stone-500 font-semibold">0 ₽</span>
          ) : (
            <span>{item.price.toLocaleString('ru-RU')} ₽</span>
          )}
        </span>

        {/* Quick action buttons (revealed on hover or on mobile) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            title="Редактировать"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Удалить"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
