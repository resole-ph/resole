import { describe, expect, it } from 'vitest';
import {
  ANCHOR_SYSTEM,
  MAX_US_MENS,
  MIN_US_MENS,
  SIZE_SYSTEMS,
  convertFromUSMens,
  convertToUSMens,
  formatSize,
  formatSizeValue,
  sizeSystemFromUserPreferences,
  userPreferencesFromSizeSystem,
  type SizeSystem,
} from '@/features/shoe/utils/size-conversion';

/**
 * The same reference row asserted in
 * apps/web/src/tests/features/shoe/size-conversion.test.ts. The two charts are
 * maintained as copies, so both suites check the same numbers — if either app's
 * chart is edited in isolation, its own tests fail.
 */
const US_MENS_10 = { us_m: 10, us_w: 12, eur: 44, uk: 9.5, jp_cm: 28 } as const;

describe('ANCHOR_SYSTEM', () => {
  it('is US Men, matching the web app and the stored column', () => {
    expect(ANCHOR_SYSTEM).toBe('us_m');
  });
});

describe('convertFromUSMens', () => {
  it('is the identity for the anchor system', () => {
    expect(convertFromUSMens(10, 'us_m')).toBe(10);
    expect(convertFromUSMens(10.5, 'us_m')).toBe(10.5);
  });

  it('rounds to the nearest half size', () => {
    expect(convertFromUSMens(10.3, 'us_m')).toBe(10.5);
    expect(convertFromUSMens(10.2, 'us_m')).toBe(10);
  });

  it.each(SIZE_SYSTEMS)('converts an exact chart row into %s', (system) => {
    expect(convertFromUSMens(US_MENS_10.us_m, system)).toBe(US_MENS_10[system]);
  });

  it('interpolates between chart rows', () => {
    expect(convertFromUSMens(10.5, 'eur')).toBe(44.5);
  });

  it('clamps below the chart instead of extrapolating into nonsense', () => {
    expect(convertFromUSMens(0, 'eur')).toBe(35);
    expect(convertFromUSMens(MIN_US_MENS - 5, 'eur')).toBe(convertFromUSMens(MIN_US_MENS, 'eur'));
  });

  it('clamps above the chart instead of extrapolating', () => {
    expect(convertFromUSMens(99, 'jp_cm')).toBe(34);
    expect(convertFromUSMens(MAX_US_MENS + 5, 'eur')).toBe(convertFromUSMens(MAX_US_MENS, 'eur'));
  });
});

describe('convertToUSMens', () => {
  it.each(SIZE_SYSTEMS)('converts an exact %s size back to the anchor', (system) => {
    expect(convertToUSMens(US_MENS_10[system], system)).toBe(US_MENS_10.us_m);
  });

  it('clamps out-of-chart input to the nearest real size', () => {
    expect(convertToUSMens(10, 'eur')).toBe(MIN_US_MENS);
    expect(convertToUSMens(99, 'eur')).toBe(MAX_US_MENS);
  });
});

describe('convertFromUSMens / convertToUSMens round trip', () => {
  it.each(SIZE_SYSTEMS)('preserves a chart-row size through %s and back', (system) => {
    expect(convertToUSMens(convertFromUSMens(US_MENS_10.us_m, system), system)).toBe(
      US_MENS_10.us_m
    );
  });
});

describe('formatSizeValue', () => {
  it('prints whole sizes without a decimal and half sizes with one', () => {
    expect(formatSizeValue(10)).toBe('10');
    expect(formatSizeValue(10.5)).toBe('10.5');
  });
});

describe('formatSize', () => {
  it('produces the same labels as the web app', () => {
    expect(formatSize(10, 'us_m')).toBe('10 (US Men)');
    expect(formatSize(10, 'us_w')).toBe('12 (US Women)');
    expect(formatSize(10, 'eur')).toBe('44 (EUR)');
    expect(formatSize(10, 'uk')).toBe('9.5 (UK)');
  });

  it('uses the centimetre wording for the Japanese system', () => {
    expect(formatSize(10, 'jp_cm')).toBe('28 cm (Japan)');
  });
});

describe('sizeSystemFromUserPreferences', () => {
  it('splits the ambiguous "us" unit by classification', () => {
    expect(sizeSystemFromUserPreferences('us', 'men')).toBe('us_m');
    expect(sizeSystemFromUserPreferences('us', 'women')).toBe('us_w');
  });

  it('maps the unambiguous units', () => {
    expect(sizeSystemFromUserPreferences('uk')).toBe('uk');
    expect(sizeSystemFromUserPreferences('eu')).toBe('eur');
    expect(sizeSystemFromUserPreferences('cm')).toBe('jp_cm');
  });

  // Deliberate divergence from web: web falls back to 'us_m', mobile returns
  // null so the caller can tell "no preference set" from "prefers US Men".
  // Asserted here so the difference stays intentional rather than drifting.
  it('returns null for a missing or unknown unit rather than defaulting', () => {
    expect(sizeSystemFromUserPreferences(null, null)).toBeNull();
    expect(sizeSystemFromUserPreferences(undefined, undefined)).toBeNull();
    expect(sizeSystemFromUserPreferences('klingon')).toBeNull();
  });
});

describe('userPreferencesFromSizeSystem', () => {
  it('splits US back into unit plus classification', () => {
    expect(userPreferencesFromSizeSystem('us_m')).toEqual({ unit: 'us', classification: 'men' });
    expect(userPreferencesFromSizeSystem('us_w')).toEqual({ unit: 'us', classification: 'women' });
  });

  it('maps the unambiguous systems to a bare unit', () => {
    expect(userPreferencesFromSizeSystem('eur')).toEqual({ unit: 'eu' });
    expect(userPreferencesFromSizeSystem('uk')).toEqual({ unit: 'uk' });
    expect(userPreferencesFromSizeSystem('jp_cm')).toEqual({ unit: 'cm' });
  });

  it.each(SIZE_SYSTEMS)('round trips %s through the account fields', (system: SizeSystem) => {
    const { unit, classification } = userPreferencesFromSizeSystem(system);
    expect(sizeSystemFromUserPreferences(unit, classification ?? null)).toBe(system);
  });
});
