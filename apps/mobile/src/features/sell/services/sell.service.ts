import type {
  SellPhoto,
  PhotoAngle,
  AiAnalysisResult,
  UploadPhotosResult,
  PublishListingPayload,
  PublishListingResult,
  ListingFormData,
} from '../types/sell.types';
import { apiFetch } from '@/lib/api-client';
import { ratingToLabel } from '../utils/condition';

/** Web /api/listings/photos expects singular field names; mobile uses plural angles. */
const ANGLE_TO_FIELD: Record<PhotoAngle, 'top' | 'side' | 'sole' | 'insole'> = {
  top: 'top',
  side: 'side',
  soles: 'sole',
  insoles: 'insole',
};

/** Response key the web route returns for each field. */
const FIELD_TO_URL_KEY = {
  top: 'imageUrlTop',
  side: 'imageUrlSide',
  sole: 'imageUrlSole',
  insole: 'imageUrlInsole',
} as const;

/** Shape of the `analysis` payload returned by POST /api/listings/analyze. */
interface AnalyzeResponse {
  analysisId: number,
  analysis: {
    brand: string;
    model: string;
    colorway: string;
    size: string;
    year: number;
    conditionScore: number;
    description: string;
    defects: string[];
    estimatedPrice: number;
    pricing: {
      baselinePrice: number | null;
      matchedShoeId: number | null;
      similarity: number | null;
      conditionScore: number;
      suggestedPrice: number;
      priceSource: 'catalog' | 'ai-estimate';
    };
  };
}

export interface SellService {
  /**
   * Uploads all four shoe photos to blob storage.
   * TODO(backend): POST /listings/photos (multipart/form-data)
   */
  uploadPhotos(photos: SellPhoto[]): Promise<UploadPhotosResult>;

  /**
   * Sends the four uploaded photo URLs (keyed by angle) to the AI analysis
   * endpoint and returns structured valuation + identification data.
   */
  analyzePhotos(remoteUrls: Record<PhotoAngle, string>): Promise<{
    result: AiAnalysisResult;
    analysisId: number;
  }>;

  /**
   * Publishes the finalized listing.
   * TODO(backend): POST /listings
   */
  publishListing(payload: PublishListingPayload): Promise<PublishListingResult>;
}

export const sellService: SellService = {
  async uploadPhotos(photos) {
    const form = new FormData();

    for (const photo of photos) {
      const field = ANGLE_TO_FIELD[photo.angle];
      const ext = (photo.uri.split('.').pop() || 'jpg').toLowerCase();
      const type = ext === 'png' ? 'image/png' : 'image/jpeg';

      // React Native multipart file part: { uri, name, type }.
      form.append(field, { uri: photo.uri, name: `${field}.${ext}`, type } as unknown as Blob);
    }

    const res = await apiFetch<Record<string, string>>('/api/listings/photos', {
      method: 'POST',
      body: form,
    });

    return {
      photos: photos.map((photo) => ({
        angle: photo.angle,
        remoteUrl: res[FIELD_TO_URL_KEY[ANGLE_TO_FIELD[photo.angle]]],
      })),
    };
  },

  async analyzePhotos(remoteUrls) {
    const { analysis, analysisId } = await apiFetch<AnalyzeResponse>('/api/listings/analyze', {
      method: 'POST',
      body: {
        imageUrlTop: remoteUrls.top,
        imageUrlSide: remoteUrls.side,
        imageUrlSole: remoteUrls.soles,
        imageUrlInsole: remoteUrls.insoles,
      },
    });

    const suggestedPrice = analysis.pricing.suggestedPrice;

    const result: AiAnalysisResult = {
      brand: analysis.brand,
      model: analysis.model,
      colorway: analysis.colorway,
      size: analysis.size,
      year: analysis.year,
      conditionRating: analysis.conditionScore,
      conditionLabel: ratingToLabel(analysis.conditionScore),
      suggestedPrice,
      suggestedPriceLow: Math.round(suggestedPrice * 0.85),
      suggestedPriceHigh: Math.round(suggestedPrice * 1.15),
      currency: 'PHP',
    };

    return { result, analysisId };
  },

  async publishListing(_payload) {
    const listing = await apiFetch<PublishListingResult>('/api/listings', {
      method: 'POST',
      body: _payload,
    });

    return listing
  },
};
