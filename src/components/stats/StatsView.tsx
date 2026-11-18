import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, ShoppingCart, PiggyBank, Clock, Filter, ShoppingBag, ChevronRight, Search, Award } from 'lucide-react';
import { DailyItem, MainPurchase } from '../../types';
import { matchProduct } from '../../data/productCatalog';

interface StatsViewProps {
  dailyItems: DailyItem[];
  mainPurchases: MainPurchase[];
}

type Period = 'day' | 'week' | 'month' | 'all';

export const StatsView: React.FC<StatsViewProps> = ({ dailyItems, mainPurchases }) => {
  const [period, setPeriod] = useState<Period>('month');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [productSearch, setProductSearch] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

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

    // Completed main purchases
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
  const allHistoryList = useMemo(() => {
    const combined = [
      ...filteredDaily.map((i) => {
        const matched = matchProduct(i.title);
        return {
          id: i.id,
          title: i.title,
          price: i.price || 0,
          type: 'daily' as const,
          date: i.completedAt || i.createdAt,
          category: i.category || matched?.category || 'Каждоднев',
          image: i.imageUrl || matched?.image,
          canonicalName: matched?.name || i.title.trim(),
        };
      }),
      ...filteredMain.map((m) => ({
        id: m.id,
        title: m.title,
        price: m.price,
        type: 'main' as const,
        date: m.completedAt || m.createdAt,
        category: m.category || 'Главная покупка',
        image: m.imageUrl,
        canonicalName: m.title.trim(),
      })),
    ];

    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredDaily, filteredMain]);

  // Product breakdown calculation across all items in period
  const productStats = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number; image?: string; category: string }>();

    for (const item of allHistoryList) {
      const key = item.canonicalName.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.total += item.price;
        existing.count += 1;
        if (!existing.image && item.image) existing.image = item.image;
      } else {
        map.set(key, {
          name: item.canonicalName,
          total: item.price,
          count: 1,
          image: item.image,
          category: item.category,
        });
      }
    }

    const list = Array.from(map.values()).sort((a, b) => b.total - a.total);
    return list;
  }, [allHistoryList]);

  // Filtered history list based on selected product filter
  const displayedHistory = useMemo(() => {
    if (selectedProduct === 'all') {
      return allHistoryList;
    }
    return allHistoryList.filter(
      (item) => item.canonicalName.toLowerCase() === selectedProduct.toLowerCase()
    );
  }, [allHistoryList, selectedProduct]);

  // Main Purchases grouped by month
  const mainPurchasesByMonth = useMemo(() => {
    const completedMain = mainPurchases.filter((p) => p.completed);
    const groups = new Map<string, { monthLabel: string; sortKey: string; total: number; items: MainPurchase[] }>();

    for (const purchase of completedMain) {
      const d = purchase.completedAt ? new Date(purchase.completedAt) : new Date(purchase.createdAt);
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
      const capitalMonthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

      const existing = groups.get(sortKey);
      if (existing) {
        existing.total += purchase.price || 0;
        existing.items.push(purchase);
      } else {
        groups.set(sortKey, {
          monthLabel: capitalMonthLabel,
          sortKey,
          total: purchase.price || 0,
          items: [purchase],
        });
      }
    }

    return Array.from(groups.values()).sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  }, [mainPurchases]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-7 animate-in fade-in pb-10">
      {/* Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Статистика расходов</h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            Анализ трат, фильтр по товарам и история главных целей
          </p>
        </div>

        {/* Period Selector Pills */}
        <div className="inline-flex p-1 rounded-2xl bg-[#EDE6DC]/80 border border-stone-200/50 self-start sm:self-auto shadow-2xs">
          {[
            { id: 'day', label: 'День' },
            { id: 'week', label: 'Неделя' },
            { id: 'month', label: 'Месяц' },
            { id: 'all', label: 'Всё время' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setPeriod(tab.id as Period);
                setSelectedProduct('all');
              }}
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

      {/* Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Total Spent */}
        <div className="bg-[#FFF8F3] rounded-[28px] p-5 sm:p-6 shadow-soft border border-[#FDE8CE]/90 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-[#FDE8CE] flex items-center justify-center text-amber-900 shrink-0 shadow-2xs">
            <TrendingUp className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-stone-500 block">Потрачено ({period === 'day' ? 'за день' : period === 'week' ? 'за неделю' : period === 'month' ? 'за месяц' : 'всего'})</span>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 tabular-nums leading-tight">
              {totalSpent.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </div>

        {/* 2. Count of Purchases */}
        <div className="bg-[#FFF5F7] rounded-[28px] p-5 sm:p-6 shadow-soft border border-[#FCE7F3]/90 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-[#FCE7F3] flex items-center justify-center text-rose-700 shrink-0 shadow-2xs">
            <ShoppingCart className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-stone-500 block">Куплено товаров</span>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 tabular-nums leading-tight">
              {allHistoryList.length} шт.
            </p>
          </div>
        </div>

        {/* 3. Saved in Piggy Banks */}
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

      {/* NEW: Filter by Product & All Products Spending Breakdown */}
      <div className="bg-white rounded-[32px] p-6 shadow-soft border border-stone-100 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100/70 flex items-center justify-center text-amber-800">
              <Filter className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Фильтр расходов по продукту</h3>
              <p className="text-xs text-stone-500">Выберите конкретный продукт или смотрите расходы по всем</p>
            </div>
          </div>

          {/* Product selector dropdown */}
          <div className="relative min-w-[200px]">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-stone-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-stone-800 focus:bg-white focus:border-amber-400 transition-colors"
            >
              <option value="all">📦 Все продукты ({productStats.length})</option>
              {productStats.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} — {p.total.toLocaleString('ru-RU')} ₽ ({p.count} шт.)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Product Chips / Pills */}
        {productStats.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setSelectedProduct('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedProduct === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
              }`}
            >
              Все ({totalSpent.toLocaleString('ru-RU')} ₽)
            </button>
            {productStats.slice(0, 10).map((prod) => (
              <button
                key={prod.name}
                onClick={() => setSelectedProduct(prod.name)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedProduct.toLowerCase() === prod.name.toLowerCase()
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'bg-amber-50/80 hover:bg-amber-100/80 text-amber-900 border border-amber-200/50'
                }`}
              >
                {prod.image && (
                  <img src={prod.image} alt="" className="w-4 h-4 rounded-full object-cover" />
                )}
                <span>{prod.name}</span>
                <span className="opacity-70 font-medium">· {prod.total.toLocaleString('ru-RU')} ₽</span>
              </button>
            ))}
          </div>
        )}

        {/* Selected Product Highlight Card */}
        {selectedProduct !== 'all' && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {productStats.find(p => p.name.toLowerCase() === selectedProduct.toLowerCase())?.image && (
                <img
                  src={productStats.find(p => p.name.toLowerCase() === selectedProduct.toLowerCase())?.image}
                  alt=""
                  className="w-12 h-12 rounded-2xl object-cover shadow-xs border border-amber-200"
                />
              )}
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Выбранный продукт</span>
                <h4 className="text-lg font-black text-stone-900">{selectedProduct}</h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-500 font-medium block">Итого потрачено</span>
              <p className="text-xl font-black text-amber-900">
                {productStats.find(p => p.name.toLowerCase() === selectedProduct.toLowerCase())?.total.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>
        )}

        {/* List of All Products and their share of spending */}
        {selectedProduct === 'all' && productStats.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
              Топ расходов по всем товарам
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {productStats.map((prod) => {
                const percentOfTotal = totalSpent > 0 ? Math.round((prod.total / totalSpent) * 100) : 0;
                return (
                  <div
                    key={prod.name}
                    onClick={() => setSelectedProduct(prod.name)}
                    className="p-3 rounded-2xl bg-[#FAF8F5] hover:bg-amber-50/70 border border-stone-100 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {prod.image ? (
                        <img src={prod.image} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0 shadow-2xs border border-stone-200/60" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-sm shrink-0">
                          🛒
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate group-hover:text-amber-900">{prod.name}</p>
                        <p className="text-[11px] text-stone-400">
                          {prod.count} {prod.count === 1 ? 'покупка' : 'покупки'} · {percentOfTotal}% от всех трат
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-stone-900 tabular-nums shrink-0">
                      {prod.total.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* NEW: Completed Main Purchases History by Month */}
      <div className="bg-white rounded-[32px] p-6 shadow-soft border border-stone-100 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100/70 flex items-center justify-center text-emerald-800">
              <Award className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">История главных покупок по месяцам</h3>
              <p className="text-xs text-stone-500">Крупные покупки и цели, завершенные в тот или иной месяц</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/50">
            {mainPurchasesByMonth.reduce((acc, g) => acc + g.items.length, 0)} завершено
          </span>
        </div>

        {mainPurchasesByMonth.length === 0 ? (
          <div className="py-8 text-center text-stone-400 rounded-2xl bg-[#FAF8F5] border border-dashed border-stone-200">
            <ShoppingBag className="w-10 h-10 stroke-1 mx-auto mb-2 text-stone-300" />
            <p className="text-sm font-bold text-stone-600">Пока нет завершённых главных покупок</p>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              Когда вы нажмете кнопку «Купить» на карточке главной цели, она сохранится в этой истории с группировкой по месяцам.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {mainPurchasesByMonth.map((group) => (
              <div key={group.sortKey} className="space-y-3">
                {/* Month Group Header */}
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-black text-stone-900">{group.monthLabel}</h4>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {group.total.toLocaleString('ru-RU')} ₽ ({group.items.length} {group.items.length === 1 ? 'покупка' : 'покупки'})
                  </span>
                </div>

                {/* Items in Month */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-stone-50 border border-stone-100 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-2xs border border-stone-200/80"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-lg shrink-0">
                            🛍️
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-stone-900 truncate">{item.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-stone-400">
                              {item.completedAt ? new Date(item.completedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : 'Куплено'}
                            </span>
                            {item.category && (
                              <span className="text-[10px] font-bold text-stone-600 bg-white px-2 py-0.5 rounded-full border border-stone-200">
                                {item.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-stone-900 tabular-nums">
                          {item.price.toLocaleString('ru-RU')} ₽
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 block">✓ Куплено</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History List with Product Photos */}
      <div className="bg-white rounded-[32px] p-6 shadow-soft border border-stone-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-100/70 flex items-center justify-center text-purple-700">
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                {selectedProduct === 'all' ? 'История всех покупок' : `История: ${selectedProduct}`}
              </h3>
              <p className="text-xs text-stone-500">
                {displayedHistory.length} {displayedHistory.length === 1 ? 'запись' : 'записей'}
              </p>
            </div>
          </div>

          {selectedProduct !== 'all' && (
            <button
              onClick={() => setSelectedProduct('all')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 underline"
            >
              Сбросить фильтр
            </button>
          )}
        </div>

        {displayedHistory.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <Calendar className="w-10 h-10 stroke-1 mx-auto mb-2 text-stone-300" />
            <p className="text-sm font-semibold text-stone-500">Нет покупок за этот период</p>
            <p className="text-xs text-stone-400 mt-0.5">
              Отмечайте купленные товары в списке «Каждоднев» или на карточках главных целей
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {displayedHistory.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-11 h-11 rounded-2xl object-cover shrink-0 shadow-2xs border border-stone-100"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100/60 flex items-center justify-center text-lg shrink-0">
                      {item.type === 'main' ? '🛍️' : '🛒'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stone-900 truncate">{item.title}</p>
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

                <span className="text-base font-black text-stone-900 tabular-nums shrink-0">
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
