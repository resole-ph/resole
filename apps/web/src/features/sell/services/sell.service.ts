import type {
  PhotoAngle,
  UploadedPhotoUrls,
  AiAnalysisResult,
  ListingFormData,
  PublishedListing,
  ShoeCategory,
  ListingMode,
  SellPhoto,
} from '../types/sell.types';

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }

  return data;
}

export async function uploadListingPhotos(
  photos: Record<PhotoAngle, File>
): Promise<UploadedPhotoUrls> {
  const formData = new FormData();
  formData.append('top', photos.top);
  formData.append('side', photos.side);
  formData.append('sole', photos.sole);
  formData.append('insole', photos.insole);

  const response = await fetch('/api/listings/photos', {
    method: 'POST',
    body: formData,
  });

  return parseJsonOrThrow<UploadedPhotoUrls>(response);
}

export async function analyzeListingPhotos(
  urls: UploadedPhotoUrls
): Promise<AiAnalysisResult> {
  const response = await fetch('/api/listings/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(urls),
  });

  const data = await parseJsonOrThrow<{ analysis: AiAnalysisResult }>(response);
  return data.analysis;
}

export async function publishListing(
  form: ListingFormData,
  photoUrls: UploadedPhotoUrls
): Promise<PublishedListing> {
  const mappedMode = form.listingMode.charAt(0).toUpperCase() + form.listingMode.slice(1);
  const response = await fetch('/api/listings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brand: form.brand,
      model: form.model,
      category: form.category,
      value: form.price,
      description: form.description,
      colorway: form.colorway,
      size: form.size,
      conditionScore: form.conditionScore,
      isRefurbished: form.isRefurbished,
      listingMode: mappedMode,
      ...photoUrls,
    }),
  });

  const data = await parseJsonOrThrow<{ listing: PublishedListing }>(response);
  return data.listing;
}

export async function fetchListingById(id: number): Promise<any> {
  const response = await fetch(`/api/listings/${id}`, {
    method: 'GET',
  });
  const data = await parseJsonOrThrow<{ shoeListing: any }>(response);
  return data.shoeListing;
}

export async function updateListing(
  id: number,
  form: ListingFormData,
  photoUrls: UploadedPhotoUrls
): Promise<PublishedListing> {
  const mappedMode = form.listingMode.charAt(0).toUpperCase() + form.listingMode.slice(1);
  const response = await fetch(`/api/listings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brand: form.brand,
      model: form.model,
      category: form.category,
      value: form.price,
      description: form.description,
      colorway: form.colorway,
      size: form.size,
      conditionScore: form.conditionScore,
      isRefurbished: form.isRefurbished,
      listingMode: mappedMode,
      ...photoUrls,
    }),
  });

  const data = await parseJsonOrThrow<{ shoeListing: PublishedListing }>(response);
  return data.shoeListing;
}

export function listingToEditState(listing: any): {
  photos: Record<PhotoAngle, SellPhoto>;
  form: ListingFormData;
} {
  const photos = {
    top: { angle: 'top', previewUrl: listing.imageUrlTop },
    side: { angle: 'side', previewUrl: listing.imageUrlSide },
    sole: { angle: 'sole', previewUrl: listing.imageUrlSole },
    insole: { angle: 'insole', previewUrl: listing.imageUrlInsole },
  } as Record<PhotoAngle, SellPhoto>;

  const form: ListingFormData = {
    brand: listing.brand,
    model: listing.model,
    category: (listing.category as ShoeCategory) ?? 'other',
    colorway: listing.colorway ?? '',
    size: String(listing.size ?? ''),
    conditionScore: Number(listing.conditionScore ?? 5),
    price: String(listing.price ?? '0'),
    description: listing.description ?? '',
    isRefurbished: Boolean(listing.isRefurbished ?? false),
    listingMode: (listing.listingMode?.toLowerCase() as ListingMode) ?? 'sale',
  };

  return { photos, form };
}
