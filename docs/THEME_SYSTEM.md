# 🌓 Система тем

Приложение поддерживает три режима отображения: светлая тема, тёмная тема и автоматический режим.

## 📁 Структура компонента

```
src/app/components/theme-switcher/
├── theme-switcher.component.ts       # Логика компонента
├── theme-switcher.component.html     # Шаблон кнопки
├── theme-switcher.component.scss     # Стили кнопки
└── theme-switcher.component.spec.ts  # Тесты
```

## 📁 Структура сервиса

```
src/app/services/
├── theme.service.ts         # Сервис управления темами
└── theme.service.spec.ts    # Тесты сервиса
```

## 🎨 Режимы темы

| Режим | Иконка | Описание |
|-------|--------|----------|
| `light` | ☀️ | Светлая тема |
| `dark` | 🌙 | Тёмная тема |
| `auto` | 💻 | Автоматическое определение по системным настройкам |

## ⚙️ Принцип работы

### ThemeService

Сервис `ThemeService` управляет темой приложения и предоставляет следующие возможности:

**Observable потоки:**
- `theme$` — текущий выбранный режим темы (`light` | `dark` | `auto`)
- `effectiveTheme$` — эффективная тема (`light` | `dark`), фактически применённая

**Методы:**

| Метод | Описание |
|-------|----------|
| `setTheme(theme)` | Установить конкретную тему |
| `toggleTheme()` | Переключить тему по кругу: light → dark → auto → light |
| `currentTheme` | Getter для текущего режима |
| `effectiveTheme` | Getter для эффективной темы |

**Хранение:**
- Тема сохраняется в `localStorage` с ключом `text_annotation_theme`
- По умолчанию используется режим `auto`

**Применение темы:**
- Добавляет класс `dark-theme` или `light-theme` на `<html>` элемент
- Обновляет `meta[name="theme-color"]` для мобильных браузеров
- Реагирует на изменения системной темы через `matchMedia` (в режиме `auto`)

### ThemeSwitcherComponent

Компонент отображает кнопку с иконкой текущей темы:

```html
<button class="theme-toggle" (click)="toggleTheme()">
  <span class="theme-toggle__icon">{{ icon }}</span>
</button>
```

**Функции компонента:**
- Отображение иконки текущей темы (☀️ / 🌙 / 💻)
- Подсказка с названием темы (`title`, `aria-label`)
- Анимация при наведении (поворот иконки на 15°)
- Адаптивный размер для мобильных устройств

## 🔄 Алгоритм переключения

```
Клик по кнопке
      ↓
toggleTheme() в ThemeService
      ↓
light → dark → auto → light (цикл)
      ↓
Сохранение в localStorage
      ↓
Вычисление эффективной темы:
  - light → light
  - dark → dark
  - auto → проверка prefers-color-scheme
      ↓
Применение классов к <html>:
  - dark-theme / light-theme
      ↓
Обновление meta theme-color
```

## 🎯 CSS переменные для тем

Темы используют CSS custom properties для динамической смены цветов:

```scss
:root {
  --color-bg-primary: #f5f5f5;
  --color-text-primary: #333;
  // ...
}

.dark-theme {
  --color-bg-primary: #1a1a2e;
  --color-text-primary: #e0e0e0;
  // ...
}
```

## ♿ Доступность

- Атрибут `aria-label` содержит название текущей темы
- Атрибут `title` показывает подсказку при наведении
- Кнопка доступна для клавиатурной навигации
- Визуальный фокус при `:focus-visible`
