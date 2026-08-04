import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

export const INBOX_PHOTO_BUCKET = 'inbox-photos';
export const MAX_INBOX_PHOTO_SIZE_BYTES = 20 * 1024 * 1024;

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export type InboxPhotoMetadata = {
  type: 'image';
  path: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  fileName: string;
};

const SUPPORTED_FORMATS = {
  jpeg: { extension: 'jpg', mimeType: 'image/jpeg' },
  png: { extension: 'png', mimeType: 'image/png' },
  webp: { extension: 'webp', mimeType: 'image/webp' },
  heif: { extension: 'heic', mimeType: 'image/heic' },
} as const;

function getStorageConfig() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !serviceRoleKey) {
    throw new Error('Supabase storage configuration is missing');
  }

  return {
    baseUrl: `${rawUrl.replace(/\/+$/, '')}/storage/v1`,
    serviceRoleKey,
  };
}

function objectUrl(baseUrl: string, action: 'object' | 'object/sign', path: string) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  return `${baseUrl}/${action}/${INBOX_PHOTO_BUCKET}/${encodedPath}`;
}

function storageHeaders(serviceRoleKey: string, contentType?: string) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...(contentType ? { 'Content-Type': contentType } : {}),
  };
}

export async function uploadInboxPhoto(
  file: File,
  conversationId: number,
  userId: string,
): Promise<InboxPhotoMetadata> {
  if (file.size <= 0 || file.size > MAX_INBOX_PHOTO_SIZE_BYTES) {
    throw new Error('Photo must be smaller than 20MB.');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(buffer, { animated: false }).metadata().catch(() => null);
  const format = metadata?.format as keyof typeof SUPPORTED_FORMATS | undefined;
  const supported = format ? SUPPORTED_FORMATS[format] : undefined;

  if (!supported || !metadata?.width || !metadata.height) {
    throw new Error('Choose a JPEG, PNG, WebP, HEIC, or HEIF photo.');
  }

  const { baseUrl, serviceRoleKey } = getStorageConfig();
  const path = `${conversationId}/${userId}/${randomUUID()}.${supported.extension}`;
  const response = await fetch(objectUrl(baseUrl, 'object', path), {
    method: 'POST',
    headers: {
      ...storageHeaders(serviceRoleKey, supported.mimeType),
      'x-upsert': 'false',
    },
    body: new Uint8Array(buffer),
  });

  if (!response.ok) {
    console.error('Failed to upload inbox photo:', await response.text());
    throw new Error('Could not upload the photo. Please try again.');
  }

  return {
    type: 'image',
    path,
    mimeType: supported.mimeType,
    size: file.size,
    width: metadata.width,
    height: metadata.height,
    fileName: file.name.slice(0, 255) || `photo.${supported.extension}`,
  };
}

export async function deleteInboxPhoto(path: string) {
  const { baseUrl, serviceRoleKey } = getStorageConfig();
  const response = await fetch(objectUrl(baseUrl, 'object', path), {
    method: 'DELETE',
    headers: storageHeaders(serviceRoleKey),
  });

  if (!response.ok) {
    console.error('Failed to clean up inbox photo:', await response.text());
  }
}

export async function createInboxPhotoSignedUrl(path: string): Promise<string> {
  const { baseUrl, serviceRoleKey } = getStorageConfig();
  const response = await fetch(objectUrl(baseUrl, 'object/sign', path), {
    method: 'POST',
    headers: storageHeaders(serviceRoleKey, 'application/json'),
    body: JSON.stringify({ expiresIn: SIGNED_URL_TTL_SECONDS }),
  });

  if (!response.ok) {
    console.error('Failed to sign inbox photo:', await response.text());
    throw new Error('Could not load the photo.');
  }

  const data = await response.json() as { signedURL?: string; signedUrl?: string };
  const signedPath = data.signedURL ?? data.signedUrl;
  if (!signedPath) {
    throw new Error('Supabase did not return a signed photo URL.');
  }

  return signedPath.startsWith('http') ? signedPath : `${baseUrl}${signedPath}`;
}
