package com.pokupochki.app.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import com.pokupochki.app.R
import org.json.JSONArray

/**
 * Нативный Android-виджет «Покупочки: Каждоднев»
 * Позволяет:
 * 1. Просматривать список покупок и общую сумму
 * 2. Вычеркивать купленные товары
 * 3. Быстро добавлять новую покупку с ценой прямо с виджета
 * 4. Удалять товары прямо с виджета, если случайно добавил
 */
class DailyShoppingWidgetProvider : AppWidgetProvider() {

    companion object {
        const val ACTION_TOGGLE_ITEM = "com.pokupochki.app.widget.ACTION_TOGGLE_ITEM"
        const val ACTION_DELETE_ITEM = "com.pokupochki.app.widget.ACTION_DELETE_ITEM"
        const val EXTRA_ITEM_ID = "com.pokupochki.app.widget.EXTRA_ITEM_ID"

        fun updateAllWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val thisWidget = ComponentName(context, DailyShoppingWidgetProvider::class.java)
            val allWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget)
            val intent = Intent(context, DailyShoppingWidgetProvider::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, allWidgetIds)
            }
            context.sendBroadcast(intent)
        }
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.widget_daily_list)

            // Чтение данных «Каждоднев» из SharedPreferences
            val prefs = context.getSharedPreferences("pokupochki_storage", Context.MODE_PRIVATE)
            val jsonStr = prefs.getString("daily_items", "[]")
            var totalSum = 0

            try {
                val array = JSONArray(jsonStr)
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    if (!obj.optBoolean("completed", false)) {
                        totalSum += obj.optInt("price", 0)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }

            // Установка суммы
            views.setTextViewText(R.id.widget_total_text, "Итого: $totalSum ₽")

            // Настройка RemoteViewsService для списка товаров
            val serviceIntent = Intent(context, DailyWidgetService::class.java).apply {
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
                data = Uri.parse(toUri(Intent.URI_INTENT_SCHEME))
            }
            views.setRemoteAdapter(R.id.widget_list_view, serviceIntent)
            views.setEmptyView(R.id.widget_list_view, R.id.widget_empty_view)

            // Клик по шапке виджета открывает раздел «Каждоднев» в приложении
            val openAppIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)?.apply {
                putExtra("shortcut_target", "daily")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            if (openAppIntent != null) {
                val pendingOpen = PendingIntent.getActivity(
                    context, 0, openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_header_container, pendingOpen)
            }

            // Клик по кнопке быстрого добавления "+" запускает диалог добавления прямо на рабочем столе
            val quickAddIntent = Intent(context, WidgetQuickAddActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingAdd = PendingIntent.getActivity(
                context, 1, quickAddIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_btn_add, pendingAdd)

            // PendingIntentTemplate для элементов списка (галочка и удаление)
            val rowClickIntent = Intent(context, DailyShoppingWidgetProvider::class.java).apply {
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
            }
            val rowPendingIntent = PendingIntent.getBroadcast(
                context, 2, rowClickIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
            )
            views.setPendingIntentTemplate(R.id.widget_list_view, rowPendingIntent)

            appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.widget_list_view)
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
        super.onUpdate(context, appWidgetManager, appWidgetIds)
    }

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            ACTION_TOGGLE_ITEM -> {
                val itemId = intent.getStringExtra(EXTRA_ITEM_ID)
                if (itemId != null) {
                    toggleItemCompleted(context, itemId)
                    updateAllWidgets(context)
                }
            }
            ACTION_DELETE_ITEM -> {
                val itemId = intent.getStringExtra(EXTRA_ITEM_ID)
                if (itemId != null) {
                    deleteItemFromPreferences(context, itemId)
                    updateAllWidgets(context)
                }
            }
        }
        super.onReceive(context, intent)
    }

    private fun toggleItemCompleted(context: Context, itemId: String) {
        val prefs = context.getSharedPreferences("pokupochki_storage", Context.MODE_PRIVATE)
        val jsonStr = prefs.getString("daily_items", "[]")
        try {
            val array = JSONArray(jsonStr)
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                if (obj.getString("id") == itemId) {
                    val current = obj.optBoolean("completed", false)
                    obj.put("completed", !current)
                    obj.put("updatedAt", java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).format(java.util.Date()))
                    break
                }
            }
            prefs.edit().putString("daily_items", array.toString()).apply()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun deleteItemFromPreferences(context: Context, itemId: String) {
        val prefs = context.getSharedPreferences("pokupochki_storage", Context.MODE_PRIVATE)
        val jsonStr = prefs.getString("daily_items", "[]")
        try {
            val array = JSONArray(jsonStr)
            val newArray = JSONArray()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                if (obj.getString("id") != itemId) {
                    newArray.put(obj)
                }
            }
            prefs.edit().putString("daily_items", newArray.toString()).apply()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
