import { getSessionToken } from './session';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

type ApiFetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Attach the stored session token as a Bearer header. Defaults to true. */
  auth?: boolean;
};

/**
 * Thin fetch wrapper around the web API routes. Attaches the persisted session
 * token as `Authorization: Bearer <token>` and surfaces the server's `{ error }`
 * message as a thrown Error on non-2xx responses.
 */
export async function apiFetch<T = unknown>(
  path: string,
  { method = 'GET', body, auth = true }: ApiFetchOptions = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured.');
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

  const response = await fetch(`${API_BASE_URL}${path}`, {
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

  return data as T;
}
