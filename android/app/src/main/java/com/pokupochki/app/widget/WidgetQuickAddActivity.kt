package com.pokupochki.app.widget

import android.content.Context
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.pokupochki.app.R
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class WidgetQuickAddActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_widget_quick_add)

        val inputTitle = findViewById<EditText>(R.id.input_item_title)
        val inputPrice = findViewById<EditText>(R.id.input_item_price)
        val btnCancel = findViewById<Button>(R.id.btn_cancel)
        val btnAdd = findViewById<Button>(R.id.btn_add)

        inputTitle.requestFocus()

        btnCancel.setOnClickListener {
            finish()
        }

        btnAdd.setOnClickListener {
            val title = inputTitle.text.toString().trim()
            if (title.isEmpty()) {
                Toast.makeText(this, "Введите название покупки", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val priceStr = inputPrice.text.toString().trim().replace(",", ".")
            val price = priceStr.toIntOrNull() ?: priceStr.toDoubleOrNull()?.toInt()

            addItemToPreferences(title, price)
            DailyShoppingWidgetProvider.updateAllWidgets(this)
            Toast.makeText(this, "Добавлено в список: $title", Toast.LENGTH_SHORT).show()
            finish()
        }
    }

    private fun addItemToPreferences(title: stringTitle, price: Int?) {
        val prefs = getSharedPreferences("pokupochki_storage", Context.MODE_PRIVATE)
        val jsonStr = prefs.getString("daily_items", "[]")
        try {
            val oldArray = JSONArray(jsonStr)
            val newArray = JSONArray()

            val nowIso = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).format(Date())
            val newItem = JSONObject().apply {
                put("id", "d_" + System.currentTimeMillis() + "_" + (1000..9999).random())
                put("title", title)
                if (price != null && price >= 0) {
                    put("price", price)
                }
                put("completed", false)
                put("createdAt", nowIso)
                put("updatedAt", nowIso)
            }

            newArray.put(newItem)
            for (i in 0 until oldArray.length()) {
                newArray.put(oldArray.getJSONObject(i))
            }

            prefs.edit().putString("daily_items", newArray.toString()).apply()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
typealias stringTitle = String
