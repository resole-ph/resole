import type { ConditionLabel } from '../types/sell.types';

/** Maps a 0–10 condition rating to its display label. */
export function ratingToLabel(rating: number): ConditionLabel {
  if (rating >= 9.0) return 'Like New';
  if (rating >= 8.0) return 'Good';
  if (rating >= 6.5) return 'Fair';
  if (rating >= 4.0) return 'Worn';
  return 'Poor';
}
