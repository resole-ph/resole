import { describe, expect, it } from 'vitest';
import {
  ANCHOR_SYSTEM,
  MAX_US_MENS,
  MIN_US_MENS,
  SIZE_SYSTEMS,
  convertFromUSMens,
  convertToUSMens,
  formatSize,
  formatSizeShort,
  formatSizeValue,
  sizeSystemFromUserPreferences,
  userPreferencesFromSizeSystem,
  type SizeSystem,
} from '@/features/shoe/utils/size-conversion';

/**
 * One row of the reference chart. US Men 10 is a chart row in every column, so
 * conversions through it must be exact in both directions with no interpolation.
 */
const US_MENS_10 = { us_m: 10, us_w: 12, eur: 44, uk: 9.5, jp_cm: 28 } as const;

describe('ANCHOR_SYSTEM', () => {
  it('is US Men, the system every stored size is expressed in', () => {
    expect(ANCHOR_SYSTEM).toBe('us_m');
  });
});

describe('convertFromUSMens', () => {
  it('is the identity for the anchor system', () => {
    expect(convertFromUSMens(10, 'us_m')).toBe(10);
    expect(convertFromUSMens(10.5, 'us_m')).toBe(10.5);
  });

  it('rounds the anchor system to the nearest half size', () => {
    expect(convertFromUSMens(10.3, 'us_m')).toBe(10.5);
    expect(convertFromUSMens(10.2, 'us_m')).toBe(10);
  });

  it.each(SIZE_SYSTEMS)('converts an exact chart row into %s', (system) => {
    expect(convertFromUSMens(US_MENS_10.us_m, system)).toBe(US_MENS_10[system]);
  });

  it('interpolates between chart rows', () => {
    // US Men 10 -> EUR 44 and US Men 11 -> EUR 45, so the midpoint is EUR 44.5.
    expect(convertFromUSMens(10.5, 'eur')).toBe(44.5);
  });

  it('clamps below the chart instead of extrapolating into nonsense', () => {
    // Extrapolating a size under the chart used to produce negative numbers.
    expect(convertFromUSMens(MIN_US_MENS - 5, 'eur')).toBe(convertFromUSMens(MIN_US_MENS, 'eur'));
    expect(convertFromUSMens(0, 'eur')).toBe(35);
  });

  it('clamps above the chart instead of extrapolating', () => {
    expect(convertFromUSMens(MAX_US_MENS + 5, 'eur')).toBe(convertFromUSMens(MAX_US_MENS, 'eur'));
    expect(convertFromUSMens(99, 'jp_cm')).toBe(34);
  });
});

describe('convertToUSMens', () => {
  it('is the identity for the anchor system', () => {
    expect(convertToUSMens(10, 'us_m')).toBe(10);
  });

  it.each(SIZE_SYSTEMS)('converts an exact %s size back to the anchor', (system) => {
    expect(convertToUSMens(US_MENS_10[system], system)).toBe(US_MENS_10.us_m);
  });

  it('clamps input below the chart to the smallest real size', () => {
    expect(convertToUSMens(10, 'eur')).toBe(MIN_US_MENS);
  });

  it('clamps input above the chart to the largest real size', () => {
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
  it('prints whole sizes without a decimal', () => {
    expect(formatSizeValue(10)).toBe('10');
  });

  it('prints half sizes with one decimal place', () => {
    expect(formatSizeValue(10.5)).toBe('10.5');
  });
});

describe('formatSize', () => {
  it('labels the anchor system', () => {
    expect(formatSize(10, 'us_m')).toBe('10 (US Men)');
  });

  it('labels US Women distinctly from US Men', () => {
    // "US" alone is ambiguous — the two scales are ~2 sizes apart.
    expect(formatSize(10, 'us_w')).toBe('12 (US Women)');
  });

  it('labels EUR and UK', () => {
    expect(formatSize(10, 'eur')).toBe('44 (EUR)');
    expect(formatSize(10, 'uk')).toBe('9.5 (UK)');
  });

  it('uses the centimetre wording for the Japanese system', () => {
    expect(formatSize(10, 'jp_cm')).toBe('28 cm (Japan)');
  });
});

describe('formatSizeShort', () => {
  it('accepts the stored size as a string and defaults to the anchor system', () => {
    expect(formatSizeShort('10')).toBe('10 (US Men)');
  });

  it('converts into the requested system', () => {
    expect(formatSizeShort(10, 'eur')).toBe('44 (EUR)');
  });

  it('returns null for a missing size rather than rendering a placeholder', () => {
    expect(formatSizeShort(null)).toBeNull();
    expect(formatSizeShort(undefined)).toBeNull();
    expect(formatSizeShort('')).toBeNull();
  });

  it('returns null for a non-numeric size', () => {
    expect(formatSizeShort('unknown')).toBeNull();
  });
});

describe('sizeSystemFromUserPreferences', () => {
  it('splits the ambiguous "us" unit by classification', () => {
    expect(sizeSystemFromUserPreferences('us', 'men')).toBe('us_m');
    expect(sizeSystemFromUserPreferences('us', 'women')).toBe('us_w');
  });

  it('treats "us" with no classification as US Men', () => {
    expect(sizeSystemFromUserPreferences('us', null)).toBe('us_m');
  });

  it('maps the unambiguous units', () => {
    expect(sizeSystemFromUserPreferences('uk', null)).toBe('uk');
    expect(sizeSystemFromUserPreferences('eu', null)).toBe('eur');
    expect(sizeSystemFromUserPreferences('cm', null)).toBe('jp_cm');
  });

  it('falls back to the anchor system for missing or unknown units', () => {
    expect(sizeSystemFromUserPreferences(null, null)).toBe(ANCHOR_SYSTEM);
    expect(sizeSystemFromUserPreferences(undefined, undefined)).toBe(ANCHOR_SYSTEM);
    expect(sizeSystemFromUserPreferences('klingon', null)).toBe(ANCHOR_SYSTEM);
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
