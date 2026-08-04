import { buildInboxItems } from '../utils/inbox-items';
import type {
  ConversationSummary,
  ConversationThreadData,
  EditOfferPayload,
  InboxItem,
  NotificationSummary,
  ThreadMessage,
  ThreadOffer,
} from '../types/inbox.types';
import type { SerializedShoeListing } from '@/features/shoe/utils/listing-dto';

/**
 * Browser-side inbox client. Talks to the same API routes the mobile app uses,
 * relying on the same-origin `session` cookie for auth.
 */

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json', ...init?.headers } : init?.headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed: ${path}`);
  }

  return data as T;
}

export const InboxClient = {
  /** The same list the server renders initially — rebuilt here on a client refresh. */
  async getInboxItems(): Promise<InboxItem[]> {
    const [conversationsResult, notificationsResult] = await Promise.all([
      request<{ conversations: ConversationSummary[] }>('/api/conversations').catch(() => ({
        conversations: [],
      })),
      request<{ notifications: NotificationSummary[] }>('/api/notifications').catch(() => ({
        notifications: [],
      })),
    ]);

    return buildInboxItems(
      conversationsResult.conversations ?? [],
      notificationsResult.notifications ?? []
    );
  },

  getConversationThread(conversationId: number) {
    return request<ConversationThreadData>(`/api/conversations/${conversationId}`, {
      cache: 'no-store',
    });
  },

  sendMessage(conversationId: number, content: string) {
    return request<{ message: ThreadMessage }>(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  markNotificationRead(notificationId: number) {
    return request<unknown>(`/api/notifications/${notificationId}/read`, { method: 'POST' });
  },

  acceptOffer(transactionId: number) {
    return request<{ message: string }>(`/api/offers/${transactionId}/accept`, { method: 'POST' });
  },

  declineOffer(transactionId: number) {
    return request<{ message: string }>(`/api/offers/${transactionId}/decline`, { method: 'POST' });
  },

  editOffer(transactionId: number, payload: EditOfferPayload) {
    return request<{ message: string; details: ThreadOffer['details'] }>(`/api/offers/${transactionId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async getMyListings(): Promise<SerializedShoeListing[]> {
    const data = await request<{ shoeListings: SerializedShoeListing[] }>('/api/users/me/listings');
    return data.shoeListings ?? [];
  },

  async getCurrentUserId(): Promise<string | null> {
    return request<{ user: { id: string } }>('/api/users/me')
      .then((data) => data.user?.id ?? null)
      .catch(() => null);
  },
};
