import { create } from 'zustand';
import type {
  SellStep,
  SellPhoto,
  PhotoAngle,
  AiAnalysisResult,
  ListingFormData,
  PublishListingResult,
} from '@/features/sell/types/sell.types';

interface SellState {
  step: SellStep;
  /** 'edit' when this session was opened from "My Listings" to edit an existing, published listing. */
  flowMode: 'create' | 'edit';
  /** The listing being edited, when flowMode is 'edit'. */
  editingListingId: number | null;
  photos: Record<PhotoAngle, SellPhoto | null>;
  /** True once any photo differs from what the edited listing originally had. */
  photosDirty: boolean;
  /** True when the AI-results step was intentionally skipped (edit, photos unchanged). */
  analysisSkipped: boolean;
  isAnalyzing: boolean;
  analysisError: string | null;
  aiResult: AiAnalysisResult | null;
  aiAnalysisId: number | null;
  form: ListingFormData | null;
  publishedListing: PublishListingResult | null;

  setStep: (step: SellStep) => void;
  loadListingForEdit: (
    listingId: number,
    photos: Record<PhotoAngle, SellPhoto>,
    form: ListingFormData
  ) => void;
  setPhoto: (angle: PhotoAngle, photo: SellPhoto) => void;
  clearPhoto: (angle: PhotoAngle) => void;
  setIsAnalyzing: (v: boolean) => void;
  setAnalysisError: (err: string | null) => void;
  setAiResult: (result: AiAnalysisResult, id: number) => void;
  setAnalysisSkipped: (v: boolean) => void;
  setForm: (form: ListingFormData) => void;
  updateFormField: <K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) => void;
  setPublishedListing: (result: PublishListingResult) => void;
  reset: () => void;
}

const INITIAL_PHOTOS: Record<PhotoAngle, SellPhoto | null> = {
  top: null,
  side: null,
  soles: null,
  insoles: null,
};

const INITIAL_STATE = {
  step: 'photos' as SellStep,
  flowMode: 'create' as const,
  editingListingId: null,
  photos: INITIAL_PHOTOS,
  photosDirty: false,
  analysisSkipped: false,
  isAnalyzing: false,
  analysisError: null,
  aiResult: null,
  aiAnalysisId: null,
  form: null,
  publishedListing: null,
};

export const useSellStore = create<SellState>()((set) => ({
  ...INITIAL_STATE,

  setStep: (step) => set({ step }),

  loadListingForEdit: (listingId, photos, form) =>
    set({
      step: 'photos',
      flowMode: 'edit',
      editingListingId: listingId,
      photos,
      photosDirty: false,
      analysisSkipped: false,
      isAnalyzing: false,
      analysisError: null,
      aiResult: null,
      aiAnalysisId: null,
      form,
      publishedListing: null,
    }),

  setPhoto: (angle, photo) =>
    set((s) => ({
      photos: { ...s.photos, [angle]: photo },
      photosDirty: true,
      aiResult: null,
      aiAnalysisId: null,
      analysisError: null,
    })),

  clearPhoto: (angle) =>
    set((s) => ({
      photos: { ...s.photos, [angle]: null },
      photosDirty: true,
      aiResult: null,
      aiAnalysisId: null,
      analysisError: null,
    })),

  setIsAnalyzing: (v) => set({ isAnalyzing: v }),

  setAnalysisError: (err) => set({ analysisError: err }),

  setAiResult: (result, id) =>
    set({ aiResult: result, aiAnalysisId: id, isAnalyzing: false }),

  setAnalysisSkipped: (v) => set({ analysisSkipped: v }),

  setForm: (form) => set({ form }),

  updateFormField: (key, value) =>
    set((s) => s.form ? { form: { ...s.form, [key]: value } } : {}),

  setPublishedListing: (result) => set({ publishedListing: result }),

  reset: () => set({ ...INITIAL_STATE, photos: { ...INITIAL_PHOTOS } }),
}));
