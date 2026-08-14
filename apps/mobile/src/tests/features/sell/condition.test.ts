import { describe, expect, it } from 'vitest';
import { CONDITION_COLORS, CONDITION_LABELS, ratingToLabel } from '@/features/sell/utils/condition';
import type { ConditionLabel } from '@/features/sell/types/sell.types';

/**
 * The condition ladder, probed from both sides of every threshold.
 *
 * This exact table is duplicated in
 * apps/web/src/tests/features/sell/condition.test.ts. Both apps sell the same
 * shoes off the same scores, so the rungs and thresholds have to be identical —
 * they diverged once already and a 7/10 pair read "Good" on web and "Fair" here.
 */
const CONDITION_LADDER: ReadonlyArray<[rating: number, label: ConditionLabel]> = [
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

describe('ratingToLabel', () => {
  it.each(CONDITION_LADDER)('maps %s to %s', (rating, label) => {
    expect(ratingToLabel(rating)).toBe(label);
  });

  it('never returns a label outside the published ladder', () => {
    for (let rating = 0; rating <= 10; rating += 0.25) {
      expect(CONDITION_LABELS).toContain(ratingToLabel(rating));
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
