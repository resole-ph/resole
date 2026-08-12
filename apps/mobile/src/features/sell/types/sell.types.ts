export type PhotoAngle = 'top' | 'leftSide' | 'rightSide' | 'sole' | 'insoleRight' | 'insoleLeft';

export type SellStep = 'photos' | 'aiResults' | 'editListing' | 'review' | 'confirmation';

export type ConditionLabel = 'Like New' | 'Worn' | 'Good' | 'Fair' | 'Poor';

export type ListingMode = 'sell' | 'swap' | 'both';

export interface SellPhoto {
  angle: PhotoAngle;
  uri: string;
  uploaded: boolean;
  remoteUrl?: string;
}

export interface AiAnalysisResult {
  brand: string;
  model: string;
  colorway: string;
  size: string;
  category: string;
  year: number;
  conditionLabel: ConditionLabel;
  conditionRating: number;
  suggestedPriceLow: number;
  suggestedPriceHigh: number;
  suggestedPrice: number;
  currency: 'PHP';
  lightingWarning?: string;
  angleWarning?: string;
}

export interface ListingFormData {
  brand: string;
  model: string;
  colorway: string;
  size: string;
  category?: string;
  year: string;
  conditionRating: number;
  conditionLabel: ConditionLabel;
  price: string;
  description: string;
  mode: ListingMode;
}

export interface UploadPhotosResult {
  photos: Array<{ angle: PhotoAngle; remoteUrl: string }>;
}

export interface PublishListingPayload {
  photos: Array<{ angle: PhotoAngle; remoteUrl: string }>;
  form: ListingFormData;
  aiAnalysisId: string;
}

export interface UpdateListingPayload {
  listingId: number;
  photos: Array<{ angle: PhotoAngle; remoteUrl: string }>;
  form: ListingFormData;
}

export interface PublishListingResult {
  listingId: string;
  listingUrl: string;
}
