# Протокол и E2E

Документ описывает фактическое поведение UI-клиента на стороне фронтенда.

## Envelope

Все сообщения идут в формате:

```json
{
  "v": 1,
  "type": "event_name",
  "session_id": "string",
  "agent_id": "optional",
  "request_id": "optional",
  "payload": {}
}
```

Валидация выполняется в `src/lib/protocol/client.svelte.ts`:

- `v` должен быть `1`
- `type` должен входить в whitelist
- `session_id` должен быть непустой строкой

Невалидные сообщения игнорируются.

## Поддерживаемые события

### UI -> Core

- `pairing_request`
- `user_message`
- `approval_response`

### Core -> UI

- `pairing_result`
- `assistant_chunk`
- `assistant_final`
- `tool_call`
- `tool_result`
- `approval_request`
- `error`

## Pairing flow

1. UI открывает WebSocket endpoint.
2. После перехода клиента в `pairing` отправляется `pairing_request`:
   - `pairing_code` (6 цифр)
   - `client_pub` (X25519 public key, base64url)
3. Core отвечает `pairing_result`:
   - `access_token`
   - опционально `expires_in`
   - `e2e.agent_pub` (X25519 public key)
4. UI вычисляет shared key и включает E2E-режим.
5. Auth + shared key сохраняются в localStorage.

## E2E криптография

Реализация: `src/lib/protocol/e2e.ts`.

- Key exchange: `X25519` через WebCrypto.
- KDF: `SHA-256("webchannel-e2e-v1" || shared_secret)`.
- Symmetric encryption: `ChaCha20-Poly1305`.
- Nonce: 12 байт, генерируется случайно.
- Формат поля `e2e`:

```json
{
  "nonce": "base64url",
  "ciphertext": "base64url"
}
```

### Шифрование исходящих сообщений

`sendMessage(content)`:

- при наличии `e2eState` plaintext оборачивается в JSON (`content`, `sender_id`)
- затем шифруется и отправляется в `payload.e2e`
- в plaintext mode (без e2e) отправляется `payload.content`

### Расшифровка входящих сообщений

`assistant_*` события с `payload.e2e` расшифровываются на клиенте.
Если расшифровка неуспешна, событие не ломает клиент: UI продолжает работу с исходным payload.

## Ошибки и отказоустойчивость

### Error payload

Для `type = "error"` ожидается:

```json
{
  "message": "string",
  "code": "optional string"
}
```

Если payload malformed, клиент эмитит локальную client-error ошибку.

### Unauthorized

При `payload.code === "unauthorized"`:

- client очищает локальный session auth (`accessToken`, e2e key)
- controller очищает persisted auth
- session store очищается

### Reconnect policy

Reconnect включается только если:

- соединение закрыто неожиданно;
- сессия уже была `paired/chatting`;
- есть `accessToken`;
- `shouldReconnect = true`.

Backoff:

- базовая задержка: 1000ms
- экспоненциальный рост до 30s
- jitter 50-100% от текущего шага

## Корреляция запросов

`request_id` используется для сопоставления:

- `tool_call` <-> `tool_result`
- `approval_request` <-> `approval_response`

Store умеет fallback-сопоставление для `tool_result` без `request_id`: результат прикрепляется к последнему незавершённому tool-вызову.

