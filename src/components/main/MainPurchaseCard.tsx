import React, { useState } from 'react';
import { MoreHorizontal, ExternalLink, Image as ImageIcon, Check } from 'lucide-react';
import { MainPurchase } from '../../types';
import { getCardTheme } from '../../utils/cardThemes';

interface MainPurchaseCardProps {
  purchase: MainPurchase;
  index?: number;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete?: () => void;
}

export const MainPurchaseCard: React.FC<MainPurchaseCardProps> = ({
  purchase,
  index = 0,
  onClick,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  // Color is automatically assigned from the pastel palette!
  const theme = getCardTheme(purchase.colorTheme, index);

  const price = purchase.price || 0;
  const saved = purchase.savedAmount || 0;
  const percent = price > 0 ? Math.min(100, Math.round((saved / price) * 100)) : 0;

  return (
    <div
      onClick={onClick}
      className={`group relative ${theme.bg} rounded-[30px] shadow-soft hover:shadow-soft-hover border ${theme.border} ${theme.hoverBorder} transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden`}
    >
      {/* 
        Full-size / Full-bleed Image with Ambient Backdrop
        Shows 100% of the photo without clipping faces/text, framed by ambient colors
      */}
      <div className="w-full h-52 sm:h-60 relative overflow-hidden bg-stone-900/5 flex items-center justify-center">
        {purchase.imageUrl ? (
          <>
            {/* Ambient Blurred Background filling the frame edge-to-edge */}
            <img
              src={purchase.imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-125 blur-xl opacity-40 pointer-events-none"
            />
            {/* Fully visible, uncropped subject */}
            <img
              src={purchase.imageUrl}
              alt={purchase.title}
              className="relative z-[1] w-full h-full object-contain p-1.5 drop-shadow-sm group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 gap-1.5 bg-gradient-to-b from-white/40 to-black/[0.02]">
            <ImageIcon className="w-12 h-12 stroke-1 text-stone-400/50" />
            <span className="text-xs font-semibold text-stone-400">Без фото</span>
          </div>
        )}

        {/* Subtle gradient scrim at the top for badge/button contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" />

        {/* 3-dots Quick Menu Button */}
        <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 flex items-center justify-center transition-all shadow-md backdrop-blur-md active:scale-95"
            title="Действия"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 w-36 bg-white rounded-2xl shadow-xl border border-stone-100 py-1.5 z-20 animate-in fade-in zoom-in-95">
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

        {/* External Link button if link is provided */}
        {purchase.link && (
          <a
            href={purchase.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Перейти в магазин"
            className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-amber-600 shadow-md backdrop-blur-md transition-all active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Card Content & Details */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug line-clamp-1">
            {purchase.title}
          </h3>
          <p className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-1 tabular-nums">
            {price.toLocaleString('ru-RU')} ₽
          </p>
        </div>

        {/* 
          CRITICAL REQUIREMENT:
          "Никакой полоски накоплений по умолчанию нет.
          Только после активации копилки на главной карточке отображается компактный прогресс накоплений."
        */}
        {purchase.piggyBankEnabled ? (
          <div className="mt-4 pt-3 border-t border-stone-200/50">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-stone-600">
                Отложено {saved.toLocaleString('ru-RU')} ₽
              </span>
              <span className={`font-bold ${theme.percentBadge} px-2 py-0.5 rounded-lg text-xs tabular-nums shadow-2xs`}>
                {percent}%
              </span>
            </div>
            
            {/* Progress Bar styled with the card's accent */}
            <div className="w-full h-2.5 bg-stone-200/50 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${theme.progressBar} rounded-full transition-all duration-300`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ) : null}
        {/* Action Button: "Купить" per user request */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete?.();
          }}
          className={`w-full mt-4 py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 ${
            purchase.completed
              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
              : 'bg-gradient-to-r from-[#FED766] to-[#FDBF3B] hover:brightness-105 text-stone-900 shadow-2xs'
          }`}
          title={purchase.completed ? 'Нажмите, чтобы вернуть в активные' : 'Отметить как купленное'}
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{purchase.completed ? 'Куплено ✓' : 'Купить'}</span>
        </button>
      </div>
    </div>
  );
};
