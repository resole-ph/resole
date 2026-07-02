import type {
  SellPhoto,
  PhotoAngle,
  AiAnalysisResult,
  UploadPhotosResult,
  PublishListingPayload,
  PublishListingResult,
} from '../types/sell.types';
import { MOCK_AI_RESULT, MOCK_AI_ANALYSIS_ID, MOCK_ANALYSIS_DELAY_MS } from '../data/sell.mock';
import { apiFetch } from '@/lib/api-client';

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

export interface SellService {
  /**
   * Uploads all four shoe photos to blob storage.
   * TODO(backend): POST /listings/photos (multipart/form-data)
   */
  uploadPhotos(photos: SellPhoto[]): Promise<UploadPhotosResult>;

  /**
   * Sends photo references to the AI analysis endpoint.
   * Returns structured valuation + identification data.
   * TODO(backend): POST /listings/analyze { photoUrls: string[] }
   */
  analyzePhotos(remoteUrls: string[]): Promise<{
    result: AiAnalysisResult;
    analysisId: string;
  }>;

  /**
   * Publishes the finalized listing.
   * TODO(backend): POST /listings
   */
  publishListing(payload: PublishListingPayload): Promise<PublishListingResult>;
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
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

  async analyzePhotos(_remoteUrls) {
    // Mock: simulate AI processing latency, then return static fixture
    await delay(MOCK_ANALYSIS_DELAY_MS);
    return { result: MOCK_AI_RESULT, analysisId: MOCK_AI_ANALYSIS_ID };
  },

  async publishListing(_payload) {
    // TODO(backend): replace with real POST /listings
    throw new Error('publishListing: Not implemented');
  },
};
