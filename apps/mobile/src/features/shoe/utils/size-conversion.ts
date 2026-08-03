export type SizeSystem = 'us_m' | 'us_w' | 'eur' | 'uk' | 'jp_cm';

export const SIZE_SYSTEM_LABELS: Record<SizeSystem, string> = {
  us_m: 'US Men',
  us_w: 'US Women',
  eur: 'EUR',
  uk: 'UK',
  jp_cm: 'Japan/CM',
};

export const SIZE_SYSTEMS: SizeSystem[] = ['us_m', 'us_w', 'eur', 'uk', 'jp_cm'];

export type UserSizePreferences = {
  unit: 'us' | 'uk' | 'eu' | 'cm';
  classification?: 'men' | 'women';
};

/** Maps the account-level preference onto the size systems supported by mobile. */
export function sizeSystemFromUserPreferences(
  unit?: string | null,
  classification?: string | null,
): SizeSystem | null {
  if (unit === 'us') return classification === 'women' ? 'us_w' : 'us_m';
  if (unit === 'eu') return 'eur';
  if (unit === 'uk') return 'uk';
  if (unit === 'cm') return 'jp_cm';
  return null;
}

/** Maps a mobile size system onto the existing user profile fields. */
export function userPreferencesFromSizeSystem(system: SizeSystem): UserSizePreferences {
  if (system === 'us_m') return { unit: 'us', classification: 'men' };
  if (system === 'us_w') return { unit: 'us', classification: 'women' };
  if (system === 'eur') return { unit: 'eu' };
  if (system === 'uk') return { unit: 'uk' };
  return { unit: 'cm' };
}

/** The system every stored size is expressed in. Nothing persists a size in any other system. */
export const ANCHOR_SYSTEM: SizeSystem = 'us_m';

// Reference conversion chart (US Men is the anchor column). Real size charts aren't
// linear — steps vary between systems — so conversion is table-driven rather
// than formula-driven. Values between rows are linearly interpolated; values
// outside the table are clamped to the nearest end.
//
// US Men is the anchor because the Philippine market sizes in US, so the common
// path (US in, US out) needs no conversion and loses no precision. Note that
// "US" alone is ambiguous — Men's and Women's are distinct scales roughly two
// sizes apart — so the anchor is specifically US MEN'S, never bare "US".
type SizeRow = { eur: number; us_m: number; us_w: number; uk: number; jp_cm: number };

const SIZE_CHART: SizeRow[] = [
  { eur: 35, us_m: 3, us_w: 5, uk: 2.5, jp_cm: 22.0 },
  { eur: 36, us_m: 4, us_w: 6, uk: 3.5, jp_cm: 23.0 },
  { eur: 37, us_m: 5, us_w: 7, uk: 4.5, jp_cm: 23.5 },
  { eur: 38, us_m: 6, us_w: 8, uk: 5.5, jp_cm: 24.0 },
  { eur: 39, us_m: 6.5, us_w: 8.5, uk: 6, jp_cm: 24.5 },
  { eur: 40, us_m: 7, us_w: 9, uk: 6.5, jp_cm: 25.0 },
  { eur: 41, us_m: 8, us_w: 10, uk: 7.5, jp_cm: 26.0 },
  { eur: 42, us_m: 8.5, us_w: 10.5, uk: 8, jp_cm: 26.5 },
  { eur: 43, us_m: 9.5, us_w: 11.5, uk: 9, jp_cm: 27.5 },
  { eur: 44, us_m: 10, us_w: 12, uk: 9.5, jp_cm: 28.0 },
  { eur: 45, us_m: 11, us_w: 13, uk: 10.5, jp_cm: 29.0 },
  { eur: 46, us_m: 12, us_w: 14, uk: 11.5, jp_cm: 30.0 },
  { eur: 47, us_m: 13, us_w: 15, uk: 12.5, jp_cm: 31.0 },
  { eur: 48, us_m: 14, us_w: 16, uk: 13.5, jp_cm: 32.0 },
  { eur: 49, us_m: 15, us_w: 17, uk: 14.5, jp_cm: 33.0 },
  { eur: 50, us_m: 16, us_w: 18, uk: 15.5, jp_cm: 34.0 },
];

const US_M_COLUMN = SIZE_CHART.map((row) => row.us_m);

/** Smallest and largest anchor sizes the chart can represent. */
export const MIN_US_MENS = US_M_COLUMN[0];
export const MAX_US_MENS = US_M_COLUMN[US_M_COLUMN.length - 1];

function roundToHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

/**
 * Piecewise-linear interpolation, CLAMPED at both ends. Extrapolating past the
 * chart produced nonsense — a size below the chart could map to a negative
 * number — so out-of-range inputs resolve to the nearest real size instead.
 * xs must be sorted ascending.
 */
function interpolate(x: number, xs: number[], ys: number[]): number {
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  for (let i = 0; i < n - 1; i++) {
    if (x >= xs[i] && x <= xs[i + 1]) {
      const t = (x - xs[i]) / (xs[i + 1] - xs[i]);
      return ys[i] + t * (ys[i + 1] - ys[i]);
    }
  }
  return ys[n - 1];
}

/** Anchor (US Men) -> display system. */
export function convertFromUSMens(usMens: number, system: SizeSystem): number {
  if (system === 'us_m') return roundToHalf(usMens);
  const targetColumn = SIZE_CHART.map((row) => row[system]);
  return roundToHalf(interpolate(usMens, US_M_COLUMN, targetColumn));
}

/** Display system -> anchor (US Men). */
export function convertToUSMens(size: number, system: SizeSystem): number {
  if (system === 'us_m') return roundToHalf(size);
  // Every non-anchor column is monotonically increasing across the chart, so it
  // can be used directly as the x-axis for the inverse lookup.
  const sourceColumn = SIZE_CHART.map((row) => row[system]);
  return roundToHalf(interpolate(size, sourceColumn, US_M_COLUMN));
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** Bare numeric string in whatever system the caller is working in, e.g. "10" or "10.5". */
export function formatSizeValue(n: number): string {
  return formatNumber(n);
}

/** e.g. "10 (US Men)", "28 cm (Japan)", "43 (EUR)". Input is always the stored anchor size. */
export function formatSize(usMens: number, system: SizeSystem): string {
  const value = formatNumber(convertFromUSMens(usMens, system));
  if (system === 'jp_cm') return `${value} cm (Japan)`;
  return `${value} (${SIZE_SYSTEM_LABELS[system]})`;
}
