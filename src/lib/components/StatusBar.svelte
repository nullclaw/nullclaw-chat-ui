<script lang="ts">
  import type { ClientState } from "$lib/protocol/client.svelte";

  interface Props {
    state: ClientState;
    sessionId: string;
  }

  let { state, sessionId }: Props = $props();

  const statusClass = $derived(
    state === "chatting" || state === "paired"
      ? "status-ok"
      : state === "connecting" || state === "pairing"
        ? "status-warn"
        : "status-err",
  );

  const statusText = $derived(
    state === "disconnected"
      ? "OFFLINE"
      : state === "connecting"
        ? "CONNECTING..."
        : state === "pairing"
          ? "PAIRING..."
          : state === "paired"
            ? "LINK_ESTABLISHED"
            : "ACTIVE",
  );
</script>

<header class="status-bar">
  <div class="left">
    <div class="segment status-segment {statusClass}">
      <span class="status-text">{statusText}</span>
    </div>
    <div class="segment breadcrumb">
      <span>sys@nullclaw</span>
    </div>
  </div>
  <div class="center">
    <span class="session-id">[ SESSION: {sessionId} ]</span>
  </div>
  <div class="right">
    <div class="segment e2e-badge" title="End-to-end encrypted">
      <span class="icon">🔒</span> E2E_SECURE
    </div>
  </div>
</header>

<style>
  .status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-surface);
    border-bottom: 2px solid var(--border);
    font-size: 12px;
    font-family: var(--font-mono);
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    z-index: 100;
  }

  .left,
  .right {
    display: flex;
    align-items: stretch;
    height: 100%;
  }

  .segment {
    padding: 6px 16px;
    display: flex;
    align-items: center;
    border-right: 1px solid var(--border);
  }

  .right .segment {
    border-left: 1px solid var(--border);
    border-right: none;
  }

  .status-segment {
    color: var(--bg);
    text-shadow: none;
    letter-spacing: 1px;
  }

  .status-ok {
    background: var(--accent);
  }
  .status-warn {
    background: var(--warning);
  }
  .status-err {
    background: var(--error);
  }

  .breadcrumb {
    color: var(--accent-dim);
    background: rgba(0, 255, 65, 0.05);
  }

  .center {
    flex: 1;
    text-align: center;
    color: var(--fg-dim);
    letter-spacing: 2px;
    opacity: 0.7;
  }

  .session-id {
    font-size: 11px;
  }

  .e2e-badge {
    color: var(--accent);
    background: rgba(0, 255, 65, 0.1);
    letter-spacing: 1px;
    gap: 6px;
  }

  .icon {
    font-size: 10px;
  }
</style>
