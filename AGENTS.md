# AGENTS.md — NullClaw Chat UI Engineering Protocol

Default working protocol for coding agents in this repository. Scope: entire repository.

## 1) Project Snapshot

The chat surface for NullClaw: a SvelteKit app served two ways — as a web app
(vite dev/build) and as a dynamically-mounted UI module (`npm run build:module`
→ `module.js`, consumed by NullHub's module loader). TypeScript + Svelte 5.

Transport contract: WebSocket to the NullClaw gateway's `channels.web` endpoint
(default `ws://127.0.0.1:32123/ws`), end-to-end encryption (X25519 + ChaCha20),
PIN/token pairing. The protocol lives in `src/lib/protocol/` and the session
controller in `src/lib/session/` — treat these as the compatibility surface.

## 2) Engineering Principles

- The gateway wire protocol is a compatibility contract: changes must be
  backward-compatible or explicitly versioned, and tested against a running
  `nullclaw gateway`.
- No secrets in the repo or logs; pairing tokens are ephemeral client-side state.
- Deterministic tests: `npm test` (vitest) must pass; no network in unit tests.

## 3) Validation

```bash
npm install          # node 20+, npm 10+
npm test             # vitest — required before every commit
npm run check        # svelte-check — required before every commit
npm run build        # app build must succeed
npm run build:module # module.js must build (NullHub consumption)
```

## 4) Contribution flow

See [CONTRIBUTING.md](CONTRIBUTING.md).
