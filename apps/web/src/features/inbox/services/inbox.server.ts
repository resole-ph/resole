import { getUserConversations } from './service';
import { getNotificationsByUserId } from '@/features/notifications/services/service';
import { buildInboxItems } from '../utils/inbox-items';
import type { ConversationSummary, InboxItem, NotificationSummary } from '../types/inbox.types';

/**
 * The inbox list, assembled on the server for the initial render.
 *
 * Same result as `InboxClient.getInboxItems`, minus the browser's two HTTP hops
 * — the services are called directly, so this costs one round trip to the
 * database rather than a request that then makes its own.
 */
export async function getInboxItemsForUser(userId: string): Promise<InboxItem[]> {
  const [conversations, notifications] = await Promise.all([
    getUserConversations(userId),
    getNotificationsByUserId(userId),
  ]);

  // Serialized to match what the API routes hand the browser, so both paths feed
  // the builder identical input.
  return buildInboxItems(
    JSON.parse(JSON.stringify(conversations ?? [])) as ConversationSummary[],
    JSON.parse(JSON.stringify(notifications ?? [])) as NotificationSummary[]
  );
}
