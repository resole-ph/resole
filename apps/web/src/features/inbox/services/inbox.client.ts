import type { SerializedShoeListing } from '@/features/shoe/utils/listing-dto';
import type {
  ConversationThreadData,
  InboxItem,
  InboxTab,
  ThreadMessage,
} from '../types/inbox.types';

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

const AVATAR_COLORS = ['#DBEAFE', '#EDE9FE', '#D1FAE5', '#FCE7F3', '#FEF3C7', '#E0F2FE'];

function avatarColorFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

const NOTIFICATION_ICONS: Record<string, string> = {
  listing: 'bar_chart',
  offer: 'local_offer',
  promotion: 'redeem',
  system: 'verified_user',
};

/** "9:41 AM" today, "Yesterday", "Mon" this week, otherwise "May 20". */
export function formatListTime(value: string | Date | null | undefined): string {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);

  if (dayDiff === 0) return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (dayDiff === 1) return 'Yesterday';
  if (dayDiff < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function formatMessageTime(value: string | Date | null | undefined): string {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const isToday = date.toDateString() === new Date().toDateString();
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return isToday ? time : `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
}

type ConversationSummary = {
  id: number;
  updatedAt: string;
  user: { id: string; name: string } | null;
  transaction: { type: string } | null;
  latestMessage: { content: string; createdAt: string } | null;
};

type NotificationSummary = {
  id: number;
  category: string;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
};

function isConversationNotification(item: NotificationSummary) {
  return item.entityType === 'conversation' && !!item.entityId;
}

/** The one and only Resole row: every system update as a single thread. */
export const RESOLE_THREAD_ID = 'resole';

function buildResoleThread(notifications: NotificationSummary[]): InboxItem {
  const latest = notifications[notifications.length - 1];
  const unread = notifications.filter((item) => !item.isRead);

  return {
    id: RESOLE_THREAD_ID,
    numericId: 0,
    tab: 'updates',
    sender: 'Resole',
    avatarInitial: 'R',
    avatarColor: '#EFF6FF',
    icon: 'notifications',
    isSystem: true,
    subtitle: 'Updates & alerts',
    preview: latest.body,
    time: formatListTime(latest.createdAt),
    rawTime: latest.createdAt ?? null,
    unread: unread.length,
    notificationIds: unread.map((item) => item.id),
    updates: notifications.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      icon: NOTIFICATION_ICONS[item.category] ?? 'notifications',
      time: formatMessageTime(item.createdAt),
      isRead: item.isRead,
    })),
  };
}

export const InboxClient = {
  /**
   * One row per counterparty thread, plus standalone system updates.
   *
   * Every message sent to you also writes a `conversation`-scoped notification.
   * Listed on their own those show up as anonymous "Resole" rows that duplicate
   * a real thread and can't be replied to, so they are folded back into the
   * conversation they point at and only drive its unread badge.
   */
  async getInboxItems(): Promise<InboxItem[]> {
    const [conversationsResult, notificationsResult] = await Promise.all([
      request<{ conversations: ConversationSummary[] }>('/api/conversations').catch(() => ({
        conversations: [],
      })),
      request<{ notifications: NotificationSummary[] }>('/api/notifications').catch(() => ({
        notifications: [],
      })),
    ]);

    const conversations = conversationsResult.conversations ?? [];
    const notifications = notificationsResult.notifications ?? [];
    const conversationIds = new Set(conversations.map((item) => String(item.id)));

    const unreadByConversation = new Map<string, number[]>();
    for (const item of notifications) {
      if (!isConversationNotification(item) || item.isRead) continue;
      if (!conversationIds.has(item.entityId!)) continue;

      const bucket = unreadByConversation.get(item.entityId!) ?? [];
      bucket.push(item.id);
      unreadByConversation.set(item.entityId!, bucket);
    }

    const threads: InboxItem[] = conversations.map((item) => {
      const name: string = item.user?.name ?? 'Unknown';
      const timestamp = item.latestMessage?.createdAt ?? item.updatedAt;
      const notificationIds = unreadByConversation.get(String(item.id)) ?? [];

      return {
        id: `o${item.id}`,
        numericId: item.id,
        tab: 'offers' as InboxTab,
        sender: name,
        avatarInitial: name.charAt(0).toUpperCase() || '?',
        avatarColor: avatarColorFor(item.user?.id ?? name),
        isSystem: false,
        subtitle: item.transaction?.type === 'swap' ? 'Swap conversation' : 'Offer conversation',
        preview: item.latestMessage?.content ?? 'No messages yet',
        time: formatListTime(timestamp),
        rawTime: timestamp ?? null,
        unread: notificationIds.length,
        notificationIds,
      };
    });

    // Anything not tied to a thread of mine — offer accepted/declined, promos,
    // system notices — belongs to Resole. They collapse into a single thread
    // rather than one row per notification.
    const systemNotifications = notifications
      .filter((item) => !isConversationNotification(item) || !conversationIds.has(item.entityId!))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const resoleThread: InboxItem[] = systemNotifications.length
      ? [buildResoleThread(systemNotifications)]
      : [];

    return [...threads, ...resoleThread].sort(
      (a, b) => new Date(b.rawTime ?? 0).getTime() - new Date(a.rawTime ?? 0).getTime()
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

  async getListing(listingId: number): Promise<SerializedShoeListing | null> {
    return request<{ shoeListing: SerializedShoeListing }>(`/api/listings/${listingId}`)
      .then((data) => data.shoeListing)
      .catch(() => null);
  },

  async getCurrentUserId(): Promise<string | null> {
    return request<{ user: { id: string } }>('/api/users/me')
      .then((data) => data.user?.id ?? null)
      .catch(() => null);
  },
};
