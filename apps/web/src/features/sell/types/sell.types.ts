export type PhotoAngle = 'top' | 'side' | 'sole' | 'insole';

export type SellStep = 'photos' | 'results' | 'editListing' | 'review' | 'confirmation';

export type ListingMode = 'sale' | 'swap' | 'both';

export type ShoeCategory = 'running' | 'basketball' | 'football' | 'casual' | 'other';

export interface SellPhoto {
  angle: PhotoAngle;
  file?: File;
  previewUrl: string;
}

export interface AiAnalysisResult {
  brand: string;
  model: string;
  conditionScore: number;
  description: string;
  estimatedPrice: number;
}

export interface UploadedPhotoUrls {
  imageUrlTop: string;
  imageUrlSide: string;
  imageUrlSole: string;
  imageUrlInsole: string;
}

export interface ListingFormData {
  brand: string;
  model: string;
  category: ShoeCategory;
  colorway: string;
  size: string;
  conditionScore: number;
  price: string;
  description: string;
  isRefurbished: boolean;
  listingMode: ListingMode;
}

export interface PublishedListing {
  id: number | string;
  [key: string]: unknown;
}
