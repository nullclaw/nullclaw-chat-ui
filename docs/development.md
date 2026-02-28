# Разработка

## Предпосылки

- `Node.js` 20+
- `npm` 10+

Проверка:

```bash
node -v
npm -v
```

## Локальный запуск

```bash
npm install
npm run dev
```

Dev server по умолчанию: `http://localhost:5173`.

## Сборка

```bash
npm run build
npm run preview
```

Build output: `build/`.

## Структура проекта

```text
src/
  routes/
    +layout.svelte
    +layout.ts
    +page.svelte
  lib/
    components/                  UI-компоненты
    protocol/                    WebChannel client + types + crypto
    session/                     orchestration + auth storage
    stores/                      session store
    ui/                          UI preferences
    theme.ts                     темы/эффекты
```

## Основные соглашения по коду

- Svelte 5 runes (`$state`, `$derived`, `$effect`) — избегать смешивания с устаревшими паттернами.
- Компоненты держать "тонкими": минимум бизнес-логики, максимум отображения.
- Transport-логика только в `protocol/*` и `connection-controller`.
- Любой `unknown` payload проверяется через type guards (`asObject`, `asString`, `asBoolean`).
- Внешние side effects (localStorage, document classes, WebSocket) держать изолированно.

## Добавление новой функциональности

1. Определите источник изменения:
   - новый protocol event
   - изменение UI
   - изменение session model
2. Добавьте тип/валидацию в `protocol`.
3. Добавьте обработчик в `session.store` или `connection-controller`.
4. Добавьте/обновите компонент.
5. Добавьте тесты в соответствующий слой.
6. Прогоните `npm run test` и `npm run check`.

## Локальная отладка

- Проверяйте `StatusBar` и диагностическое модальное окно для endpoint/state.
- Для проверки reconnect используйте закрытие сокета на backend.
- Для проверки persistence очистите/подмените localStorage через DevTools.

