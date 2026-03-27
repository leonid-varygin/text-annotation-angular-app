# 📊 Модели данных

## Article

```typescript
interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}
```

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | `string` | Уникальный идентификатор статьи |
| `title` | `string` | Заголовок статьи |
| `content` | `string` | Содержимое статьи |
| `createdAt` | `number` | Timestamp создания |
| `updatedAt` | `number` | Timestamp последнего обновления |

## Annotation

```typescript
interface Annotation {
  id: string;
  articleId: string;
  startIndex: number;
  endIndex: number;
  selectedText: string;
  color: string;
  note: string;
  createdAt: number;
}
```

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | `string` | Уникальный идентификатор аннотации (префикс `ann-`) |
| `articleId` | `string` | ID статьи, к которой относится аннотация |
| `startIndex` | `number` | Начальная позиция выделения в тексте |
| `endIndex` | `number` | Конечная позиция выделения в тексте |
| `selectedText` | `string` | Выделенный текст |
| `color` | `string` | HEX-код цвета аннотации |
| `note` | `string` | Примечание к аннотации |
| `createdAt` | `number` | Timestamp создания |

## AnnotationCreate

```typescript
interface AnnotationCreate {
  articleId: string;
  startIndex: number;
  endIndex: number;
  selectedText: string;
  color: string;
  note: string;
}
```

Используется при создании новой аннотации (без `id` и `createdAt`).

## 🔒 Хранение данных

Данные сохраняются в localStorage браузера:

| Ключ | Тип данных | Описание |
|------|------------|----------|
| `text_annotation_articles` | `Article[]` | Массив всех статей |
| `text_annotation_annotations` | `Annotation[]` | Массив всех аннотаций |
| `text_annotation_theme` | `string` | Выбранная тема (`light` | `dark` | `auto`) |
