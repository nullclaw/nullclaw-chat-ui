import { describe, it, expect } from 'vitest';
import { generateKeyPair, deriveSharedKey, encrypt, decrypt, exportPublicKey } from './e2e';

describe('E2E crypto', () => {
  it('generates X25519 keypair', async () => {
    const kp = await generateKeyPair();
    expect(kp.privateKey).toBeDefined();
    expect(kp.publicKey).toBeDefined();
  });

  it('exports public key as base64url', async () => {
    const kp = await generateKeyPair();
    const pub = await exportPublicKey(kp.publicKey);
    expect(pub).toMatch(/^[A-Za-z0-9_-]+$/); // base64url no padding
  });

  it('derives shared key and encrypts/decrypts roundtrip', async () => {
    const clientKp = await generateKeyPair();
    const serverKp = await generateKeyPair();

    const clientPub = await exportPublicKey(clientKp.publicKey);
    const serverPub = await exportPublicKey(serverKp.publicKey);

    const clientShared = await deriveSharedKey(clientKp.privateKey, serverPub);
    const serverShared = await deriveSharedKey(serverKp.privateKey, clientPub);

    // Both sides should derive the same key
    expect(new Uint8Array(clientShared)).toEqual(new Uint8Array(serverShared));

    const plaintext = '{"content":"hello","sender_id":"ui-1"}';
    const { nonce, ciphertext } = encrypt(clientShared, plaintext);

    expect(nonce).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(ciphertext).toMatch(/^[A-Za-z0-9_-]+$/);

    const decrypted = decrypt(serverShared, nonce, ciphertext);
    expect(decrypted).toBe(plaintext);
  });

  it('decrypt fails with wrong key', async () => {
    const kp1 = await generateKeyPair();
    const kp2 = await generateKeyPair();
    const kp3 = await generateKeyPair();

    const pub2 = await exportPublicKey(kp2.publicKey);
    const pub3 = await exportPublicKey(kp3.publicKey);

    const sharedCorrect = await deriveSharedKey(kp1.privateKey, pub2);
    const sharedWrong = await deriveSharedKey(kp1.privateKey, pub3);

    const { nonce, ciphertext } = encrypt(sharedCorrect, 'secret');
    expect(() => decrypt(sharedWrong, nonce, ciphertext)).toThrow();
  });
});
