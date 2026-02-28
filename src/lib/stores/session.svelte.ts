import type { Envelope } from '$lib/protocol/types';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  streaming?: boolean; // true while receiving chunks
  type?: string; // original event type
}

export interface ToolCall {
  id: string;
  requestId?: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: { ok: boolean; result?: unknown; error?: string };
  timestamp: number;
}

export interface ApprovalRequest {
  id: string;
  requestId?: string;
  action: string;
  reason?: string;
  resolved?: boolean;
  timestamp: number;
}

let messageIdCounter = 0;
function nextId(): string {
  return `msg-${++messageIdCounter}-${Date.now()}`;
}

export function createSessionStore() {
  let messages = $state<ChatMessage[]>([]);
  let toolCalls = $state<ToolCall[]>([]);
  let approvals = $state<ApprovalRequest[]>([]);
  let streamingMessageId = $state<string | null>(null);
  let error = $state<string | null>(null);

  function addUserMessage(content: string) {
    messages.push({
      id: nextId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    });
  }

  function handleEvent(event: Envelope) {
    const payload = event.payload as any;
    error = null;

    switch (event.type) {
      case 'assistant_chunk': {
        const content = payload?.content ?? '';
        if (streamingMessageId) {
          const msg = messages.find((m) => m.id === streamingMessageId);
          if (msg) msg.content += content;
        } else {
          const id = nextId();
          messages.push({
            id,
            role: 'assistant',
            content,
            timestamp: Date.now(),
            streaming: true,
          });
          streamingMessageId = id;
        }
        break;
      }

      case 'assistant_final': {
        const content = payload?.content ?? event.content ?? '';
        if (streamingMessageId) {
          const msg = messages.find((m) => m.id === streamingMessageId);
          if (msg) {
            msg.content = content;
            msg.streaming = false;
          }
          streamingMessageId = null;
        } else {
          messages.push({
            id: nextId(),
            role: 'assistant',
            content,
            timestamp: Date.now(),
          });
        }
        break;
      }

      case 'tool_call': {
        toolCalls.push({
          id: nextId(),
          requestId: event.request_id,
          name: payload.name,
          arguments: payload.arguments,
          timestamp: Date.now(),
        });
        break;
      }

      case 'tool_result': {
        const tc = toolCalls.findLast(
          (t) => t.requestId === event.request_id && !t.result,
        );
        if (tc) {
          tc.result = {
            ok: payload.ok,
            result: payload.result,
            error: payload.error,
          };
        }
        break;
      }

      case 'approval_request': {
        approvals.push({
          id: nextId(),
          requestId: event.request_id,
          action: payload.action,
          reason: payload.reason,
          timestamp: Date.now(),
        });
        break;
      }

      case 'error': {
        error = payload?.message ?? 'Unknown error';
        break;
      }
    }
  }

  function clear() {
    messages = [];
    toolCalls = [];
    approvals = [];
    streamingMessageId = null;
    error = null;
  }

  function resolveApproval(id: string) {
    const a = approvals.find((x) => x.id === id);
    if (a) a.resolved = true;
  }

  return {
    get messages() {
      return messages;
    },
    get toolCalls() {
      return toolCalls;
    },
    get approvals() {
      return approvals;
    },
    get error() {
      return error;
    },
    get isStreaming() {
      return streamingMessageId !== null;
    },
    addUserMessage,
    handleEvent,
    clear,
    resolveApproval,
  };
}
