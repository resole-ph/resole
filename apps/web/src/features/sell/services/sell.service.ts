import type {
  PhotoAngle,
  UploadedPhotoUrls,
  AiAnalysisResult,
  ListingFormData,
  PublishedListing,
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
      listingMode: form.listingMode,
      ...photoUrls,
    }),
  });

  const data = await parseJsonOrThrow<{ listing: PublishedListing }>(response);
  return data.listing;
}
