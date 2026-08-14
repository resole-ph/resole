'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PhotoUploadStep from './PhotoUploadStep';
import AiResultsStep from './AiResultsStep';
import EditListingStep from './EditListingStep';
import ReviewStep from './ReviewStep';
import ConfirmationStep from './ConfirmationStep';
import {
  uploadListingPhotos,
  analyzeListingPhotos,
  publishListing,
  fetchListingById,
  updateListing,
  listingToEditState,
} from '../services/sell.service';
import type {
  SellStep,
  PhotoAngle,
  SellPhoto,
  AiAnalysisResult,
  ListingFormData,
  UploadedPhotoUrls,
} from '../types/sell.types';
import { usePreferredSizePreference } from '@/features/shoe/hooks/usePreferredSizeSystem';
import { convertFromUSMens, formatSizeValue, type SizeSystem } from '@/features/shoe/utils/size-conversion';

const ANGLES: PhotoAngle[] = ['top', 'leftSide', 'rightSide', 'sole', 'insoleRight', 'insoleLeft'];
const STEP_ORDER: SellStep[] = ['photos', 'results', 'editListing', 'review', 'confirmation'];
const CATEGORIES: ListingFormData['category'][] = ['running', 'basketball', 'football', 'casual', 'other'];

const INITIAL_PHOTOS: Record<PhotoAngle, SellPhoto | null> = {
  top: null,
  leftSide: null,
  rightSide: null,
  sole: null,
  insoleRight: null,
  insoleLeft: null,
};

function initFormFromAiResult(ai: AiAnalysisResult, sizeSystem: SizeSystem): ListingFormData {
  const conditionScore = Math.round(ai.conditionScore);
  const anchorSize = Number(ai.size);
  const category = CATEGORIES.find((candidate) => candidate === ai.category) ?? 'other';
  return {
    brand: ai.brand ?? '',
    model: ai.model ?? '',
    category,
    colorway: ai.colorway ?? '',
    size: Number.isFinite(anchorSize)
      ? formatSizeValue(convertFromUSMens(anchorSize, sizeSystem))
      : '',
    conditionScore: Math.min(10, Math.max(1, Number.isFinite(conditionScore) ? conditionScore : 5)),
    price: String(Math.round(ai.estimatedPrice) || 0),
    description: ai.description ?? '',
    isRefurbished: false,
    listingMode: 'both',
  };
}

export default function SellWizard() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { sizeSystem, isLoading: isSizeSystemLoading } = usePreferredSizePreference();

  const [step, setStep] = useState<SellStep>('photos');
  const [photos, setPhotos] = useState<Record<PhotoAngle, SellPhoto | null>>(INITIAL_PHOTOS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);
  const [form, setForm] = useState<ListingFormData | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedListingId, setPublishedListingId] = useState<number | string | null>(null);

  // What the condition dial measures disagreement against. The edit flow has no
  // fresh analysis, so the reference there has to be the rating the listing was
  // loaded with, captured once — comparing the live value against itself would
  // pin the deviation at zero and leave the dial green and reading "Accurate"
  // no matter where it was dragged.
  const [baselineConditionScore, setBaselineConditionScore] = useState<number | null>(null);

  // Edit flow states
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [flowMode, setFlowMode] = useState<'create' | 'edit'>('create');
  const [editingListingId, setEditingListingId] = useState<number | null>(null);
  const [photosDirty, setPhotosDirty] = useState(false);
  const [uploadedPhotoUrls, setUploadedPhotoUrls] = useState<UploadedPhotoUrls | null>(null);

  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (isSizeSystemLoading) return;

    if (!editId) {
      setFlowMode('create');
      setEditingListingId(null);
      setPhotosDirty(false);
      setBaselineConditionScore(null);
      return;
    }

    async function loadListing() {
      setLoading(true);
      setLoadError(null);
      try {
        const listing = await fetchListingById(Number(editId));
        if (listing) {
          const { photos: mappedPhotos, form: mappedForm } = listingToEditState(listing, sizeSystem);
          setPhotos(mappedPhotos);
          setForm(mappedForm);
          setBaselineConditionScore(mappedForm.conditionScore);
          setFlowMode('edit');
          setEditingListingId(Number(editId));
          setPhotosDirty(false);
        } else {
          setLoadError('Listing not found');
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    }

    loadListing();
  }, [editId, isSizeSystemLoading, sizeSystem]);

  function handleSelectPhoto(angle: PhotoAngle, file: File) {
    const previewUrl = URL.createObjectURL(file);
    objectUrls.current.push(previewUrl);
    setPhotos((prev) => {
      const previous = prev[angle];
      if (previous?.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previous.previewUrl);
      }
      return { ...prev, [angle]: { angle, file, previewUrl } };
    });
    setPhotosDirty(true);
  }

  function handleRemovePhoto(angle: PhotoAngle) {
    setPhotos((prev) => ({ ...prev, [angle]: null }));
    setPhotosDirty(true);
  }

  async function resolvePhotosToFiles(photosRecord: Record<PhotoAngle, SellPhoto | null>): Promise<Record<PhotoAngle, File>> {
    const resolved = {} as Record<PhotoAngle, File>;
    for (const angle of ANGLES) {
      const photo = photosRecord[angle];
      if (!photo) throw new Error(`Missing ${angle} photo`);
      if (photo.file) {
        resolved[angle] = photo.file;
      } else {
        const res = await fetch(photo.previewUrl);
        const blob = await res.blob();
        resolved[angle] = new File([blob], `${angle}.jpg`, { type: blob.type || 'image/jpeg' });
      }
    }
    return resolved;
  }

  async function runAnalysis() {
    if (!ANGLES.every((a) => photos[a])) return;

    setStep('results');
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const resolvedFiles = await resolvePhotosToFiles(photos);
      const uploadedUrls = await uploadListingPhotos(resolvedFiles);
      const analysis = await analyzeListingPhotos(uploadedUrls);
      setAiResult(analysis);
      setUploadedPhotoUrls(uploadedUrls);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleResultsContinue() {
    if (!aiResult) return;
    const initialForm = initFormFromAiResult(aiResult, sizeSystem);
    setForm(initialForm);
    // The seller was shown the AI's score rounded on the results step, and the
    // form starts from that same rounded value — so the dial opens on
    // "Accurate" rather than flagging a gap the seller never introduced.
    setBaselineConditionScore(initialForm.conditionScore);
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
      let finalUrls = uploadedPhotoUrls;
      if (!finalUrls) {
        finalUrls = {
          imageUrlTop: photos.top?.previewUrl || '',
          imageUrlLeftSide: photos.leftSide?.previewUrl || '',
          imageUrlRightSide: photos.rightSide?.previewUrl || '',
          imageUrlSole: photos.sole?.previewUrl || '',
          imageUrlInsoleRight: photos.insoleRight?.previewUrl || '',
          imageUrlInsoleLeft: photos.insoleLeft?.previewUrl || '',
        };
      }

      if (flowMode === 'edit' && editingListingId) {
        await updateListing(editingListingId, form, finalUrls, sizeSystem);
      } else {
        const result = await publishListing(form, finalUrls, sizeSystem);
        setPublishedListingId(result.id);
      }
      setStep('confirmation');
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Failed to save listing');
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
    setBaselineConditionScore(null);
    setIsPublishing(false);
    setPublishError(null);
    setPublishedListingId(null);
    setPhotosDirty(false);
    setUploadedPhotoUrls(null);
  }

  function goBack() {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  }


  if (loading || isSizeSystemLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant text-[14px] mt-4 font-medium">Loading listing details...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
        <span className="material-symbols-outlined text-error text-[48px] mb-3">error</span>
        <p className="text-error font-semibold text-[16px]">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 md:px-10 md:py-12">
      {step === 'photos' && (
        <PhotoUploadStep
          photos={photos}
          onSelect={handleSelectPhoto}
          onRemove={handleRemovePhoto}
          onContinue={flowMode === 'edit' && !photosDirty ? () => setStep('editListing') : runAnalysis}
          flowMode={flowMode}
          photosDirty={photosDirty}
        />
      )}

      {step === 'results' && (
        <AiResultsStep
          isAnalyzing={isAnalyzing}
          error={analysisError}
          result={aiResult}
          sizeSystem={sizeSystem}
          onBack={goBack}
          onContinue={handleResultsContinue}
        />
      )}

      {step === 'editListing' && form && (
        <EditListingStep
          form={form}
          aiConditionScore={baselineConditionScore ?? form.conditionScore}
          sizeSystem={sizeSystem}
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
          flowMode={flowMode}
          sizeSystem={sizeSystem}
        />
      )}

      {step === 'confirmation' && (
        <ConfirmationStep
          listingId={publishedListingId}
          onListAnother={handleReset}
          flowMode={flowMode}
        />
      )}
    </div>
  );
}
