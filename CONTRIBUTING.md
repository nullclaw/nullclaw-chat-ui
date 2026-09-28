# Contributing to NullClaw Chat UI

1. **Read [AGENTS.md](AGENTS.md)** first — the gateway wire protocol is a
   compatibility contract and the validation gates live there.
2. One concern per PR. No drive-by refactors.
3. Before every commit: `npm test`, `npm run check`, `npm run build`,
   `npm run build:module` — all must pass.
4. Every PR runs CI. Keep it green.
5. Bug fixes must include a regression test citing the issue number.
