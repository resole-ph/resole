import type {
  SellPhoto,
  AiAnalysisResult,
  UploadPhotosResult,
  PublishListingPayload,
  PublishListingResult,
} from '../types/sell.types';
import { MOCK_AI_RESULT, MOCK_AI_ANALYSIS_ID, MOCK_ANALYSIS_DELAY_MS } from '../data/sell.mock';

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
  async uploadPhotos(_photos) {
    // TODO(backend): replace with real multipart upload
    throw new Error('uploadPhotos: Not implemented');
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
