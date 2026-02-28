# Тестирование

Проект использует `Vitest` (environment `jsdom`) и `@testing-library/svelte`.

## Команды

```bash
npm run test
npm run test:watch
npm run check
```

## Что покрыто сейчас

### Protocol layer

- `src/lib/protocol/types.test.ts`:
  - корректность envelope builders.
- `src/lib/protocol/e2e.test.ts`:
  - генерация ключей;
  - derivation;
  - encrypt/decrypt roundtrip;
  - ошибочный decrypt на неправильном ключе.
- `src/lib/protocol/client.test.ts`:
  - connect/pairing/send;
  - обработка `pairing_result`, `assistant_final`;
  - decrypt `assistant_chunk`;
  - reconnect/backoff;
  - защита от duplicate connect и отправки при закрытом сокете.

### Session/persistence layer

- `src/lib/stores/session.test.ts`:
  - стриминг chunk/final;
  - legacy fallback;
  - tool/approval корреляция;
  - обработка ошибок.
- `src/lib/session/auth-storage.test.ts`:
  - save/load/clear;
  - очистка malformed и expired данных.
- `src/lib/session/connection-controller.test.ts`:
  - восстановление сессии;
  - локальные ошибки отправки.

### UI layer

- `src/lib/components/PairingScreen.test.ts`:
  - нормализация PIN;
  - submit-валидация.
- `src/lib/components/StatusBar.test.ts`:
  - отображение endpoint/session;
  - theme/effects/logout действия.
- `src/lib/theme.test.ts`, `src/lib/ui/preferences.test.ts`:
  - темы, классы body, preferences persistence.

## Принципы написания тестов

- Один тест — одна поведенческая гарантия.
- Не тестировать private implementation details, тестировать observable behavior.
- Для transport использовать mock WebSocket.
- Для localStorage использовать in-memory mock Storage.
- Для UI — user-level действия через Testing Library (`fireEvent`, `user-event`).

## Рекомендуемые расширения покрытия

- Компонентные тесты для:
  - `ChatScreen`
  - `MessageBubble`
  - `ToolCallBlock`
  - `ApprovalPrompt`
- Интеграционные smoke-тесты полного флоу pairing -> chatting.
- E2E браузерные тесты (например Playwright) поверх mock backend.

## Минимальный чек перед merge

1. `npm run test`
2. `npm run check`
3. Ручной smoke:
   - pairing c валидным PIN
   - отправка сообщения
   - обработка `error`
   - logout и повторное подключение

