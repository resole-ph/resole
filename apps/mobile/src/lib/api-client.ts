import { getSessionToken } from './session';
import { getCached, setCached, invalidateCache } from './cache';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const DEFAULT_GET_CACHE_TTL = 30_000;

type ApiFetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Attach the stored session token as a Bearer header. Defaults to true. */
  auth?: boolean;
  /** How long to cache a GET response in memory, in ms. Pass 0 to disable caching for this call. Defaults to 30s. */
  cacheTtl?: number;
  /** Bypass any cached GET response and force a fresh network request. */
  forceRefresh?: boolean;
};

/**
 * Thin fetch wrapper around the web API routes. Attaches the persisted session
 * token as `Authorization: Bearer <token>` and surfaces the server's `{ error }`
 * message as a thrown Error on non-2xx responses.
 *
 * GET responses are cached in memory for `cacheTtl` ms so repeated screen visits
 * don't re-hit the API/DB. Any non-GET call invalidates the whole cache, since we
 * don't track which resources a given endpoint affects.
 */
export async function apiFetch<T = unknown>(
  path: string,
  { method = 'GET', body, auth = true, cacheTtl = DEFAULT_GET_CACHE_TTL, forceRefresh = false }: ApiFetchOptions = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured.');
  }

  const cacheKey = `${method}:${path}`;

  if (method === 'GET' && cacheTtl > 0 && !forceRefresh) {
    const cached = getCached<T>(cacheKey);
    if (cached !== undefined) {
      return cached;
    }
  }

  // For FormData bodies, let the runtime set `Content-Type` (incl. the multipart
  // boundary) and send the body as-is instead of JSON-encoding it.
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;

  const headers: Record<string, string> = {};
  if (!isForm) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await getSessionToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  });

  const text = await response.text();
  let data: any = null;
  let parseFailed = false;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      parseFailed = true;
    }
  }

  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed with status ${response.status}`);
  }

  if (data === null) {
    throw new Error(
      parseFailed
        ? 'Received an unreadable response from the server. Please try again.'
        : 'Received an empty response from the server. Please try again.',
    );
  }

  if (method === 'GET') {
    if (cacheTtl > 0) {
      setCached(cacheKey, data, cacheTtl);
    }
  } else {
    invalidateCache();
  }

  return data as T;
}
