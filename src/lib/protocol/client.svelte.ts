import {
  type Envelope,
  type E2EPayload,
  type PairingResultPayload,
  type ErrorPayload,
  makePairingRequest,
  makeUserMessage,
  makeApprovalResponse,
} from './types';
import { encrypt, decrypt } from './e2e';

export type ClientState = 'disconnected' | 'connecting' | 'pairing' | 'paired' | 'chatting';

export class NullclawClient {
  state: ClientState = $state('disconnected');
  accessToken: string | null = $state(null);
  onEvent: ((event: Envelope) => void) | null = null;

  private ws: WebSocket | null = null;
  private url: string;
  private sessionId: string;
  private e2eState: { sharedKey: Uint8Array } | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = true;

  constructor(url: string, sessionId: string) {
    this.url = url;
    this.sessionId = sessionId;
  }

  connect() {
    this.shouldReconnect = true;
    this.state = 'connecting';
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.state = 'pairing';
      this.reconnectAttempt = 0;
    };

    this.ws.onmessage = (event: MessageEvent) => {
      this.handleMessage(event.data as string);
    };

    this.ws.onclose = (event: CloseEvent) => {
      const wasConnected = this.state !== 'disconnected' && this.state !== 'connecting';
      this.ws = null;
      this.state = 'disconnected';
      if (this.shouldReconnect && wasConnected && this.accessToken) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
    this.state = 'disconnected';
    this.accessToken = null;
    this.e2eState = null;
  }

  sendPairingRequest(code: string, clientPub?: string) {
    const msg = makePairingRequest(this.sessionId, code, clientPub);
    this.send(msg);
  }

  sendMessage(content: string) {
    if (!this.accessToken) return;

    let e2e: E2EPayload | undefined;
    if (this.e2eState) {
      const plainObj = JSON.stringify({ content, sender_id: 'ui-1' });
      e2e = encrypt(this.e2eState.sharedKey, plainObj);
    }

    const msg = makeUserMessage(this.sessionId, this.accessToken, content, e2e);
    this.send(msg);
    this.state = 'chatting';
  }

  sendApproval(approved: boolean, requestId?: string, reason?: string) {
    if (!this.accessToken) return;
    const msg = makeApprovalResponse(this.sessionId, this.accessToken, approved, requestId, reason);
    this.send(msg);
  }

  setE2EKey(sharedKey: Uint8Array) {
    this.e2eState = { sharedKey };
  }

  private send(msg: Envelope) {
    if (this.ws?.readyState === 1) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private handleMessage(raw: string) {
    let msg: Envelope;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    if (msg.type === 'pairing_result') {
      const payload = msg.payload as PairingResultPayload;
      this.accessToken = payload.access_token;
      this.state = 'paired';
    }

    if (msg.type === 'error') {
      const payload = msg.payload as ErrorPayload;
      if (payload.code === 'unauthorized') {
        this.accessToken = null;
        this.state = 'pairing';
      }
    }

    // Decrypt E2E if present
    if (msg.payload && 'e2e' in msg.payload && this.e2eState) {
      const e2e = msg.payload.e2e as E2EPayload;
      try {
        const decrypted = decrypt(this.e2eState.sharedKey, e2e.nonce, e2e.ciphertext);
        const parsed = JSON.parse(decrypted);
        (msg.payload as any).content = parsed.content;
      } catch {
        // Decryption failed, pass event as-is
      }
    }

    this.onEvent?.(msg);
  }

  private scheduleReconnect() {
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt, 30000);
    const jitter = delay * (0.5 + Math.random() * 0.5);
    this.reconnectAttempt++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, jitter);
  }
}
