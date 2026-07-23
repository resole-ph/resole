export type SizeSystem = 'eur' | 'us_m' | 'us_w' | 'uk' | 'jp_cm';

export const SIZE_SYSTEM_LABELS: Record<SizeSystem, string> = {
  eur: 'EUR',
  us_m: 'US Men',
  us_w: 'US Women',
  uk: 'UK',
  jp_cm: 'Japan/CM',
};

export const SIZE_SYSTEMS: SizeSystem[] = ['eur', 'us_m', 'us_w', 'uk', 'jp_cm'];

// Reference conversion chart (EUR is the anchor column). Real size charts aren't
// linear — steps vary between systems — so conversion is table-driven rather
// than formula-driven. Values between rows are linearly interpolated; values
// outside the table are extrapolated using the nearest segment's slope.
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

const EUR_COLUMN = SIZE_CHART.map((row) => row.eur);

function roundToHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

/** Piecewise-linear interpolation; extrapolates past the ends using the nearest segment's slope. xs must be sorted ascending. */
function interpolate(x: number, xs: number[], ys: number[]): number {
  const n = xs.length;
  if (x <= xs[0]) {
    const slope = (ys[1] - ys[0]) / (xs[1] - xs[0]);
    return ys[0] + slope * (x - xs[0]);
  }
  if (x >= xs[n - 1]) {
    const slope = (ys[n - 1] - ys[n - 2]) / (xs[n - 1] - xs[n - 2]);
    return ys[n - 1] + slope * (x - xs[n - 1]);
  }
  for (let i = 0; i < n - 1; i++) {
    if (x >= xs[i] && x <= xs[i + 1]) {
      const t = (x - xs[i]) / (xs[i + 1] - xs[i]);
      return ys[i] + t * (ys[i + 1] - ys[i]);
    }
  }
  return ys[n - 1];
}

export function convertFromEUR(eur: number, system: SizeSystem): number {
  if (system === 'eur') return roundToHalf(eur);
  const targetColumn = SIZE_CHART.map((row) => row[system]);
  return roundToHalf(interpolate(eur, EUR_COLUMN, targetColumn));
}

export function convertToEUR(size: number, system: SizeSystem): number {
  if (system === 'eur') return roundToHalf(size);
  // Every non-EUR column is monotonically increasing across the chart, so it
  // can be used directly as the x-axis for the inverse lookup.
  const sourceColumn = SIZE_CHART.map((row) => row[system]);
  return roundToHalf(interpolate(size, sourceColumn, EUR_COLUMN));
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** e.g. "10 (US Men)", "28 cm (Japan)", "43 (EUR)" */
export function formatSize(eur: number, system: SizeSystem): string {
  const value = formatNumber(convertFromEUR(eur, system));
  if (system === 'jp_cm') return `${value} cm (Japan)`;
  return `${value} (${SIZE_SYSTEM_LABELS[system]})`;
}
