import type { ConditionLabel } from '../types/sell.types';

/** Maps a 0–10 condition rating to its display label. */
export function ratingToLabel(rating: number): ConditionLabel {
  if (rating >= 9.0) return 'Like New';
  if (rating >= 8.0) return 'Good';
  if (rating >= 6.5) return 'Fair';
  if (rating >= 4.0) return 'Worn';
  return 'Poor';
}

/**
 * Grade colour by rung, best to worst. Browse screens receive the label already
 * resolved by the API, so they key straight into this rather than re-deriving
 * it from the score.
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
