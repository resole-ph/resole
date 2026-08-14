import { describe, expect, it } from 'vitest';
import {
  CONDITION_COLORS,
  CONDITION_LABELS,
  getConditionLabel,
  type ConditionLabel,
} from '@/features/sell/utils/condition';

/**
 * The condition ladder, probed from both sides of every threshold.
 *
 * This exact table is duplicated in
 * apps/mobile/src/tests/features/sell/condition.test.ts. Both apps sell the same
 * shoes off the same scores, and the web ladder previously named the 8–9 band
 * "Excellent" and shifted every rung below it, so a 7/10 pair read "Good" on web
 * and "Fair" on mobile. Keeping one table on both sides means whichever app
 * drifts fails its own suite.
 */
const CONDITION_LADDER: ReadonlyArray<[score: number, label: ConditionLabel]> = [
  [10, 'Like New'],
  [9.0, 'Like New'],
  [8.99, 'Good'],
  [8.0, 'Good'],
  [7.99, 'Fair'],
  [6.5, 'Fair'],
  [6.49, 'Worn'],
  [4.0, 'Worn'],
  [3.99, 'Poor'],
  [0, 'Poor'],
];

describe('getConditionLabel', () => {
  it.each(CONDITION_LADDER)('maps %s to %s', (score, label) => {
    expect(getConditionLabel(score)).toBe(label);
  });

  it('never returns a label outside the published ladder', () => {
    for (let score = 0; score <= 10; score += 0.25) {
      expect(CONDITION_LABELS).toContain(getConditionLabel(score));
    }
  });
});

describe('CONDITION_LABELS', () => {
  it('lists every rung best to worst', () => {
    expect(CONDITION_LABELS).toEqual(['Like New', 'Good', 'Fair', 'Worn', 'Poor']);
  });

  it('has a colour for every rung', () => {
    for (const label of CONDITION_LABELS) {
      expect(CONDITION_COLORS[label]).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});
