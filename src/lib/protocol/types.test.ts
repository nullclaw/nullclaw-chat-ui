import { describe, it, expect } from 'vitest';
import {
  makePairingRequest,
  makeUserMessage,
  makeApprovalResponse,
  PROTOCOL_VERSION,
} from './types';

describe('makePairingRequest', () => {
  it('creates envelope with code', () => {
    const msg = makePairingRequest('sess-1', '123456');
    expect(msg.v).toBe(PROTOCOL_VERSION);
    expect(msg.type).toBe('pairing_request');
    expect(msg.session_id).toBe('sess-1');
    expect((msg.payload as any).pairing_code).toBe('123456');
    expect((msg.payload as any).client_pub).toBeUndefined();
  });

  it('includes client_pub when provided', () => {
    const msg = makePairingRequest('sess-1', '123456', 'AAAA');
    expect((msg.payload as any).client_pub).toBe('AAAA');
  });
});

describe('makeUserMessage', () => {
  it('creates plaintext message', () => {
    const msg = makeUserMessage('sess-1', 'tok', 'hello');
    expect(msg.type).toBe('user_message');
    expect((msg.payload as any).content).toBe('hello');
    expect((msg.payload as any).access_token).toBe('tok');
    expect((msg.payload as any).e2e).toBeUndefined();
  });

  it('creates e2e message', () => {
    const e2e = { nonce: 'n', ciphertext: 'ct' };
    const msg = makeUserMessage('sess-1', 'tok', 'hello', e2e);
    expect((msg.payload as any).e2e).toEqual(e2e);
    expect((msg.payload as any).content).toBeUndefined();
  });
});

describe('makeApprovalResponse', () => {
  it('creates approval with request_id', () => {
    const msg = makeApprovalResponse('sess-1', 'tok', true, 'req-1');
    expect(msg.type).toBe('approval_response');
    expect(msg.request_id).toBe('req-1');
    expect((msg.payload as any).approved).toBe(true);
  });
});
