import { useSellStore } from '@/store/sell';
import type { SellStep } from '../types/sell.types';
import { ratingToLabel } from '../utils/condition';

const PHOTO_ANGLES = ['top', 'side', 'soles', 'insoles'] as const;

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
    ratingToLabel,
    goBack,
  };
}
