import { describe, expect, it } from 'vitest';
import { redactWebSocketAuthToken, withWebSocketAuthToken } from './ws-url';

describe('withWebSocketAuthToken', () => {
  it('appends token query parameter when missing', () => {
    const result = withWebSocketAuthToken(
      'ws://100.69.118.73:32123/ws',
      'gateway-token',
    );

    expect(result).toBe('ws://100.69.118.73:32123/ws?token=gateway-token');
  });

  it('preserves existing token query parameter', () => {
    const result = withWebSocketAuthToken(
      'ws://100.69.118.73:32123/ws?token=already-set',
      'gateway-token',
    );

    expect(result).toBe('ws://100.69.118.73:32123/ws?token=already-set');
  });

  it('does not modify url when token is empty', () => {
    const result = withWebSocketAuthToken('ws://localhost:32123/ws', '   ');
    expect(result).toBe('ws://localhost:32123/ws');
  });
});

describe('redactWebSocketAuthToken', () => {
  it('redacts token query parameter for diagnostics output', () => {
    const result = redactWebSocketAuthToken(
      'wss://host.example/ws?token=super-secret&foo=bar',
    );

    expect(result).toBe('wss://host.example/ws?token=***&foo=bar');
  });

  it('returns the original value when token is absent', () => {
    const result = redactWebSocketAuthToken('wss://host.example/ws?foo=bar');
    expect(result).toBe('wss://host.example/ws?foo=bar');
  });
});
