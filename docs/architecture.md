# Архитектура nullclaw-ui

## Цели архитектуры

- Предсказуемый поток данных от transport к UI.
- Изоляция сетевой/протокольной логики от визуальных компонентов.
- Возможность безопасно восстанавливать сессию после перезагрузки страницы.
- Минимум неявной магии: явные state-переходы и явная обработка ошибок.

## Слои

### 1) Presentation (`src/routes`, `src/lib/components`)

- `src/routes/+page.svelte` — корневой экран.
- Компоненты в `src/lib/components/*` отображают состояние и не знают о WebSocket-протоколе напрямую.
- Взаимодействие с бизнес-логикой происходит через callbacks (`onSend`, `onConnect`, `onApproval`, `onLogout`).

### 2) Application orchestration (`src/lib/session/connection-controller.svelte.ts`)

- Создаёт и жизненным циклом управляет `NullclawClient`.
- Реализует сценарии:
  - `connectWithPairing(url, code)`
  - `restoreSavedSession()`
  - `sendMessage(content)`
  - `sendApproval(id, requestId, approved)`
  - `logout()`
- Синхронизирует transport-события с session store.
- Сохраняет/восстанавливает auth + shared key через `auth-storage`.

### 3) Domain state (`src/lib/stores/session.svelte.ts`)

- Единый store таймлайна:
  - сообщения (`messages`)
  - tool-вызовы (`toolCalls`)
  - pending approvals (`approvals`)
  - локальная ошибка (`error`)
- Принимает transport события (`Envelope`) и нормализует их для UI.
- Инкапсулирует логику стриминга ассистента:
  - chunk append
  - finalization
  - досрочное завершение стрима при ошибке

### 4) Transport + protocol (`src/lib/protocol/*`)

- `client.svelte.ts`:
  - управление WebSocket;
  - парсинг/валидация envelope;
  - reconnect policy с backoff + jitter;
  - E2E encrypt/decrypt;
  - переходы `ClientState`.
- `types.ts`: типы протокола и конструкторы сообщений.
- `e2e.ts`: X25519 + derivation + ChaCha20-Poly1305.

### 5) Persistence + UI prefs (`src/lib/session/auth-storage.ts`, `src/lib/ui/preferences.ts`, `src/lib/theme.ts`)

- Auth-хранилище с TTL и валидацией структуры.
- Персист темы и визуальных эффектов.
- Применение настроек к `document.body` через CSS-классы.

## Поток данных

1. `+page.svelte` создаёт `connectionController`.
2. Controller слушает события `NullclawClient.onEvent`.
3. События пробрасываются в `session.handleEvent(event)`.
4. UI читает реактивные данные из `session` и рендерит timeline.
5. Пользовательские действия из UI идут обратно в controller (`sendMessage`, `sendApproval`, `connectWithPairing`).

## State machine клиента

`NullclawClient.state`:

- `disconnected`
- `connecting`
- `pairing`
- `paired`
- `chatting`

Основные переходы:

- `connect()` -> `connecting`
- `onopen`:
  - если есть `accessToken`: `paired`
  - иначе: `pairing`
- успешный `pairing_result`: `paired`
- `sendMessage()` при успешной отправке: `chatting`
- `disconnect()`/close: `disconnected` (с возможным reconnect, если была авторизованная сессия)

## Ключевые инварианты

- UI-компоненты не должны напрямую создавать WebSocket.
- Только controller пишет в auth-storage.
- `session.store` не делает сетевых вызовов.
- Любая ошибка `error` во время стрима должна завершать `streamingMessageId`, чтобы UI не «зависал» в streaming-состоянии.
- При `unauthorized` обязательно очищаются локальные auth данные.

## Где расширять функциональность

- Новый transport event:
  1. Добавить тип в `types.ts`.
  2. Разрешить event в `EVENT_TYPES` (`client.svelte.ts`).
  3. Обработать в `session.handleEvent()`.
  4. Добавить/обновить UI-компонент.
  5. Добавить тесты для transport/store/component.

- Новый UI-параметр:
  1. Добавить ключ в `theme.ts` или отдельный preferences-модуль.
  2. Подключить загрузку/сохранение в `preferences.ts`.
  3. Пробросить через `+page.svelte` в нужный компонент.

