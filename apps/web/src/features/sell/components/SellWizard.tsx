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
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [step, setStep] = useState<SellStep>('photos');
  const [photos, setPhotos] = useState<Record<PhotoAngle, SellPhoto | null>>(INITIAL_PHOTOS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);
  const [form, setForm] = useState<ListingFormData | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedListingId, setPublishedListingId] = useState<number | string | null>(null);

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
    if (!editId) {
      setFlowMode('create');
      setEditingListingId(null);
      setPhotosDirty(false);
      return;
    }

    async function loadListing() {
      setLoading(true);
      setLoadError(null);
      try {
        const listing = await fetchListingById(Number(editId));
        if (listing) {
          const { photos: mappedPhotos, form: mappedForm } = listingToEditState(listing);
          setPhotos(mappedPhotos);
          setForm(mappedForm);
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
  }, [editId]);

  function handleSelectPhoto(angle: PhotoAngle, file: File) {
    const previewUrl = URL.createObjectURL(file);
    objectUrls.current.push(previewUrl);
    setPhotos((prev) => ({ ...prev, [angle]: { angle, file, previewUrl } }));
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
      let finalUrls = uploadedPhotoUrls;
      if (!finalUrls) {
        finalUrls = {
          imageUrlTop: photos.top?.previewUrl || '',
          imageUrlSide: photos.side?.previewUrl || '',
          imageUrlSole: photos.sole?.previewUrl || '',
          imageUrlInsole: photos.insole?.previewUrl || '',
        };
      }

      if (flowMode === 'edit' && editingListingId) {
        await updateListing(editingListingId, form, finalUrls);
      } else {
        const result = await publishListing(form, finalUrls);
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
    setIsPublishing(false);
    setPublishError(null);
    setPublishedListingId(null);
    setPhotosDirty(false);
    setUploadedPhotoUrls(null);
  }

  function goBack() {
    if (step === 'results') {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current = [];
      setPhotos(INITIAL_PHOTOS);
      setAiResult(null);
      setUploadedPhotoUrls(null);
      setPhotosDirty(false);
    }
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  }


  if (loading) {
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
          flowMode={flowMode}
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
