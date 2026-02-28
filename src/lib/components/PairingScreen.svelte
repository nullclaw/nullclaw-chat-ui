<script lang="ts">
  interface Props {
    connecting?: boolean;
    error?: string | null;
    onConnect: (url: string, code: string) => void;
  }

  let { connecting = false, error = null, onConnect }: Props = $props();

  let url = $state("ws://127.0.0.1:32123/ws");
  let code = $state("");

  function handleSubmit(e: Event) {
    e.preventDefault();
    const trimmed = code.replace(/\s/g, "");
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) return;
    onConnect(url, trimmed);
  }

  function handleCodeInput(e: Event) {
    const input = e.target as HTMLInputElement;
    code = input.value.replace(/\D/g, "").slice(0, 6);
  }
</script>

<div class="pairing-screen">
  <div class="card">
    <div class="glitch-wrapper">
      <h1 class="title glitch text-glow" data-text="nullclaw">nullclaw</h1>
    </div>
    <p class="subtitle">> SECURE_WEBCHANNEL_PAIRING_ROUTINE</p>

    <form onsubmit={handleSubmit}>
      <label class="field">
        <span class="label">root@endpoint:~$</span>
        <input
          type="text"
          bind:value={url}
          placeholder="ws://127.0.0.1:32123/ws"
          disabled={connecting}
        />
      </label>

      <label class="field auth-field">
        <span class="label">enter_auth_pin:</span>
        <input
          type="text"
          value={code}
          oninput={handleCodeInput}
          placeholder="______"
          maxlength="6"
          inputmode="numeric"
          autocomplete="off"
          disabled={connecting}
          class="code-input text-glow"
        />
      </label>

      <div class="encryption-notice">
        [ SYSTEM: END-TO-END ENCRYPTION (X25519 + CHACHA20) ACTIVE ]
      </div>

      {#if error}
        <div class="error">[!] ERROR: {error}</div>
      {/if}

      <button type="submit" disabled={connecting || code.length !== 6}>
        {connecting ? "INITIALIZING..." : "CONNECT"}
      </button>
    </form>
  </div>
</div>

<style>
  .pairing-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
  }

  .card {
    width: 100%;
    max-width: 440px;
    padding: 40px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--bg-surface);
    box-shadow:
      0 0 20px rgba(0, 0, 0, 0.5),
      inset 0 0 20px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
  }

  /* Scanline inside the card */
  .card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(transparent 50%, rgba(0, 0, 0, 0.25) 50%);
    background-size: 100% 4px;
    pointer-events: none;
    z-index: -1;
  }

  .glitch-wrapper {
    text-align: center;
    margin-bottom: 8px;
  }

  .title {
    font-size: 36px;
    color: var(--accent);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 4px;
    position: relative;
    display: inline-block;
  }

  .title.glitch::before,
  .title.glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--bg-surface);
  }

  .title.glitch::before {
    left: 2px;
    text-shadow: -2px 0 var(--error);
    clip: rect(24px, 550px, 90px, 0);
    animation: glitch 3s infinite linear alternate-reverse;
  }

  .title.glitch::after {
    left: -2px;
    text-shadow: -2px 0 var(--accent-dim);
    clip: rect(85px, 550px, 140px, 0);
    animation: glitch 2.5s infinite linear alternate-reverse;
  }

  .text-glow {
    text-shadow: var(--text-glow);
  }

  .subtitle {
    color: var(--fg-dim);
    font-size: 13px;
    text-align: center;
    margin-bottom: 32px;
    font-family: var(--font-mono);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .auth-field {
    margin-top: 8px;
  }

  .label {
    font-size: 12px;
    color: var(--fg-dim);
    font-weight: bold;
  }

  input {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--border);
    transition: all 0.2s;
  }

  input:focus {
    background: rgba(0, 0, 0, 0.6);
  }

  .code-input {
    font-size: 28px;
    letter-spacing: 12px;
    text-align: center;
    padding: 16px;
    font-weight: 700;
    color: var(--accent);
  }

  .code-input::placeholder {
    color: var(--border);
    opacity: 0.5;
  }

  .encryption-notice {
    font-size: 10px;
    color: var(--accent-dim);
    text-align: center;
    margin-top: 8px;
    opacity: 0.7;
    letter-spacing: 0.5px;
  }

  .error {
    color: var(--error);
    font-size: 13px;
    padding: 12px;
    border: 1px solid var(--error);
    border-radius: 4px;
    background: rgba(255, 68, 68, 0.1);
    text-shadow: 0 0 5px rgba(255, 68, 68, 0.5);
    font-weight: bold;
    text-align: center;
  }

  button[type="submit"] {
    padding: 16px;
    font-size: 16px;
    margin-top: 16px;
    position: relative;
    overflow: hidden;
  }

  button[type="submit"]::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.5s ease-in-out;
  }

  button[type="submit"]:hover:not(:disabled)::before {
    left: 100%;
  }

  button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>
