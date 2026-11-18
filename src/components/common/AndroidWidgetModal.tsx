import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, Smartphone, Code2 } from 'lucide-react';

interface AndroidWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidWidgetModal: React.FC<AndroidWidgetModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'kotlin' | 'xml'>('overview');

  if (!isOpen) return null;

  const kotlinCode = `// Pokupochki Daily Widget - Jetpack Glance / AppWidgetProvider
// Размещается на домашнем экране Android как виджет Google Keep
package com.pokupochki.app.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.pokupochki.app.R
import org.json.JSONArray

class DailyShoppingWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.widget_daily_list)
            
            // Загрузка актуального списка «Каждоднев» из SharedPreferences
            val prefs = context.getSharedPreferences("pokupochki_storage", Context.MODE_PRIVATE)
            val jsonStr = prefs.getString("daily_items_cache", "[]")
            val items = JSONArray(jsonStr)
            
            // Настройка RemoteViewsService для интерактивного списка
            val intent = Intent(context, DailyWidgetService::class.java).apply {
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
            }
            views.setRemoteAdapter(R.id.widget_list_view, intent)
            
            // Клик по заголовку открывает раздел «Каждоднев» в приложении
            val openAppIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            val pendingIntent = android.app.PendingIntent.getActivity(
                context, 0, openAppIntent, android.app.PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_header, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}`;

  const xmlLayoutCode = `<!-- res/layout/widget_daily_list.xml -->
<!-- Округлый пастельный дизайн в стиле Google Keep & Minimal Bento -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:background="@drawable/widget_card_bg"
    android:padding="16dp">

    <!-- Header: Жёлтая сумочка + Название + Кнопка Добавить -->
    <RelativeLayout
        android:id="@+id/widget_header"
        android:layout_width="match_parent"
        android:layout_height="wrap_content">
        
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="🛒 Покупочки"
            android:textSize="16sp"
            android:textStyle="bold"
            android:textColor="#1C1917" />

        <ImageButton
            android:id="@+id/btn_quick_add"
            android:layout_width="32dp"
            android:layout_height="32dp"
            android:layout_alignParentEnd="true"
            android:background="@drawable/circle_yellow_btn"
            android:src="@drawable/ic_plus" />
    </RelativeLayout>

    <!-- Список покупок с галочками -->
    <ListView
        android:id="@+id/widget_list_view"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:divider="#F0ECE1"
        android:dividerHeight="1dp"
        android:layout_marginTop="8dp" />

    <!-- Итоговая строка -->
    <TextView
        android:id="@+id/widget_total_sum"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:background="#FEF3C7"
        android:padding="8dp"
        android:text="Итого: 490 ₽"
        android:textStyle="bold"
        android:textColor="#1C1917" />
</LinearLayout>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[32px] w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl border border-stone-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-stone-900">
              Нативный виджет Android (Google Keep)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100 px-6 pt-2 gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'overview'
                ? 'border-amber-400 text-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Архитектура и установка
          </button>
          <button
            onClick={() => setActiveTab('kotlin')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'kotlin'
                ? 'border-amber-400 text-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Kotlin (Provider)
          </button>
          <button
            onClick={() => setActiveTab('xml')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'xml'
                ? 'border-amber-400 text-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            XML Layout
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/50 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm mb-1">
                    Честный нативный виджет Android
                  </h4>
                  <p className="text-xs text-stone-600">
                    Обычные браузерные ярлыки PWA — это не виджеты. Полноценный виджет Android (как в Google Keep) создается через компонент <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px]">AppWidgetProvider</code> при сборке через Capacitor или Android Studio.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-2">Как работает синхронизация виджета:</h4>
                <ol className="list-decimal list-inside space-y-2 text-stone-600 text-xs">
                  <li>
                    <strong>Каждоднев:</strong> При добавлении или отметке товара приложение сохраняет снапшот в <code className="bg-stone-100 px-1 rounded">SharedPreferences</code> через Capacitor-мост.
                  </li>
                  <li>
                    <strong>AppWidgetProvider:</strong> Принимает системный broadcast и обновляет <code className="bg-stone-100 px-1 rounded">RemoteViews</code> на рабочем столе.
                  </li>
                  <li>
                    <strong>Интерактивность:</strong> Тап по галочке в виджете сразу переводит товар в статус купленного без открытия всего приложения!
                  </li>
                </ol>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/60">
                <p className="font-semibold text-stone-800 text-xs mb-1">Шаги сборки Android APK с виджетом:</p>
                <p className="text-[11px] text-stone-500 font-mono">
                  1. npm run build<br />
                  2. npx cap add android<br />
                  3. Скопировать DailyShoppingWidgetProvider.kt в android/app/src/main/java<br />
                  4. npx cap run android
                </p>
              </div>
            </div>
          )}

          {activeTab === 'kotlin' && (
            <div className="relative">
              <button
                onClick={() => copyToClipboard(kotlinCode)}
                className="absolute top-3 right-3 p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Скопировано' : 'Копировать'}</span>
              </button>
              <pre className="p-4 bg-stone-900 text-stone-100 rounded-2xl text-xs font-mono overflow-x-auto max-h-[350px]">
                {kotlinCode}
              </pre>
            </div>
          )}

          {activeTab === 'xml' && (
            <div className="relative">
              <button
                onClick={() => copyToClipboard(xmlLayoutCode)}
                className="absolute top-3 right-3 p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Скопировано' : 'Копировать'}</span>
              </button>
              <pre className="p-4 bg-stone-900 text-stone-100 rounded-2xl text-xs font-mono overflow-x-auto max-h-[350px]">
                {xmlLayoutCode}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
