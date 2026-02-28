<script lang="ts">
  import type { ApprovalRequest } from "$lib/stores/session.svelte";

  interface Props {
    approval: ApprovalRequest;
    onRespond: (
      id: string,
      requestId: string | undefined,
      approved: boolean,
    ) => void;
  }

  let { approval, onRespond }: Props = $props();
</script>

<div class="approval" class:resolved={approval.resolved}>
  <div class="header">
    <span class="icon glitch-effect">⚠</span>
    <span class="label">SYS_WARN: USER_APPROVAL_REQUIRED</span>
  </div>
  <div class="action">[TARGET_ACTION]: {approval.action}</div>
  {#if approval.reason}
    <div class="reason">>> REASON: {approval.reason}</div>
  {/if}
  {#if !approval.resolved}
    <div class="buttons">
      <button
        class="approve"
        onclick={() => onRespond(approval.id, approval.requestId, true)}
      >
        [Y] AUTHORIZE
      </button>
      <button
        class="deny"
        onclick={() => onRespond(approval.id, approval.requestId, false)}
      >
        [N] DENY
      </button>
    </div>
  {:else}
    <div class="resolved-text">ACTION_RESOLVED</div>
  {/if}
</div>

<style>
  .approval {
    margin: 8px 0;
    border: 1px solid var(--warning);
    border-radius: 2px;
    padding: 16px;
    background: rgba(255, 170, 0, 0.1);
    max-width: 85%;
    border-left: 4px solid var(--warning);
    box-shadow: inset 0 0 10px rgba(255, 170, 0, 0.1);
    font-family: var(--font-mono);
  }

  .approval:not(.resolved) {
    animation: warningBlink 3s infinite alternate;
  }

  @keyframes warningBlink {
    0% {
      box-shadow:
        inset 0 0 10px rgba(255, 170, 0, 0.1),
        0 0 5px rgba(255, 170, 0, 0.3);
    }
    100% {
      box-shadow:
        inset 0 0 20px rgba(255, 170, 0, 0.2),
        0 0 15px rgba(255, 170, 0, 0.5);
    }
  }

  .approval.resolved {
    opacity: 0.5;
    border-color: var(--border);
    animation: none;
    background: rgba(0, 0, 0, 0.2);
    box-shadow: none;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--warning);
    margin-bottom: 12px;
    font-weight: bold;
    letter-spacing: 1px;
    text-shadow: 0 0 5px rgba(255, 170, 0, 0.8);
  }

  .icon {
    font-size: 18px;
  }

  .glitch-effect {
    animation: flashIcon 0.5s step-end infinite alternate;
  }

  @keyframes flashIcon {
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .action {
    font-size: 14px;
    color: var(--fg);
    margin-bottom: 6px;
    font-weight: bold;
  }

  .reason {
    font-size: 12px;
    color: var(--fg-dim);
    margin-bottom: 16px;
    border-left: 2px dashed var(--fg-dim);
    padding-left: 8px;
  }

  .buttons {
    display: flex;
    gap: 12px;
  }

  .approve {
    border-color: var(--accent);
    color: var(--accent);
    text-shadow: var(--text-glow);
  }

  .approve:hover {
    background: rgba(0, 255, 65, 0.15);
  }

  .deny {
    border-color: var(--error);
    color: var(--error);
    text-shadow: 0 0 5px rgba(255, 42, 42, 0.8);
  }

  .deny:hover {
    background: rgba(255, 42, 42, 0.15);
  }

  .resolved-text {
    font-size: 13px;
    color: var(--warning);
    font-weight: bold;
    letter-spacing: 2px;
  }
</style>
