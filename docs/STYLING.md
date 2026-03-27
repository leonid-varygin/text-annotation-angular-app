# 🎨 Стилизация и SCSS переменные

Проект использует централизованную систему дизайна на основе SCSS переменных. Все переменные определены в файле `src/styles/_variables.scss`.

## Использование

```scss
@use '../../../styles/variables' as *;

.my-component {
  color: $color-text-primary;
  background: $color-bg-card;
  border-radius: $border-radius-lg;
}
```

## Цветовая палитра

### Primary

| Переменная | Значение | Описание |
|------------|----------|----------|
| `$color-primary` | `#4a90d9` | Основной акцентный цвет |
| `$color-primary-hover` | `#357abd` | Hover-состояние primary |
| `$color-primary-light` | `rgba(74, 144, 217, 0.25)` | Светлый оттенок |
| `$color-primary-transparent` | `rgba(74, 144, 217, 0.3)` | Прозрачный оттенок |

### Text

| Переменная | Значение | Описание |
|------------|----------|----------|
| `$color-text-primary` | `#333` | Основной текст |
| `$color-text-secondary` | `#666` | Вторичный текст |
| `$color-text-tertiary` | `#888` | Третичный текст |
| `$color-text-muted` | `#495057` | Приглушённый текст |

### Background

| Переменная | Значение | Описание |
|------------|----------|----------|
| `$color-bg-primary` | `#f5f5f5` | Фон страницы |
| `$color-bg-secondary` | `#f8f9fa` | Вторичный фон |
| `$color-bg-card` | `white` | Фон карточек |

### Borders

| Переменная | Значение | Описание |
|------------|----------|----------|
| `$color-border-primary` | `#e9ecef` | Границы |
| `$color-border-hover` | `#dee2e6` | Hover-границы |

### Status

| Переменная | Значение | Описание |
|------------|----------|----------|
| `$color-danger` | `#dc3545` | Ошибки/удаление |
| `$color-warning` | `#fff3cd` | Предупреждения |

## Типографика

| Переменная | Значение | Описание |
|------------|----------|----------|
| `$font-family-base` | System fonts | Базовый шрифт |
| `$font-size-xs` | `0.85rem` | Очень маленький |
| `$font-size-sm` | `0.9rem` | Маленький |
| `$font-size-base` | `1rem` | Базовый |
| `$font-size-md` | `1.1rem` | Средний |
| `$font-size-lg` | `1.25rem` | Большой |
| `$font-size-xl` | `1.5rem` | Очень большой |
| `$font-size-2xl` | `2rem` | Огромный |

## Отступы

| Переменная | Значение |
|------------|----------|
| `$spacing-xs` | `0.25rem` |
| `$spacing-sm` | `0.5rem` |
| `$spacing-md` | `0.75rem` |
| `$spacing-lg` | `1rem` |
| `$spacing-xl` | `1.5rem` |
| `$spacing-2xl` | `2rem` |
| `$spacing-3xl` | `3rem` |

## Скругления

| Переменная | Значение |
|------------|----------|
| `$border-radius-sm` | `2px` |
| `$border-radius-md` | `4px` |
| `$border-radius-lg` | `8px` |
| `$border-radius-xl` | `12px` |
| `$border-radius-xl-2` | `20px` |
| `$border-radius-full` | `50%` |

## Тени

| Переменная | Описание |
|------------|----------|
| `$shadow-sm` | Маленькая тень (карточки) |
| `$shadow-md` | Средняя тень (hover) |
| `$shadow-lg` | Большая тень (модальные окна) |
| `$shadow-focus` | Тень фокуса для accessibility |

## Брейкпоинты

| Переменная | Значение | Описание |
|------------|----------|----------|
| `$breakpoint-sm` | `480px` | Мобильные устройства |
| `$breakpoint-md` | `768px` | Планшеты |

## Z-Index

| Переменная | Значение | Описание |
|------------|----------|----------|
| `$z-index-modal` | `1000` | Модальные окна |
| `$z-index-tooltip` | `1100` | Всплывающие подсказки |
| `$z-index-skip-link` | `9999` | Skip-link для a11y |
