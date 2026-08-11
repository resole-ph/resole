export type ConditionLabel = 'Like New' | 'Good' | 'Fair' | 'Worn' | 'Poor';

/**
 * Maps a 0–10 condition rating to its display label.
 *
 * Mirrors `ratingToLabel` in apps/mobile/src/features/sell/utils/condition.ts —
 * the two apps sell the same shoes off the same scores, so the rungs and the
 * thresholds have to be identical. The web ladder used to name the 8–9 band
 * "Excellent" and shift every label below it up one rung, so a 7/10 pair read
 * as "Good" on web and "Fair" on mobile.
 */
export function getConditionLabel(score: number): ConditionLabel {
  if (score >= 9.0) return 'Like New';
  if (score >= 8.0) return 'Good';
  if (score >= 6.5) return 'Fair';
  if (score >= 4.0) return 'Worn';
  return 'Poor';
}

/**
 * Grade colour by rung, best to worst. Keyed by label so every surface that
 * shows a condition — cards, filters, the sell flow — reads from one scale.
 */
export const CONDITION_COLORS: Record<ConditionLabel, string> = {
  'Like New': '#10B981',
  Good: '#3B82F6',
  Fair: '#F59E0B',
  Worn: '#9CA3AF',
  Poor: '#EF4444',
};

/** Every rung, best to worst — for filter chips and validation. */
export const CONDITION_LABELS = [
  'Like New',
  'Good',
  'Fair',
  'Worn',
  'Poor',
] as const satisfies readonly ConditionLabel[];
