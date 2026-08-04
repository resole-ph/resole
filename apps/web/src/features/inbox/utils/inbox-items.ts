import type { ConversationSummary, InboxItem, InboxTab, NotificationSummary } from '../types/inbox.types';

/**
 * Builds the conversation list from raw conversations + notifications.
 *
 * Shared by the server (which renders the first list into the HTML) and the
 * browser (which rebuilds it on refresh), so it must stay pure and free of
 * anything locale- or timezone-dependent — rows carry raw timestamps and are
 * formatted at render time by `<LocalTime>`.
 */

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

/** The one and only Resole row: every system update as a single thread. */
export const RESOLE_THREAD_ID = 'resole';

function isConversationNotification(item: NotificationSummary) {
  return item.entityType === 'conversation' && !!item.entityId;
}

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
    rawTime: latest.createdAt ?? null,
    unread: unread.length,
    notificationIds: unread.map((item) => item.id),
    updates: notifications.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      icon: NOTIFICATION_ICONS[item.category] ?? 'notifications',
      createdAt: item.createdAt,
      isRead: item.isRead,
    })),
  };
}

/**
 * One row per counterparty thread, plus standalone system updates.
 *
 * Every message sent to you also writes a `conversation`-scoped notification.
 * Listed on their own those show up as anonymous "Resole" rows that duplicate
 * a real thread and can't be replied to, so they are folded back into the
 * conversation they point at and only drive its unread badge.
 */
export function buildInboxItems(
  conversations: ConversationSummary[],
  notifications: NotificationSummary[]
): InboxItem[] {
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
      otherUserId: item.user?.id,
      subtitle: item.transaction?.type === 'swap' ? 'Swap conversation' : 'Offer conversation',
      preview: item.latestMessage?.attachment ? 'Photo' : item.latestMessage?.content ?? 'No messages yet',
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
}
