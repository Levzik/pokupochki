import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, ShoppingCart, PiggyBank, Clock, Tag } from 'lucide-react';
import { DailyItem, MainPurchase } from '../../types';

interface StatsViewProps {
  dailyItems: DailyItem[];
  mainPurchases: MainPurchase[];
}

type Period = 'day' | 'week' | 'month' | 'all';

export const StatsView: React.FC<StatsViewProps> = ({ dailyItems, mainPurchases }) => {
  const [period, setPeriod] = useState<Period>('week');

  // Filter items by selected period
  const { filteredDaily, filteredMain, totalSpent, totalSavedInGoals } = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    if (period === 'day') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    } else {
      startDate = new Date(0); // all time
    }

    // Completed daily items within period
    const fDaily = dailyItems.filter((item) => {
      if (!item.completed) return false;
      const date = item.completedAt ? new Date(item.completedAt) : new Date(item.createdAt);
      return date >= startDate;
    });

    // Completed main purchases (or active piggy bank savings)
    const fMain = mainPurchases.filter((p) => {
      if (!p.completed) return false;
      const date = p.completedAt ? new Date(p.completedAt) : new Date(p.createdAt);
      return date >= startDate;
    });

    const dailySum = fDaily.reduce((sum, item) => sum + (item.price || 0), 0);
    const mainSum = fMain.reduce((sum, p) => sum + (p.price || 0), 0);
    const total = dailySum + mainSum;

    // Total in active piggy banks
    const savedSum = mainPurchases.reduce((acc, p) => acc + (p.piggyBankEnabled ? (p.savedAmount || 0) : 0), 0);

    return {
      filteredDaily: fDaily,
      filteredMain: fMain,
      totalSpent: total,
      totalSavedInGoals: savedSum,
    };
  }, [dailyItems, mainPurchases, period]);

  // Combined purchase history (most recent first)
  const historyList = useMemo(() => {
    const combined = [
      ...filteredDaily.map((i) => ({
        id: i.id,
        title: i.title,
        price: i.price,
        type: 'daily' as const,
        date: i.completedAt || i.createdAt,
        category: 'Каждоднев',
      })),
      ...filteredMain.map((m) => ({
        id: m.id,
        title: m.title,
        price: m.price,
        type: 'main' as const,
        date: m.completedAt || m.createdAt,
        category: m.category || 'Главная покупка',
      })),
    ];

    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredDaily, filteredMain]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Title & Filter Tabs (Matching референс 3.png) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Статистика расходов</h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            Анализ трат и история завершённых покупок
          </p>
        </div>

        {/* Period Selector Pills */}
        <div className="inline-flex p-1 rounded-2xl bg-[#EDE6DC]/80 border border-stone-200/50 self-start sm:self-auto">
          {[
            { id: 'day', label: 'День' },
            { id: 'week', label: 'Неделя' },
            { id: 'month', label: 'Месяц' },
            { id: 'all', label: 'Всё время' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id as Period)}
              className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === tab.id
                  ? 'bg-gradient-to-b from-[#FED766] to-[#FDBF3B] text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Metric Cards (Matching pastel styling from референс 3.png) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Total Spent (Warm peach) */}
        <div className="bg-[#FFF8F3] rounded-[28px] p-5 sm:p-6 shadow-soft border border-[#FDE8CE]/90 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-[#FDE8CE] flex items-center justify-center text-amber-900 shrink-0 shadow-2xs">
            <TrendingUp className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-stone-500 block">Потрачено</span>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 tabular-nums leading-tight">
              {totalSpent.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </div>

        {/* 2. Count of Purchases (Soft pink) */}
        <div className="bg-[#FFF5F7] rounded-[28px] p-5 sm:p-6 shadow-soft border border-[#FCE7F3]/90 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-[#FCE7F3] flex items-center justify-center text-rose-700 shrink-0 shadow-2xs">
            <ShoppingCart className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-stone-500 block">Куплено товаров</span>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 tabular-nums leading-tight">
              {historyList.length} шт.
            </p>
          </div>
        </div>

        {/* 3. Saved in Piggy Banks (Soft mint) */}
        <div className="bg-[#F0FDF4] rounded-[28px] p-5 sm:p-6 shadow-soft border border-[#DCFCE7]/90 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7] flex items-center justify-center text-teal-800 shrink-0 shadow-2xs">
            <PiggyBank className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-stone-500 block">В копилках сейчас</span>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 tabular-nums leading-tight">
              {totalSavedInGoals.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </div>
      </div>

      {/* History List (Matching референс 3.png) */}
      <div className="bg-white rounded-[28px] p-6 shadow-soft border border-stone-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-stone-900">История покупок</h3>
          </div>
          <span className="text-xs font-semibold text-stone-400">
            {historyList.length} {historyList.length === 1 ? 'запись' : 'записей'}
          </span>
        </div>

        {historyList.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <Calendar className="w-10 h-10 stroke-1 mx-auto mb-2 text-stone-300" />
            <p className="text-sm font-semibold text-stone-500">Нет покупок за этот период</p>
            <p className="text-xs text-stone-400 mt-0.5">
              Отмечайте купленные товары в списке «Каждоднев»
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {historyList.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100/60 flex items-center justify-center text-lg shrink-0">
                    {item.type === 'main' ? '🛍️' : '🛒'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-900">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-stone-400">
                        {new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[10px] font-bold text-stone-800">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-base font-black text-stone-900 tabular-nums">
                  -{item.price ? `${item.price.toLocaleString('ru-RU')} ₽` : '0 ₽'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
