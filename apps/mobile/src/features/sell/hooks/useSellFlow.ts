import { useSellStore } from '@/store/sell';
import type { ListingFormData, SellStep } from '../types/sell.types';

const PHOTO_ANGLES = ['top', 'side', 'soles', 'insoles'] as const;

const CONDITION_LABELS = ['Poor', 'Fair', 'Good', 'Excellent', 'Like New', 'Deadstock'] as const;

function ratingToLabel(rating: number): ListingFormData['conditionLabel'] {
  if (rating <= 2) return 'Poor';
  if (rating <= 4) return 'Fair';
  if (rating <= 6) return 'Good';
  if (rating <= 7) return 'Excellent';
  if (rating <= 9) return 'Like New';
  return 'Deadstock';
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export function useSellFlow() {
  const store = useSellStore();

  const allPhotosUploaded = PHOTO_ANGLES.every((a) => store.photos[a] !== null);

  function initFormFromAiResult() {
    const ai = store.aiResult;
    if (!ai) return;
    store.setForm({
      brand: ai.brand,
      model: ai.model,
      colorway: ai.colorway,
      size: ai.size,
      year: String(ai.year),
      conditionRating: ai.conditionRating,
      conditionLabel: ai.conditionLabel,
      price: String(ai.suggestedPrice),
      description: '',
      mode: 'sell',
    });
  }

  function priceAllowedRange() {
    const base = store.aiResult?.suggestedPrice ?? 0;
    return {
      min: Math.round(base * 0.85),
      max: Math.round(base * 1.15),
    };
  }

  function conditionAllowedRange() {
    const base = store.aiResult?.conditionRating ?? 5;
    return {
      min: clamp(Math.round(base * 0.85), 1, 10),
      max: clamp(Math.round(base * 1.15), 1, 10),
    };
  }

  const STEP_ORDER: SellStep[] = ['photos', 'aiResults', 'editListing', 'review', 'confirmation'];

  function goBack() {
    const idx = STEP_ORDER.indexOf(store.step);
    if (idx > 0) store.setStep(STEP_ORDER[idx - 1]);
  }

  return {
    ...store,
    allPhotosUploaded,
    initFormFromAiResult,
    priceAllowedRange,
    conditionAllowedRange,
    ratingToLabel,
    goBack,
  };
}
