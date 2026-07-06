'use client';

import { useEffect, useRef, useState } from 'react';
import PhotoUploadStep from './PhotoUploadStep';
import AiResultsStep from './AiResultsStep';
import EditListingStep from './EditListingStep';
import ReviewStep from './ReviewStep';
import ConfirmationStep from './ConfirmationStep';
import { MOCK_AI_RESULT, MOCK_ANALYSIS_DELAY_MS, MOCK_PUBLISH_DELAY_MS, MOCK_LISTING_ID } from '../data/sell.mock';
import type {
  SellStep,
  PhotoAngle,
  SellPhoto,
  AiAnalysisResult,
  ListingFormData,
} from '../types/sell.types';

// NOTE: This wizard is currently wired to mock data (see ../data/sell.mock.ts)
// so the flow can be reviewed end-to-end without a backend. Swap the bodies of
// runAnalysis()/handlePublish() below for the real calls in ../services/sell.service.ts
// once photo upload storage + AI analysis are ready to test against.
function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const ANGLES: PhotoAngle[] = ['top', 'side', 'sole', 'insole'];
const STEP_ORDER: SellStep[] = ['photos', 'results', 'editListing', 'review', 'confirmation'];

const INITIAL_PHOTOS: Record<PhotoAngle, SellPhoto | null> = {
  top: null,
  side: null,
  sole: null,
  insole: null,
};

function initFormFromAiResult(ai: AiAnalysisResult): ListingFormData {
  const conditionScore = Math.round(ai.conditionScore);
  return {
    brand: ai.brand ?? '',
    model: ai.model ?? '',
    category: 'other',
    colorway: '',
    size: '',
    conditionScore: Math.min(10, Math.max(1, Number.isFinite(conditionScore) ? conditionScore : 5)),
    price: String(Math.round(ai.estimatedPrice) || 0),
    description: ai.description ?? '',
    isRefurbished: false,
    listingMode: 'both',
  };
}

export default function SellWizard() {
  const [step, setStep] = useState<SellStep>('photos');
  const [photos, setPhotos] = useState<Record<PhotoAngle, SellPhoto | null>>(INITIAL_PHOTOS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);
  const [form, setForm] = useState<ListingFormData | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedListingId, setPublishedListingId] = useState<number | string | null>(null);

  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function handleSelectPhoto(angle: PhotoAngle, file: File) {
    const previewUrl = URL.createObjectURL(file);
    objectUrls.current.push(previewUrl);
    setPhotos((prev) => ({ ...prev, [angle]: { angle, file, previewUrl } }));
  }

  function handleRemovePhoto(angle: PhotoAngle) {
    setPhotos((prev) => ({ ...prev, [angle]: null }));
  }

  async function runAnalysis() {
    if (!ANGLES.every((a) => photos[a])) return;

    setStep('results');
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      await delay(MOCK_ANALYSIS_DELAY_MS);
      setAiResult(MOCK_AI_RESULT);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleResultsContinue() {
    if (!aiResult) return;
    setForm(initFormFromAiResult(aiResult));
    setStep('editListing');
  }

  function updateFormField<K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handlePublish() {
    if (!form) return;
    setIsPublishing(true);
    setPublishError(null);

    try {
      await delay(MOCK_PUBLISH_DELAY_MS);
      setPublishedListingId(MOCK_LISTING_ID);
      setStep('confirmation');
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Failed to publish listing');
    } finally {
      setIsPublishing(false);
    }
  }

  function handleReset() {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.current = [];
    setStep('photos');
    setPhotos(INITIAL_PHOTOS);
    setIsAnalyzing(false);
    setAnalysisError(null);
    setAiResult(null);
    setForm(null);
    setIsPublishing(false);
    setPublishError(null);
    setPublishedListingId(null);
  }

  function goBack() {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 md:px-10 md:py-12">
      {step === 'photos' && (
        <PhotoUploadStep
          photos={photos}
          onSelect={handleSelectPhoto}
          onRemove={handleRemovePhoto}
          onContinue={runAnalysis}
        />
      )}

      {step === 'results' && (
        <AiResultsStep
          isAnalyzing={isAnalyzing}
          error={analysisError}
          result={aiResult}
          onBack={goBack}
          onContinue={handleResultsContinue}
        />
      )}

      {step === 'editListing' && form && (
        <EditListingStep
          form={form}
          onChange={updateFormField}
          onBack={goBack}
          onContinue={() => setStep('review')}
        />
      )}

      {step === 'review' && form && (
        <ReviewStep
          photos={photos}
          form={form}
          isPublishing={isPublishing}
          error={publishError}
          onBack={goBack}
          onPublish={handlePublish}
        />
      )}

      {step === 'confirmation' && (
        <ConfirmationStep listingId={publishedListingId} onListAnother={handleReset} />
      )}
    </div>
  );
}
