# 🌐 Деплой на GitHub Pages

Приложение настроено для развертывания на GitHub Pages с использованием `angular-cli-ghpages`.

## Автоматический деплой

```bash
ng deploy --base-href=/text-annotation-app/
```

Замените `text-annotation-app` на название вашего репозитория.

## Результат

После успешного деплоя приложение будет доступно по адресу:
```
https://<username>.github.io/text-annotation-app/
```

## Настройка репозитория

1. Откройте настройки репозитория на GitHub
2. Перейдите в **Settings** → **Pages**
3. Убедитесь, что Source установлен на `gh-pages` branch

## Примечание о маршрутизации

Приложение использует `HashLocationStrategy` для корректной работы маршрутизации на GitHub Pages. URL будут иметь вид:
```
https://<username>.github.io/text-annotation-app/#/articles/123
