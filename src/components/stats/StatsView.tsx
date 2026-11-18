import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, ShoppingBag, PiggyBank, ArrowDownRight, Tag } from 'lucide-react';
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
      {/* Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Статистика расходов</h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            Анализ трат и история завершённых покупок
          </p>
        </div>

        {/* Period Selector Pills */}
        <div className="inline-flex p-1 rounded-2xl bg-[#F2EDE4]/80 border border-stone-200/50 self-start sm:self-auto">
          {[
            { id: 'day', label: 'День' },
            { id: 'week', label: 'Неделя' },
            { id: 'month', label: 'Месяц' },
            { id: 'all', label: 'Всё время' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id as Period)}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === tab.id
                  ? 'bg-[#FED766] text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Spent */}
        <div className="bg-white rounded-[26px] p-5 shadow-soft border border-stone-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Потрачено</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 tabular-nums">
              {totalSpent.toLocaleString('ru-RU')} ₽
            </p>
            <p className="text-[11px] text-stone-400 mt-1 font-medium">За выбранный период</p>
          </div>
        </div>

        {/* Count of Purchases */}
        <div className="bg-white rounded-[26px] p-5 shadow-soft border border-stone-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Куплено товаров</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 tabular-nums">
              {historyList.length} шт.
            </p>
            <p className="text-[11px] text-stone-400 mt-1 font-medium">
              Средний чек: {historyList.length > 0 ? Math.round(totalSpent / historyList.length).toLocaleString('ru-RU') : 0} ₽
            </p>
          </div>
        </div>

        {/* Saved in Piggy Banks */}
        <div className="bg-white rounded-[26px] p-5 shadow-soft border border-stone-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">В копилках сейчас</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-teal-800 tabular-nums">
              {totalSavedInGoals.toLocaleString('ru-RU')} ₽
            </p>
            <p className="text-[11px] text-stone-400 mt-1 font-medium">На отложенные цели</p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-[28px] p-6 shadow-soft border border-stone-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-900">История покупок</h3>
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
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${item.type === 'main' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'}`}>
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-800">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-stone-400">
                        {new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full bg-stone-100 text-[10px] font-semibold text-stone-500">
                        <Tag className="w-2.5 h-2.5" />
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-base font-extrabold text-stone-900 tabular-nums">
                  -{item.price.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
