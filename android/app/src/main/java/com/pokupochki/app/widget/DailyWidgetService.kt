package com.pokupochki.app.widget

import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import android.widget.RemoteViewsService
import com.pokupochki.app.R
import org.json.JSONArray
import org.json.JSONObject

class DailyWidgetService : RemoteViewsService() {
    override fun onGetViewFactory(intent: Intent): RemoteViewsFactory {
        return DailyWidgetViewsFactory(this.applicationContext)
    }
}

class DailyWidgetViewsFactory(private val context: Context) : RemoteViewsService.RemoteViewsFactory {
    private val itemList = ArrayList<JSONObject>()

    override fun onCreate() {
        loadData()
    }

    override fun onDataSetChanged() {
        loadData()
    }

    private fun loadData() {
        itemList.clear()
        val prefs = context.getSharedPreferences("pokupochki_storage", Context.MODE_PRIVATE)
        val jsonStr = prefs.getString("daily_items", "[]")
        try {
            val array = JSONArray(jsonStr)
            for (i in 0 until array.length()) {
                itemList.add(array.getJSONObject(i))
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onDestroy() {
        itemList.clear()
    }

    override fun getCount(): Int = itemList.size

    override fun getViewAt(position: Int): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.widget_daily_item)
        if (position >= itemList.size) return views

        val item = itemList[position]
        val id = item.optString("id", "")
        val title = item.optString("title", "")
        val hasPrice = item.has("price") && !item.isNull("price")
        val price = item.optInt("price", 0)
        val completed = item.optBoolean("completed", false)

        views.setTextViewText(R.id.item_title, title)
        views.setTextViewText(R.id.item_price, if (hasPrice) "$price ₽" else "")

        // Checkbox status and strikethrough styling
        if (completed) {
            views.setImageViewResource(R.id.item_checkbox, R.drawable.ic_checkbox_checked)
            views.setTextColor(R.id.item_title, 0xFF9CA3AF.toInt())
            views.setTextColor(R.id.item_price, 0xFF9CA3AF.toInt())
        } else {
            views.setImageViewResource(R.id.item_checkbox, R.drawable.ic_checkbox_unchecked)
            views.setTextColor(R.id.item_title, 0xFF1C1917.toInt())
            views.setTextColor(R.id.item_price, 0xFF1C1917.toInt())
        }

        // Toggle action intent
        val fillInToggle = Intent().apply {
            action = DailyShoppingWidgetProvider.ACTION_TOGGLE_ITEM
            putExtra(DailyShoppingWidgetProvider.EXTRA_ITEM_ID, id)
        }
        views.setOnClickFillInIntent(R.id.item_checkbox, fillInToggle)
        views.setOnClickFillInIntent(R.id.item_text_container, fillInToggle)

        // Delete action intent
        val fillInDelete = Intent().apply {
            action = DailyShoppingWidgetProvider.ACTION_DELETE_ITEM
            putExtra(DailyShoppingWidgetProvider.EXTRA_ITEM_ID, id)
        }
        views.setOnClickFillInIntent(R.id.item_btn_delete, fillInDelete)

        return views
    }

    override fun getLoadingView(): RemoteViews? = null
    override fun getViewTypeCount(): Int = 1
    override fun getItemId(position: Int): Long = position.toLong()
    override fun hasStableIds(): Boolean = true
}
