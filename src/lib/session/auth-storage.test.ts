import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  AUTH_STORAGE_KEY,
  clearStoredAuth,
  loadStoredAuth,
  parseStoredSharedKey,
  saveStoredAuth,
} from './auth-storage';

class MockStorage implements Storage {
  private map = new Map<string, string>();

  get length() {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

describe('auth-storage', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = new MockStorage();
    vi.stubGlobal('localStorage', storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('saves and loads valid auth payload', () => {
    const sharedKey = new Uint8Array(32).fill(7);
    saveStoredAuth('ws://127.0.0.1:32123/ws', 'access-token', sharedKey, 3600);

    const restored = loadStoredAuth();
    expect(restored).not.toBeNull();
    expect(restored?.url).toBe('ws://127.0.0.1:32123/ws');
    expect(restored?.access_token).toBe('access-token');
    expect(parseStoredSharedKey(restored?.shared_key ?? '')).toEqual(sharedKey);
  });

  it('clears malformed stored auth payload', () => {
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ bad: true }));

    const restored = loadStoredAuth();
    expect(restored).toBeNull();
    expect(storage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('clears expired token', () => {
    storage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        url: 'ws://127.0.0.1:32123/ws',
        access_token: 'expired-token',
        shared_key: 'x',
        expires_at: Date.now() - 1000,
      }),
    );

    const restored = loadStoredAuth();
    expect(restored).toBeNull();
    expect(storage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('clearStoredAuth removes persisted auth', () => {
    storage.setItem(AUTH_STORAGE_KEY, '{}');
    clearStoredAuth();
    expect(storage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('returns null for invalid shared key', () => {
    expect(parseStoredSharedKey('not-base64')).toBeNull();
    expect(parseStoredSharedKey('')).toBeNull();
  });
});
