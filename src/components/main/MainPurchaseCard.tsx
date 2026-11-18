import React from 'react';
import { MoreHorizontal, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { MainPurchase } from '../../types';
import { getCardTheme } from '../../utils/cardThemes';

interface MainPurchaseCardProps {
  purchase: MainPurchase;
  index?: number;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const MainPurchaseCard: React.FC<MainPurchaseCardProps> = ({
  purchase,
  index = 0,
  onClick,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const theme = getCardTheme(purchase.colorTheme, index);

  const price = purchase.price || 0;
  const saved = purchase.savedAmount || 0;
  const percent = price > 0 ? Math.min(100, Math.round((saved / price) * 100)) : 0;

  return (
    <div
      onClick={onClick}
      className={`group relative ${theme.bg} rounded-[28px] p-4 sm:p-5 shadow-soft hover:shadow-soft-hover border ${theme.border} ${theme.hoverBorder} transition-all duration-200 cursor-pointer flex flex-col justify-between`}
    >
      {/* 3-dots Quick Menu Button */}
      <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setShowMenu((prev) => !prev)}
          className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors shadow-xs"
          title="Действия"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-9 w-36 bg-white rounded-2xl shadow-xl border border-stone-100 py-1.5 z-20 animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                setShowMenu(false);
                onEdit();
              }}
              className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              Редактировать
            </button>
            <button
              onClick={() => {
                setShowMenu(false);
                onDelete();
              }}
              className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
            >
              Удалить
            </button>
          </div>
        )}
      </div>

      {/* Top Image or Minimal Placeholder with matched soft background */}
      <div className={`w-full h-36 sm:h-44 rounded-2xl overflow-hidden ${theme.imageBg} mb-3 flex items-center justify-center relative transition-colors`}>
        {purchase.imageUrl ? (
          <img
            src={purchase.imageUrl}
            alt={purchase.title}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-stone-300 gap-1.5">
            <ImageIcon className="w-10 h-10 stroke-1 text-stone-400/60" />
            <span className="text-[11px] font-medium text-stone-400">Без фото</span>
          </div>
        )}

        {/* Link indicator if link is provided */}
        {purchase.link && (
          <a
            href={purchase.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Перейти в магазин"
            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white/95 text-stone-600 hover:text-amber-600 shadow-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Title & Price */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug line-clamp-1">
            {purchase.title}
          </h3>
          <p className="text-base sm:text-lg font-extrabold text-stone-800 tracking-tight mt-0.5 tabular-nums">
            {price.toLocaleString('ru-RU')} ₽
          </p>
        </div>

        {/* 
          CRITICAL REQUIREMENT:
          "Никакой полоски накоплений по умолчанию нет.
          Только после активации копилки на главной карточке отображается компактный прогресс накоплений."
        */}
        {purchase.piggyBankEnabled ? (
          <div className="mt-3 pt-2.5 border-t border-stone-200/50">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-stone-600">
                Отложено {saved.toLocaleString('ru-RU')} ₽
              </span>
              <span className={`font-bold ${theme.percentBadge} px-1.5 py-0.5 rounded-md text-[11px] tabular-nums`}>
                {percent}%
              </span>
            </div>
            
            {/* Progress Bar styled with the card's accent */}
            <div className="w-full h-2 bg-stone-200/50 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${theme.progressBar} rounded-full transition-all duration-300`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
