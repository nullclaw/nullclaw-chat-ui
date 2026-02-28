<script lang="ts">
  import type { ToolCall } from "$lib/stores/session.svelte";

  interface Props {
    toolCall: ToolCall;
  }

  let { toolCall }: Props = $props();
</script>

<details class="tool-call">
  <summary>
    <span class="prompt-prefix">sys_exec@nullclaw:~$</span>
    <span class="name">{toolCall.name}</span>
    {#if toolCall.result}
      <span
        class="status"
        class:ok={toolCall.result.ok}
        class:fail={!toolCall.result.ok}
      >
        {toolCall.result.ok ? "[OK]" : "[FAIL]"}
      </span>
    {:else}
      <span class="status pending">[RUNNING...]</span>
    {/if}
  </summary>
  <div class="body">
    <div class="section">
      <span class="label">--arguments</span>
      <pre>{JSON.stringify(toolCall.arguments, null, 2)}</pre>
    </div>
    {#if toolCall.result}
      <div class="section">
        <span class="label">--result</span>
        {#if toolCall.result.error}
          <pre class="error-text">{toolCall.result.error}</pre>
        {:else}
          <pre>{JSON.stringify(toolCall.result.result, null, 2)}</pre>
        {/if}
      </div>
    {/if}
  </div>
</details>

<style>
  .tool-call {
    margin: 4px 0;
    border: 1px solid var(--border);
    border-radius: 2px;
    font-size: 13px;
    max-width: 90%;
    background: rgba(0, 0, 0, 0.3);
    border-left: 3px solid var(--border);
    transition:
      box-shadow 0.3s,
      border-color 0.3s;
  }

  .tool-call[open] {
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.1);
    border-color: var(--accent);
  }

  summary {
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--fg-dim);
    user-select: none;
    font-family: var(--font-mono);
  }

  summary:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--fg);
  }

  .prompt-prefix {
    color: var(--fg-dim);
    font-weight: bold;
    opacity: 0.7;
  }

  .name {
    color: var(--accent-dim);
    font-weight: bold;
    text-shadow: var(--text-glow);
  }

  .status {
    margin-left: auto;
    font-size: 11px;
    font-weight: bold;
    letter-spacing: 1px;
  }

  .ok {
    color: var(--accent);
    text-shadow: var(--text-glow);
  }
  .fail {
    color: var(--error);
    text-shadow: 0 0 5px rgba(255, 42, 42, 0.8);
  }
  .pending {
    color: var(--warning);
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }

  .body {
    padding: 12px 16px;
    border-top: 1px dashed var(--border);
    background: rgba(0, 0, 0, 0.5);
  }

  .section {
    margin-bottom: 12px;
  }

  .label {
    display: block;
    font-size: 11px;
    color: var(--accent-dim);
    margin-bottom: 6px;
    opacity: 0.8;
  }

  pre {
    background: transparent;
    padding: 0 0 0 8px;
    border-left: 2px solid var(--border);
    overflow-x: auto;
    font-size: 12px;
    margin: 0;
    color: var(--fg);
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .error-text {
    color: var(--error);
    border-left-color: var(--error);
  }
</style>
