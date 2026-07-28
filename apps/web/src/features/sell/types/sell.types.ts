export type PhotoAngle = 'top' | 'leftSide' | 'rightSide' | 'sole' | 'insoleRight' | 'insoleLeft';

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
  imageUrlLeftSide: string;
  imageUrlRightSide: string;
  imageUrlSole: string;
  imageUrlInsoleRight: string;
  imageUrlInsoleLeft: string;
  imageUrlSide?: string;
  imageUrlInsole?: string;
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
