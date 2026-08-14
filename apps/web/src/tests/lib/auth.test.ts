import { describe, expect, it } from 'vitest';
import {
  createSessionToken,
  hashPassword,
  isStrongPassword,
  isValidEmail,
  normalizeContactNo,
  normalizeEmail,
  suggestEmailTypoCorrection,
  verifyPassword,
} from '@/lib/auth';

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Rainer@Example.COM ')).toBe('rainer@example.com');
  });

  it('returns null for an empty or whitespace-only string', () => {
    expect(normalizeEmail('')).toBeNull();
    expect(normalizeEmail('   ')).toBeNull();
  });

  it('returns null for non-string values', () => {
    expect(normalizeEmail(null)).toBeNull();
    expect(normalizeEmail(undefined)).toBeNull();
    expect(normalizeEmail(42)).toBeNull();
    expect(normalizeEmail({})).toBeNull();
  });
});

describe('isValidEmail', () => {
  it('accepts an ordinary address', () => {
    expect(isValidEmail('rainer@example.com')).toBe(true);
    expect(isValidEmail('first.last+tag@sub.example.co.uk')).toBe(true);
  });

  it('rejects an address with no @', () => {
    expect(isValidEmail('rainerexample.com')).toBe(false);
  });

  it('rejects an address with no domain dot', () => {
    expect(isValidEmail('rainer@example')).toBe(false);
  });

  it('rejects an address with whitespace', () => {
    expect(isValidEmail('rainer @example.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

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

  it('rejects non-string values', () => {
    expect(isStrongPassword(null as unknown as string)).toBe(false);
    expect(isStrongPassword(12345678 as unknown as string)).toBe(false);
  });
});

describe('normalizeContactNo', () => {
  it('normalizes every accepted Philippine mobile format to +63 E.164', () => {
    expect(normalizeContactNo('9171234567')).toBe('+639171234567');
    expect(normalizeContactNo('09171234567')).toBe('+639171234567');
    expect(normalizeContactNo('639171234567')).toBe('+639171234567');
  });

  it('strips punctuation and spaces before matching', () => {
    expect(normalizeContactNo('+63 917 123 4567')).toBe('+639171234567');
    expect(normalizeContactNo('(0917) 123-4567')).toBe('+639171234567');
  });

  it('rejects a 10-digit number that does not start with 9', () => {
    expect(normalizeContactNo('8171234567')).toBeNull();
  });

  it('rejects numbers of the wrong length', () => {
    expect(normalizeContactNo('12345')).toBeNull();
    expect(normalizeContactNo('091712345678')).toBeNull();
  });

  it('returns null when there are no digits at all', () => {
    expect(normalizeContactNo('')).toBeNull();
    expect(normalizeContactNo('not a number')).toBeNull();
  });

  it('returns null for non-string values', () => {
    expect(normalizeContactNo(null)).toBeNull();
    expect(normalizeContactNo(9171234567)).toBeNull();
  });
});

describe('suggestEmailTypoCorrection', () => {
  it('suggests the intended domain for a near-miss typo', () => {
    expect(suggestEmailTypoCorrection('rainer@gmial.com')).toBe('rainer@gmail.com');
    expect(suggestEmailTypoCorrection('rainer@yaho.com')).toBe('rainer@yahoo.com');
  });

  it('returns null for a domain that is already correct', () => {
    expect(suggestEmailTypoCorrection('rainer@gmail.com')).toBeNull();
  });

  it('returns null for a known-safe domain that is not in the suggestion list', () => {
    // ymail.com is legitimate; it must not be "corrected" to gmail.com.
    expect(suggestEmailTypoCorrection('rainer@ymail.com')).toBeNull();
  });

  it('returns null for an unrelated domain', () => {
    expect(suggestEmailTypoCorrection('rainer@decktradr.com')).toBeNull();
    expect(suggestEmailTypoCorrection('student@dlsu.edu.ph')).toBeNull();
  });

  it('returns null when there is no @', () => {
    expect(suggestEmailTypoCorrection('rainer.gmial.com')).toBeNull();
  });

  it('preserves the local part exactly, including its casing', () => {
    expect(suggestEmailTypoCorrection('Rainer.G@gmial.com')).toBe('Rainer.G@gmail.com');
  });
});

describe('hashPassword / verifyPassword', () => {
  it('verifies a password against its own hash', () => {
    const stored = hashPassword('Passw0rd');
    expect(verifyPassword('Passw0rd', stored)).toBe(true);
  });

  it('produces a different hash each time so the salt is real', () => {
    expect(hashPassword('Passw0rd')).not.toBe(hashPassword('Passw0rd'));
  });

  it('emits the documented scrypt$iterations$salt$hash format', () => {
    const parts = hashPassword('Passw0rd').split('$');
    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe('scrypt');
  });

  it('rejects the wrong password', () => {
    const stored = hashPassword('Passw0rd');
    expect(verifyPassword('Passw0rD', stored)).toBe(false);
    expect(verifyPassword('', stored)).toBe(false);
  });

  it('rejects a stored value that is not in scrypt format', () => {
    expect(verifyPassword('Passw0rd', 'Passw0rd')).toBe(false);
    expect(verifyPassword('Passw0rd', 'bcrypt$310000$abcd$ef01')).toBe(false);
    expect(verifyPassword('Passw0rd', 'scrypt$310000$abcd')).toBe(false);
    expect(verifyPassword('Passw0rd', '')).toBe(false);
  });

  it('rejects a stored hash of the wrong byte length instead of throwing', () => {
    // timingSafeEqual throws on length mismatch, so the guard before it matters.
    expect(verifyPassword('Passw0rd', 'scrypt$310000$abcd$00ff')).toBe(false);
  });

  it('rejects non-string arguments', () => {
    const stored = hashPassword('Passw0rd');
    expect(verifyPassword(null as unknown as string, stored)).toBe(false);
    expect(verifyPassword('Passw0rd', null as unknown as string)).toBe(false);
  });
});

describe('createSessionToken', () => {
  it('returns a new token on every call', () => {
    expect(createSessionToken()).not.toBe(createSessionToken());
  });

  it('returns a url-safe token with no base64 padding or unsafe characters', () => {
    expect(createSessionToken()).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});
