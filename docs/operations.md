# Эксплуатация и релизы

## Production build

```bash
npm ci
npm run test
npm run check
npm run build
```

Результат лежит в `build/` (статический сайт).

## Деплой-модель

Проект использует `@sveltejs/adapter-static` и `fallback: index.html`.

Практически это значит:

- можно размещать на любом static hosting;
- роутинг должен уметь fallback на `index.html` для SPA-навигации.

## Runtime-конфигурация

Сейчас endpoint WebSocket вводится пользователем в `PairingScreen`.
Дефолт: `ws://127.0.0.1:32123/ws`.

Если нужен другой дефолт:

- измените начальное значение `url` в `src/lib/components/PairingScreen.svelte`.

## Хранение чувствительных данных

Ключ `nullclaw_ui_auth_v1` в localStorage содержит:

- endpoint URL
- `access_token`
- `shared_key` (base64url)
- `expires_at`

Практики безопасности:

- очищать запись при logout и `unauthorized`;
- учитывать TTL;
- не использовать этот UI в недоверенных браузерных окружениях.

## Release checklist

1. Обновить документацию под фактическое поведение.
2. Прогнать `test` + `check`.
3. Проверить pairing, chat, approvals, logout вручную.
4. Собрать build.
5. Сверить, что в UI-диагностике отображаются корректные параметры соединения и E2E.

## Troubleshooting

### Pairing не стартует

- Проверьте корректность WebSocket URL.
- Убедитесь, что backend доступен из браузера (network/CORS/proxy).
- Проверьте формат PIN: ровно 6 цифр.

### Сообщения не отправляются

- Клиент не в состоянии `paired/chatting`.
- Сокет закрыт или backend отверг токен.
- Проверьте error bar внизу chat-экрана.

### Сессия не восстанавливается после reload

- Запись auth истекла (`expires_at`).
- Shared key в storage повреждён.
- Backend не принимает сохранённый токен (получаете `unauthorized`).

