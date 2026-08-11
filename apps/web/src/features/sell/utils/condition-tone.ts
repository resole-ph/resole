/**
 * How the seller's condition rating compares to the AI's estimate.
 *
 * Ported from apps/mobile/src/features/sell/components/ConditionSlider.tsx so
 * both apps grade disagreement identically — the same photos rated the same way
 * must not read "Accurate" on one platform and "Slightly Different" on the other.
 * The maths lives here rather than in the component because the edit step tints
 * its whole condition card from the same tone.
 */

const GOOD = { r: 0x05, g: 0x96, b: 0x69 }; // #059669
const WARN = { r: 0xd9, g: 0x77, b: 0x06 }; // #d97706
const BAD = { r: 0xdc, g: 0x26, b: 0x26 }; // #dc2626

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function toHex(c: { r: number; g: number; b: number }) {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}

/** 0 = right on the AI estimate, 1 = as far as it gets on the scale. */
export function deviationFor(value: number, aiValue: number, min: number, max: number) {
  const scale = Math.max(max - min, 1);
  return Math.min(1, Math.abs(value - aiValue) / scale);
}

/** Green near the AI estimate, fading through amber to red the further off it gets. */
export function colorForDeviation(deviation: number) {
  const t = Math.min(1, deviation / 0.5);
  if (t <= 0.5) {
    const step = t / 0.5;
    return toHex({ r: lerp(GOOD.r, WARN.r, step), g: lerp(GOOD.g, WARN.g, step), b: lerp(GOOD.b, WARN.b, step) });
  }
  const step = (t - 0.5) / 0.5;
  return toHex({ r: lerp(WARN.r, BAD.r, step), g: lerp(WARN.g, BAD.g, step), b: lerp(WARN.b, BAD.b, step) });
}

export type DeviationTone = 'exact' | 'close' | 'slight' | 'off' | 'far';

/**
 * Thresholds are picked against a 1–10 scale (9-point spread), so each tier
 * lines up with a whole/half-point difference from the AI estimate: 0 exact,
 * up to 1 close, up to 2 slight, up to 3.5 off, 4+ far.
 */
export function toneFor(deviation: number): DeviationTone {
  if (deviation <= 0.03) return 'exact';
  if (deviation <= 0.14) return 'close';
  if (deviation <= 0.25) return 'slight';
  if (deviation <= 0.41) return 'off';
  return 'far';
}

/** Tone colour + tier for a rating, so the card, dial and slider agree. */
export function getConditionTone(value: number, aiValue: number, min: number, max: number) {
  const deviation = deviationFor(value, aiValue, min, max);
  return { color: colorForDeviation(deviation), tone: toneFor(deviation) };
}

/**
 * Short read on how the current rating tracks the AI estimate — it sits where
 * the raw condition word (Good/Poor/etc.) would, since that word alone says
 * nothing about agreement with the AI.
 */
export function getDeviationLabel(tone: DeviationTone): string {
  switch (tone) {
    case 'exact':
      return 'Accurate';
    case 'close':
      return 'Close';
    case 'slight':
      return 'Slightly Different';
    case 'off':
      return 'Quite Different';
    case 'far':
      return 'Way Off';
  }
}

export function getDeviationMessage(tone: DeviationTone, aiValue: number, conditionLabel: string): string {
  switch (tone) {
    case 'exact':
      return `Condition is ${conditionLabel} — it matches our AI's estimate.`;
    case 'close':
      return `Condition is ${conditionLabel} — close to our AI's estimate of ${aiValue}/10.`;
    case 'slight':
      return `Condition is ${conditionLabel} — slightly different from our AI's estimate of ${aiValue}/10. Double-check before continuing.`;
    case 'off':
      return `Condition is ${conditionLabel} — quite different from our AI's estimate of ${aiValue}/10. Buyers may question this listing.`;
    case 'far':
      return `Condition is ${conditionLabel} — way off our AI's estimate of ${aiValue}/10. Buyers may flag this listing as inaccurate.`;
  }
}
