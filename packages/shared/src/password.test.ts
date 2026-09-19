import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from './password';

describe('Shared Password Module', () => {
  it('hashes password and verifies successfully with correct password', async () => {
    const raw = 'MeadowMistSecure2026!';
    const hash = await hashPassword(raw);

    expect(hash).not.toBe(raw);
    expect(hash).toMatch(/^\$2[aby]\$/);

    const isMatch = await comparePassword(raw, hash);
    expect(isMatch).toBe(true);
  });

  it('rejects incorrect password comparison', async () => {
    const hash = await hashPassword('correctPassword');
    const isMatch = await comparePassword('wrongPassword', hash);
    expect(isMatch).toBe(false);
  });

  it('is case-sensitive', async () => {
    const hash = await hashPassword('SecretKey');
    expect(await comparePassword('secretkey', hash)).toBe(false);
    expect(await comparePassword('Secretkey', hash)).toBe(false);
    expect(await comparePassword('SecretKey', hash)).toBe(true);
  });

  it('handles special characters and unicode in passwords', async () => {
    const special = '🌿Meadow#123!@$^*()_+{}|:"<>?~`';
    const hash = await hashPassword(special);
    expect(await comparePassword(special, hash)).toBe(true);
    expect(await comparePassword('🌿Meadow#123', hash)).toBe(false);
  });
});
