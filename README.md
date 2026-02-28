# nullclaw-ui

Веб-интерфейс для `nullclaw` в стиле терминала. Клиент работает поверх WebSocket и протокола `WebChannel v1`, поддерживает PIN-pairing, потоковые ответы ассистента, tool-вызовы, запросы подтверждения и end-to-end шифрование.

## Что умеет интерфейс

- Подключение к агенту через `ws://...` endpoint и 6-значный pairing PIN.
- E2E-сессия: X25519 (обмен ключами) + ChaCha20-Poly1305 (шифрование сообщений).
- Потоковый чат (`assistant_chunk` -> `assistant_final`).
- Отображение `tool_call` / `tool_result`.
- Подтверждения действий (`approval_request` -> `approval_response`).
- Автовосстановление сессии из `localStorage` с TTL токена.
- Смена темы и визуальных эффектов с персистом настроек.

## Технологии

- `Svelte 5` (runes API)
- `SvelteKit 2`
- `Vite 7`
- `Vitest 4` + `@testing-library/svelte`
- `@noble/ciphers` для ChaCha20-Poly1305

Проект собирается как статический сайт (`adapter-static`, `fallback: index.html`, `ssr = false`).

## Быстрый старт

### 1) Требования

- `Node.js` 20+ (рекомендуется LTS)
- `npm` 10+

### 2) Установка

```bash
npm install
```

### 3) Запуск в dev-режиме

```bash
npm run dev
```

Откройте `http://localhost:5173`.

### 4) Подключение к агенту

1. Введите endpoint WebSocket (по умолчанию: `ws://127.0.0.1:32123/ws`).
2. Введите 6-значный pairing PIN.
3. После `pairing_result` интерфейс переключится в chat-режим.

## Скрипты

- `npm run dev` — локальная разработка.
- `npm run build` — production build.
- `npm run preview` — предпросмотр production-сборки.
- `npm run test` — запуск тестов Vitest.
- `npm run test:watch` — тесты в watch-режиме.
- `npm run check` — `svelte-kit sync` + `svelte-check`.
- `npm run check:watch` — `svelte-check` в watch-режиме.

## Архитектура (кратко)

- [`src/routes/+page.svelte`](src/routes/+page.svelte): composition root экрана.
- [`src/lib/session/connection-controller.svelte.ts`](src/lib/session/connection-controller.svelte.ts): оркестрация подключения, pairing, восстановления и logout.
- [`src/lib/protocol/client.svelte.ts`](src/lib/protocol/client.svelte.ts): WebSocket-клиент, валидация envelope, reconnect.
- [`src/lib/stores/session.svelte.ts`](src/lib/stores/session.svelte.ts): состояние timeline (messages/tool calls/approvals/errors).
- [`src/lib/protocol/e2e.ts`](src/lib/protocol/e2e.ts): криптография.
- [`src/lib/ui/preferences.ts`](src/lib/ui/preferences.ts) + [`src/lib/theme.ts`](src/lib/theme.ts): UI-предпочтения.

Детально:

- [Архитектура](docs/architecture.md)
- [Протокол и E2E](docs/protocol.md)
- [Разработка](docs/development.md)
- [Тестирование](docs/testing.md)
- [Эксплуатация и релизы](docs/operations.md)

## Хранение данных в браузере

`localStorage`:

- `nullclaw_ui_auth_v1` — URL endpoint, `access_token`, `shared_key`, `expires_at`.
- `nullclaw_ui_theme` — текущая тема интерфейса.
- `nullclaw_ui_effects` — флаг визуальных эффектов.

Токен и ключ автоматически очищаются при истечении TTL или ошибках невалидной сессии (`unauthorized`).

## Сборка и деплой

```bash
npm run build
```

Статический результат: `build/`. Можно деплоить в любой static hosting/CDN с fallback на `index.html`.

## Ограничения и нюансы

- Для X25519 нужен современный WebCrypto runtime в браузере.
- Endpoint вводится вручную в UI и не прокидывается через `.env`.
- UI не содержит server-side части и предполагает доступный WebSocket backend.

