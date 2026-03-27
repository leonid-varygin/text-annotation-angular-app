# 🏗️ Архитектура проекта

## 📁 Структура проекта

```
text-annotation-app/
├── angular.json                   # Конфигурация Angular CLI
├── package.json                   # Зависимости и скрипты npm
├── tsconfig.json                  # Базовая конфигурация TypeScript
├── tsconfig.app.json              # Конфигурация TS для приложения
├── tsconfig.spec.json             # Конфигурация TS для тестов
├── .editorconfig                  # Настройки редактора
├── .gitignore                     # Исключения Git
├── README.md                      # Документация проекта
│
├── public/
│   └── favicon.ico                # Иконка сайта
│
└── src/
    ├── index.html                 # Главный HTML-файл
    ├── main.ts                    # Точка входа приложения
    ├── styles.scss                # Глобальные стили
    │
    └── app/
        ├── app.component.ts       # Корневой компонент
        ├── app.component.html     # Шаблон корневого компонента
        ├── app.component.spec.ts  # Тесты корневого компонента (3 теста)
        ├── app.config.ts          # Конфигурация приложения
        ├── app.routes.ts          # Маршрутизация
        │
        ├── models/
        │   └── article.model.ts   # Интерфейсы Article, Annotation, AnnotationCreate
        │
        ├── services/
        │   ├── article.service.ts       # Сервис управления статьями
        │   ├── article.service.spec.ts  # Тесты ArticleService (17 тестов)
        │   ├── annotation.service.ts    # Сервис управления аннотациями
        │   ├── annotation.service.spec.ts # Тесты AnnotationService (17 тестов)
        │   ├── theme.service.ts         # Сервис управления темами
        │   └── theme.service.spec.ts    # Тесты ThemeService
        │
        └── components/
            ├── article-list/
            │   ├── article-list.component.ts       # Компонент списка статей
            │   ├── article-list.component.html     # Шаблон
            │   ├── article-list.component.scss     # Стили
            │   └── article-list.component.spec.ts  # Тесты (10 тестов)
            │
            ├── article-editor/
            │   ├── article-editor.component.ts       # Компонент редактора
            │   ├── article-editor.component.html     # Шаблон
            │   ├── article-editor.component.scss     # Стили
            │   └── article-editor.component.spec.ts  # Тесты (21 тест)
            │
            └── theme-switcher/
                ├── theme-switcher.component.ts       # Компонент переключателя тем
                ├── theme-switcher.component.html     # Шаблон
                ├── theme-switcher.component.scss     # Стили
                └── theme-switcher.component.spec.ts  # Тесты
```

## 📂 Описание директорий

| Директория | Назначение |
|------------|------------|
| `src/app/models/` | TypeScript интерфейсы и типы данных |
| `src/app/services/` | Сервисы для работы с данными (state management, localStorage) |
| `src/app/components/` | Angular компоненты (standalone) |
| `public/` | Статические ресурсы |

## 🔧 Технологии

| Технология | Версия | Назначение |
|------------|--------|------------|
| Angular | 18.2.0 | Frontend фреймворк |
| TypeScript | 5.5.2 | Язык программирования |
| RxJS | 7.8.0 | Реактивность |
| SCSS | - | Стили |

## Архитектурные решения

- **Standalone Components**: использование автономных компонентов без NgModules
- **Reactive State Management**: управление состоянием через BehaviorSubject
- **Dependency Injection**: сервисы предоставляются через `providedIn: 'root'`
- **Range API**: для работы с выделением текста и позиционированием аннотаций
- **localStorage API**: для персистентного хранения данных

## Маршрутизация

| Путь | Компонент | Описание |
|------|-----------|----------|
| `/` | ArticleListComponent | Список статей |
| `/articles/new` | ArticleEditorComponent | Создание новой статьи |
| `/articles/:id` | ArticleEditorComponent | Просмотр статьи |
| `/articles/:id/edit` | ArticleEditorComponent | Редактирование статьи |

## ♿ Доступность (Accessibility)

Приложение разработано с учётом требований доступности:

- **Поддержка скринридеров** — ARIA-атрибуты (`aria-label`, `aria-live`, `aria-describedby`), live regions для динамических объявлений
- **Семантическая разметка** — использование `<main>`, `<article>`, `<nav>`, `<time>`, `<section>`
- **Клавиатурная навигация** — все интерактивные элементы доступны с клавиатуры (`tabindex`, обработка `keydown`)
- **Модальные окна** — правильный фокус, `aria-modal`, ловушка фокуса
- **Визуально скрытый текст** — класс `.visually-hidden` для информации скринридерам

## 🎯 БЭМ-методология

Для именования CSS-классов используется **БЭМ** (Блок—Элемент—Модификатор):

| Пример | Описание |
|--------|----------|
| `article-card` | Блок |
| `article-card__title` | Элемент |
| `button--primary` | Модификатор |
| `modal__color-option--selected` | Элемент с модификатором |

## 🔒 Хранение данных

Данные сохраняются в localStorage браузера:

- `text_annotation_articles` — массив статей
- `text_annotation_annotations` — массив аннотаций
- `text_annotation_theme` — выбранная тема

## 📝 Примечания

- Приложение не использует сторонние библиотеки для UI, аннотаций и всплывающих подсказок
- Все реализации выполнены средствами Angular, HTML, CSS и встроенных API браузера
- Подсветка аннотаций реализована через DOM манипуляции с использованием Range API
