import type {
  SellPhoto,
  PhotoAngle,
  AiAnalysisResult,
  UploadPhotosResult,
  PublishListingPayload,
  UpdateListingPayload,
  PublishListingResult,
  ListingFormData
} from '../types/sell.types';
import type { Listing } from '@/components/molecules/ListingCard';
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

/** Mobile's lowercase listing mode vs. the web API's capitalized enum. */
const MODE_TO_LISTING_MODE: Record<ListingFormData['mode'], 'Sale' | 'Swap' | 'Both'> = {
  sell: 'Sale',
  swap: 'Swap',
  both: 'Both',
};

const LISTING_MODE_TO_MODE: Record<'Sale' | 'Swap' | 'Both', ListingFormData['mode']> = {
  Sale: 'sell',
  Swap: 'swap',
  Both: 'both',
};

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

  /** Updates an existing, already-published listing in place. */
  updateListing(payload: UpdateListingPayload): Promise<PublishListingResult>;
}

/** Maps an existing published listing into the sell flow's photos + form shape, for editing. */
export function listingToEditState(listing: Listing): {
  photos: Record<PhotoAngle, SellPhoto>;
  form: ListingFormData;
} {
  const photos = {} as Record<PhotoAngle, SellPhoto>;
  (Object.keys(ANGLE_TO_FIELD) as PhotoAngle[]).forEach((angle) => {
    const urlKey = FIELD_TO_URL_KEY[ANGLE_TO_FIELD[angle]];
    const remoteUrl = listing[urlKey];
    photos[angle] = { angle, uri: remoteUrl, uploaded: true, remoteUrl };
  });

  const conditionRating = listing.conditionScore;
  const listingMode = (listing.listingMode as 'Sale' | 'Swap' | 'Both' | undefined) ?? 'Sale';

  const form: ListingFormData = {
    brand: listing.brand,
    model: listing.model,
    colorway: listing.colorway ?? '',
    size: listing.size ?? '',
    // Existing listings don't store a manufacture year — only a fresh AI
    // analysis captures one, so leave it blank until/unless that happens.
    year: '',
    conditionRating,
    conditionLabel: ratingToLabel(conditionRating),
    price: String(listing.price),
    description: listing.description ?? '',
    mode: LISTING_MODE_TO_MODE[listingMode] ?? 'sell',
  };

  return { photos, form };
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

  async publishListing(payload) {
    const remoteUrlByAngle = Object.fromEntries(
      payload.photos.map((p) => [p.angle, p.remoteUrl])
    ) as Record<PhotoAngle, string>;

    const { form } = payload;

    const listing = await apiFetch<PublishListingResult>('/api/listings', {
      method: 'POST',
      body: {
        brand: form.brand,
        model: form.model,
        value: form.price,
        description: form.description,
        colorway: form.colorway,
        size: form.size,
        conditionScore: form.conditionRating,
        listingMode: MODE_TO_LISTING_MODE[form.mode],
        imageUrlTop: remoteUrlByAngle.top,
        imageUrlSide: remoteUrlByAngle.side,
        imageUrlSole: remoteUrlByAngle.soles,
        imageUrlInsole: remoteUrlByAngle.insoles,
      },
    });

    return listing
  },

  async updateListing({ listingId, photos, form }) {
    const remoteUrlByAngle = Object.fromEntries(
      photos.map((p) => [p.angle, p.remoteUrl])
    ) as Partial<Record<PhotoAngle, string>>;

    const body: Record<string, unknown> = {
      value: form.price,
      description: form.description,
      colorway: form.colorway,
      size: form.size,
      conditionScore: form.conditionRating,
      listingMode: MODE_TO_LISTING_MODE[form.mode],
    };

    // Only send image URLs for photos that were actually re-uploaded —
    // unchanged angles keep whatever the listing already has server-side.
    if (remoteUrlByAngle.top) body.imageUrlTop = remoteUrlByAngle.top;
    if (remoteUrlByAngle.side) body.imageUrlSide = remoteUrlByAngle.side;
    if (remoteUrlByAngle.soles) body.imageUrlSole = remoteUrlByAngle.soles;
    if (remoteUrlByAngle.insoles) body.imageUrlInsole = remoteUrlByAngle.insoles;

    await apiFetch(`/api/listings/${listingId}`, {
      method: 'PATCH',
      body,
    });

    return {
      listingId: String(listingId),
      listingUrl: `/listing/${listingId}`,
    };
  },
};
