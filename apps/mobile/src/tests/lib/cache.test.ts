import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCached, invalidateCache, setCached } from '@/lib/cache';

/**
 * The cache is module-level state shared by every `apiFetch` call, so each test
 * starts from empty. Time is faked so TTL expiry is exercised deterministically
 * rather than by sleeping.
 */
beforeEach(() => {
  invalidateCache();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  invalidateCache();
});

describe('getCached / setCached', () => {
  it('returns undefined for a key that was never set', () => {
    expect(getCached('GET:/api/listings')).toBeUndefined();
  });

  it('returns the stored value before the TTL elapses', () => {
    setCached('GET:/api/listings', { items: [1, 2] }, 30_000);
    vi.advanceTimersByTime(29_999);
    expect(getCached('GET:/api/listings')).toEqual({ items: [1, 2] });
  });

  it('returns undefined once the TTL has elapsed', () => {
    setCached('GET:/api/listings', { items: [1, 2] }, 30_000);
    vi.advanceTimersByTime(30_001);
    expect(getCached('GET:/api/listings')).toBeUndefined();
  });

  it('drops the expired entry rather than leaving it to accumulate', () => {
    setCached('GET:/api/listings', 'stale', 1_000);
    vi.advanceTimersByTime(2_000);
    getCached('GET:/api/listings');

    // A second read must still miss — proof the first read deleted it rather
    // than merely hiding it.
    vi.setSystemTime(0);
    expect(getCached('GET:/api/listings')).toBeUndefined();
  });

  it('overwrites an existing key and restarts its TTL', () => {
    setCached('GET:/api/listings', 'first', 10_000);
    vi.advanceTimersByTime(9_000);
    setCached('GET:/api/listings', 'second', 10_000);
    vi.advanceTimersByTime(5_000);

    expect(getCached('GET:/api/listings')).toBe('second');
  });

  it('keeps keys independent of one another', () => {
    setCached('GET:/api/listings', 'listings', 30_000);
    setCached('GET:/api/notifications', 'notifications', 30_000);

    expect(getCached('GET:/api/listings')).toBe('listings');
    expect(getCached('GET:/api/notifications')).toBe('notifications');
  });

  it('round trips a falsy value without treating it as a miss', () => {
    setCached('GET:/api/wallet', 0, 30_000);
    expect(getCached('GET:/api/wallet')).toBe(0);
  });
});

describe('invalidateCache', () => {
  it('clears everything when given no prefix', () => {
    setCached('GET:/api/listings', 'a', 30_000);
    setCached('GET:/api/notifications', 'b', 30_000);

    invalidateCache();

    expect(getCached('GET:/api/listings')).toBeUndefined();
    expect(getCached('GET:/api/notifications')).toBeUndefined();
  });

  it('clears only the keys matching a prefix', () => {
    setCached('GET:/api/listings', 'a', 30_000);
    setCached('GET:/api/listings/42', 'b', 30_000);
    setCached('GET:/api/notifications', 'c', 30_000);

    invalidateCache('GET:/api/listings');

    expect(getCached('GET:/api/listings')).toBeUndefined();
    expect(getCached('GET:/api/listings/42')).toBeUndefined();
    expect(getCached('GET:/api/notifications')).toBe('c');
  });

  it('is a no-op when no key matches the prefix', () => {
    setCached('GET:/api/listings', 'a', 30_000);
    invalidateCache('GET:/api/cart');
    expect(getCached('GET:/api/listings')).toBe('a');
  });
});
