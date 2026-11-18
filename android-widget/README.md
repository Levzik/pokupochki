# Нативный Android-виджет «Покупочки» (Google Keep Style)

> В соответствии с техническими требованиями проекта: **обычные ярлыки PWA не выдаются за виджет**. Здесь представлен полноценный нативный Android-компонент `AppWidgetProvider`, работающий напрямую на домашнем экране Android.

---

## Архитектура решения

1. **Интерфейс на домашнем экране**:
   - Округлый фон в стиле Minimal Bento (пастельный тёплый оттенок).
   - Шапка: иконка-сумочка, название «Покупочки», кнопка быстрого добавления `+`.
   - Интерактивный список товаров: чекбокс, название, цена.
   - Плашка «Итого» с подсчетом суммы активных покупок.

2. **Двусторонняя синхронизация с PWA / веб-хранилищем**:
   - Приложение «Покупочки» при упаковке через **Capacitor** или **TWA** синхронизирует локальный массив `daily_items` из IndexedDB в нативный `SharedPreferences`.
   - Виджет слушает `ACTION_APPWIDGET_UPDATE` и отображает актуальный список без запуска самого браузера или Webview.
   - При тапе по чекбоксу в виджете отправляется интент `ACTION_TOGGLE_ITEM`, статус покупки инвертируется в фоне, а при открытии PWA база IndexedDB автоматически подхватывает новые изменения.

---

## Структура файлов виджета

- `DailyShoppingWidgetProvider.kt` — главный обработчик жизненного цикла виджета, кликов по кнопкам и чекбоксам.
- `DailyWidgetService.kt` — сервис `RemoteViewsService` и фабрика `RemoteViewsFactory` для динамического списка товаров.
- `res/layout/widget_daily_list.xml` — основной XML-макет карточки виджета на рабочем столе.
- `res/layout/widget_daily_item.xml` — XML-макет строки товара (чекбокс, название, цена).
- `res/xml/daily_widget_info.xml` — метаданные виджета (размеры, сетка 3x3 / 4x4, масштабирование).

---

## Как собрать APK с поддержкой виджета

```bash
# 1. Собрать статику веб-приложения
npm run build

# 2. Инициализировать Capacitor (если еще не добавлен)
npx cap add android

# 3. Скопировать kotlin-файлы в:
# android/app/src/main/java/com/pokupochki/app/widget/

# 4. Скопировать xml-макеты в:
# android/app/src/main/res/layout/ и res/xml/

# 5. Зарегистрировать ресивер в AndroidManifest.xml:
<receiver android:name=".widget.DailyShoppingWidgetProvider" android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/daily_widget_info" />
</receiver>
<service android:name=".widget.DailyWidgetService"
    android:permission="android.permission.BIND_REMOTEVIEWS" />

# 6. Запустить сборку
npx cap run android
```
