import { useSellStore } from '@/store/sell';
import { usePreferencesStore } from '@/store/preferences';
import { Alert } from 'react-native';
import { convertFromUSMens, formatSizeValue } from '@/features/shoe/utils/size-conversion';
import type { AiAnalysisResult, SellStep } from '../types/sell.types';
import { ratingToLabel } from '../utils/condition';

const PHOTO_ANGLES = ['top', 'leftSide', 'rightSide', 'sole', 'insoleRight', 'insoleLeft'] as const;

// Dev-only placeholder so `devAdvance` can jump straight to a later step
// without requiring real photos or a finished AI analysis.
const DEV_MOCK_AI_RESULT: AiAnalysisResult = {
  brand: 'Nike',
  model: 'Air Max 90',
  colorway: 'White / Black',
  size: '8.5',
  category: 'casual',
  year: 2022,
  conditionLabel: 'Good',
  conditionRating: 7,
  suggestedPriceLow: 3400,
  suggestedPriceHigh: 4600,
  suggestedPrice: 4000,
  currency: 'PHP',
};

export function useSellFlow() {
  const store = useSellStore();

  const allPhotosUploaded = PHOTO_ANGLES.every((a) => store.photos[a] !== null);

  function initFormFromAiResult() {
    const ai = store.aiResult;
    if (!ai) return;
    // Preserve fields the AI doesn't know about (listing mode, description) when
    // re-analyzing during an edit, instead of wiping out what was already there.
    const prev = store.form;
    // The AI reads the size off the shoe in US Men (the anchor), but the form
    // holds sizes in the seller's display system — so re-express it here rather
    // than letting the raw anchor number be reinterpreted as, say, UK.
    const { sizeSystem } = usePreferencesStore.getState();
    const displaySize = formatSizeValue(convertFromUSMens(Number(ai.size), sizeSystem));
    store.setForm({
      brand: ai.brand,
      model: ai.model,
      colorway: ai.colorway,
      size: displaySize,
      category: ai.category,
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

  /** Confirm before leaving a create/edit session that contains unsaved work. */
  function confirmDiscard(onDiscard: () => void) {
    const discard = () => {
      store.reset();
      onDiscard();
    };

    if (!store.hasUnsavedChanges) {
      discard();
      return;
    }

    const isEditing = store.flowMode === 'edit';
    Alert.alert(
      isEditing ? 'Discard changes?' : 'Discard listing?',
      isEditing
        ? 'You have unsaved changes to this listing. Do you want to discard them?'
        : 'You have an unfinished listing. Do you want to discard your draft?',
      [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: discard },
      ],
    );
  }

  /**
   * DEV ONLY — advances to the next step, backfilling whatever data that step
   * needs to render (mock AI result, form) so it can be reached without
   * actually uploading photos or waiting on a real analysis. Remove once the
   * flow doesn't need manual step-by-step testing anymore.
   */
  function devAdvance() {
    const idx = STEP_ORDER.indexOf(store.step);
    const next = STEP_ORDER[idx + 1];
    if (!next) return;

    if (next === 'aiResults' && !store.aiResult) {
      store.setAiResult(DEV_MOCK_AI_RESULT, -1);
    }
    if (next === 'editListing' && !store.form) {
      initFormFromAiResult();
    }
    if (next === 'confirmation' && !store.publishedListing) {
      store.setPublishedListing({ listingId: 'DEV-0000', listingUrl: '' });
    }

    store.setStep(next);
  }

  const isLastStep = STEP_ORDER.indexOf(store.step) === STEP_ORDER.length - 1;

  return {
    ...store,
    allPhotosUploaded,
    initFormFromAiResult,
    priceAllowedRange,
    ratingToLabel,
    goBack,
    confirmDiscard,
    devAdvance,
    isLastStep,
  };
}
