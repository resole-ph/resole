import { describe, expect, it } from 'vitest';
import { PASSWORD_REQUIREMENT_MESSAGE, isStrongPassword } from '@/features/auth/validation';

/**
 * This check mirrors `isStrongPassword` in apps/web/src/lib/auth.ts so the client
 * rejects exactly what the server would. The cases here are the same ones
 * asserted in apps/web/src/tests/lib/auth.test.ts — if the two rules drift, the
 * app either accepts a password the API refuses or blocks a valid one.
 */
describe('isStrongPassword', () => {
  it('accepts a password that meets every rule at the minimum length', () => {
    expect(isStrongPassword('Passw0rd')).toBe(true);
  });

  it('rejects a password one character short of the minimum', () => {
    expect(isStrongPassword('Pasw0rd')).toBe(false);
  });

  it('rejects a password with no lowercase letter', () => {
    expect(isStrongPassword('PASSW0RD')).toBe(false);
  });

  it('rejects a password with no uppercase letter', () => {
    expect(isStrongPassword('passw0rd')).toBe(false);
  });

  it('rejects a password with no digit', () => {
    expect(isStrongPassword('Password')).toBe(false);
  });

  it('rejects an empty password', () => {
    expect(isStrongPassword('')).toBe(false);
  });

  it('rejects non-string values', () => {
    expect(isStrongPassword(null as unknown as string)).toBe(false);
    expect(isStrongPassword(12345678 as unknown as string)).toBe(false);
  });
});

describe('PASSWORD_REQUIREMENT_MESSAGE', () => {
  it('states every rule the check enforces', () => {
    expect(PASSWORD_REQUIREMENT_MESSAGE).toContain('8 characters');
    expect(PASSWORD_REQUIREMENT_MESSAGE).toContain('uppercase');
    expect(PASSWORD_REQUIREMENT_MESSAGE).toContain('lowercase');
    expect(PASSWORD_REQUIREMENT_MESSAGE).toContain('number');
  });
});
