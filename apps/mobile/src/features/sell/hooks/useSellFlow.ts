import { useSellStore } from '@/store/sell';
import type { SellStep } from '../types/sell.types';
import { ratingToLabel } from '../utils/condition';

const PHOTO_ANGLES = ['left', 'right', 'top', 'soles', 'insoles'] as const;

export function useSellFlow() {
  const store = useSellStore();

  const allPhotosUploaded = PHOTO_ANGLES.every((a) => store.photos[a] !== null);

  function initFormFromAiResult() {
    const ai = store.aiResult;
    if (!ai) return;
    // Preserve fields the AI doesn't know about (listing mode, description) when
    // re-analyzing during an edit, instead of wiping out what was already there.
    const prev = store.form;
    store.setForm({
      brand: ai.brand,
      model: ai.model,
      colorway: ai.colorway,
      size: ai.size,
      year: String(ai.year),
      conditionRating: ai.conditionRating,
      conditionLabel: ai.conditionLabel,
      price: String(ai.suggestedPrice),
      description: prev?.description ?? '',
      mode: prev?.mode ?? 'sell',
    });
  }

  /** Null when there's no fresh AI valuation this session (e.g. editing without re-analyzing). */
  function priceAllowedRange(): { min: number; max: number } | null {
    if (!store.aiResult) return null;
    const base = store.aiResult.suggestedPrice;
    return {
      min: Math.round(base * 0.85),
      max: Math.round(base * 1.15),
    };
  }

  const STEP_ORDER: SellStep[] = ['photos', 'aiResults', 'editListing', 'review', 'confirmation'];

  function goBack() {
    // Edit flow with unchanged photos skips straight from 'photos' to
    // 'editListing', bypassing 'aiResults' — so back should retrace that.
    if (store.step === 'editListing' && store.analysisSkipped) {
      store.setStep('photos');
      return;
    }
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
