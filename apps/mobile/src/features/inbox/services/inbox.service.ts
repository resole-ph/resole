import { Ionicons } from "@expo/vector-icons";
import { MsgTab, Message, PickedInboxPhoto, SystemUpdate, ThreadMessage } from "../types/inbox.types";
import { apiFetch } from "@/lib/api-client";

/** The one and only Resole row: every system update as a single thread. */
export const RESOLE_THREAD_ID = 'resole';

const NOTIFICATION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  listing: 'bar-chart-outline',
  offer: 'pricetag-outline',
  promotion: 'gift-outline',
  system: 'shield-checkmark-outline',
};

function formatTimestamp(value: string | Date | undefined): string {
  if (!value) return '';
  return new Date(value).toLocaleString("en-US", {
    hour12: true,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function isConversationNotification(item: any) {
  return item.entityType === 'conversation' && !!item.entityId;
}

function buildResoleThread(notifications: any[]): Message {
  const latest = notifications[notifications.length - 1];
  const unread = notifications.filter((item) => !item.isRead);

  return {
    id: RESOLE_THREAD_ID,
    tab: 'updates',
    sender: 'Resole',
    avatarInitial: 'R',
    avatarColor: '#EFF6FF',
    icon: 'notifications-outline',
    isSystem: true,
    preview: latest.body,
    time: formatTimestamp(latest.createdAt),
    unread: unread.length,
    notificationIds: unread.map((item: any) => item.id),
    updates: notifications.map((item: any): SystemUpdate => ({
      id: item.id,
      title: item.title,
      body: item.body,
      icon: NOTIFICATION_ICONS[item.category] ?? 'notifications-outline',
      time: formatTimestamp(item.createdAt),
      isRead: item.isRead,
    })),
  };
}

export const InboxService = {
  /**
   * One row per counterparty thread, plus a single aggregated Resole thread.
   *
   * Every message sent to you also writes a `conversation`-scoped notification.
   * Listed on their own those show up as anonymous "Resole" rows that duplicate
   * a real thread and can't be replied to, so they are folded back into the
   * conversation they point at and only drive its unread badge.
   */
  async getConversations(): Promise<Message[]> {
    const offerRes = await apiFetch<{ conversations: any[] }>(`api/conversations`, {
      method: 'GET'
    });

    const updateRes = await apiFetch<{ notifications: any[]; unreadCount: number }>(`api/notifications`, {
      method: 'GET'
    });

    const conversations = offerRes.conversations ?? [];
    const notifications = updateRes.notifications ?? [];
    const conversationIds = new Set(conversations.map((item: any) => String(item.id)));

    const unreadByConversation = new Map<string, number[]>();
    for (const item of notifications) {
      if (!isConversationNotification(item) || item.isRead) continue;
      if (!conversationIds.has(String(item.entityId))) continue;

      const bucket = unreadByConversation.get(String(item.entityId)) ?? [];
      bucket.push(item.id);
      unreadByConversation.set(String(item.entityId), bucket);
    }

    const offerMsgs: Message[] = conversations.map((item: any) => {
      const name: string = item.user?.name ?? 'Unknown';
      const notificationIds = unreadByConversation.get(String(item.id)) ?? [];

      return {
        id: `o${item.id}`,
        tab: 'offers' as MsgTab,
        sender: name,
        userId: item.user?.id,
        avatarInitial: name.charAt(0).toUpperCase() || '?',
        preview: item.latestMessage?.attachment ? 'Photo' : item.latestMessage?.content ?? 'No messages yet',
        time: formatTimestamp(item.latestMessage?.createdAt ?? item.updatedAt),
        unread: notificationIds.length,
        notificationIds,
        isSystem: false
      };
    });

    // Anything not tied to a thread of mine — offer accepted/declined, promos,
    // system notices — collapses into a single Resole thread.
    const systemNotifications = notifications
      .filter((item: any) => !isConversationNotification(item) || !conversationIds.has(String(item.entityId)))
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return [
      ...offerMsgs,
      ...(systemNotifications.length ? [buildResoleThread(systemNotifications)] : []),
    ];
  },

  async getConversationThread(conversationId: number) {
    return apiFetch<{ messages: ThreadMessage[]; offers: any[] }>(`api/conversations/${conversationId}`, {
      method: 'GET',
      cacheTtl: 0,
    });
  },

  async sendMessage(conversationId: number, content: string) {
    return apiFetch<{ message: ThreadMessage }>(`api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: { content },
    });
  },

  async sendPhoto(conversationId: number, photo: PickedInboxPhoto) {
    const form = new FormData();
    const extension = photo.uri.split('.').pop()?.toLowerCase();
    const fallbackMime = extension === 'png'
      ? 'image/png'
      : extension === 'webp'
        ? 'image/webp'
        : 'image/jpeg';

    form.append('photo', {
      uri: photo.uri,
      name: photo.fileName ?? `photo-${Date.now()}.${extension ?? 'jpg'}`,
      type: photo.mimeType ?? fallbackMime,
    } as unknown as Blob);

    return apiFetch<{ message: ThreadMessage }>(`api/conversations/${conversationId}/photos`, {
      method: 'POST',
      body: form,
    });
  },

  async markNotificationRead(notificationId: number) {
    return apiFetch<any>(`api/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },

  async markNotificationsRead(notificationIds: number[]) {
    return Promise.all(notificationIds.map((id) => this.markNotificationRead(id)));
  },
}
