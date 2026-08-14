import { describe, expect, it } from 'vitest';
import { parsePositiveInt } from '@/lib/id';

/**
 * Every `[id]` route in the API funnels its route param through this before it
 * reaches a query, so anything it lets through becomes a database id.
 */
describe('parsePositiveInt', () => {
  it('returns the number for a plain positive integer string', () => {
    expect(parsePositiveInt('12')).toBe(12);
  });

  it('returns the number for a positive integer given as a number', () => {
    expect(parsePositiveInt(12)).toBe(12);
  });

  it('rejects a string that only starts with digits', () => {
    // The whole point of the function: "12abc" must not silently become id 12.
    expect(parsePositiveInt('12abc')).toBeNull();
  });

  it('rejects a string that only ends with digits', () => {
    expect(parsePositiveInt('abc12')).toBeNull();
  });

  it('rejects zero', () => {
    expect(parsePositiveInt('0')).toBeNull();
    expect(parsePositiveInt(0)).toBeNull();
  });

  it('rejects negative values', () => {
    expect(parsePositiveInt('-1')).toBeNull();
    expect(parsePositiveInt(-1)).toBeNull();
  });

  it('rejects decimals', () => {
    expect(parsePositiveInt('1.5')).toBeNull();
    expect(parsePositiveInt(1.5)).toBeNull();
  });

  it('rejects surrounding whitespace rather than trimming it', () => {
    expect(parsePositiveInt(' 12')).toBeNull();
    expect(parsePositiveInt('12 ')).toBeNull();
  });

  it('rejects an empty string', () => {
    expect(parsePositiveInt('')).toBeNull();
  });

  it('rejects digit strings too large to be a safe integer', () => {
    expect(parsePositiveInt('99999999999999999999')).toBeNull();
  });

  it('rejects non-string, non-number values', () => {
    expect(parsePositiveInt(null)).toBeNull();
    expect(parsePositiveInt(undefined)).toBeNull();
    expect(parsePositiveInt({})).toBeNull();
    expect(parsePositiveInt([12])).toBeNull();
    expect(parsePositiveInt(true)).toBeNull();
  });

  it('rejects NaN and Infinity', () => {
    expect(parsePositiveInt(Number.NaN)).toBeNull();
    expect(parsePositiveInt(Number.POSITIVE_INFINITY)).toBeNull();
  });
});
