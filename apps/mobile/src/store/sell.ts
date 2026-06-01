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
  photos: Record<PhotoAngle, SellPhoto | null>;
  isAnalyzing: boolean;
  analysisError: string | null;
  aiResult: AiAnalysisResult | null;
  aiAnalysisId: string | null;
  form: ListingFormData | null;
  publishedListing: PublishListingResult | null;

  setStep: (step: SellStep) => void;
  setPhoto: (angle: PhotoAngle, photo: SellPhoto) => void;
  clearPhoto: (angle: PhotoAngle) => void;
  setIsAnalyzing: (v: boolean) => void;
  setAnalysisError: (err: string | null) => void;
  setAiResult: (result: AiAnalysisResult, id: string) => void;
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
  photos: INITIAL_PHOTOS,
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

  setPhoto: (angle, photo) =>
    set((s) => ({ photos: { ...s.photos, [angle]: photo } })),

  clearPhoto: (angle) =>
    set((s) => ({ photos: { ...s.photos, [angle]: null } })),

  setIsAnalyzing: (v) => set({ isAnalyzing: v }),

  setAnalysisError: (err) => set({ analysisError: err }),

  setAiResult: (result, id) =>
    set({ aiResult: result, aiAnalysisId: id, isAnalyzing: false }),

  setForm: (form) => set({ form }),

  updateFormField: (key, value) =>
    set((s) => s.form ? { form: { ...s.form, [key]: value } } : {}),

  setPublishedListing: (result) => set({ publishedListing: result }),

  reset: () => set({ ...INITIAL_STATE, photos: { ...INITIAL_PHOTOS } }),
}));
