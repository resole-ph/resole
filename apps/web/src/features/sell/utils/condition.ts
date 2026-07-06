export type ConditionLabel = 'Like New' | 'Excellent' | 'Good' | 'Fair' | 'Poor';

export function getConditionLabel(score: number): ConditionLabel {
  if (score >= 9.0) return 'Like New';
  if (score >= 8.0) return 'Excellent';
  if (score >= 6.5) return 'Good';
  if (score >= 4.0) return 'Fair';
  return 'Poor';
}
