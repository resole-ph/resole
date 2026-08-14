import { describe, expect, it } from 'vitest';
import { RESOLE_THREAD_ID, buildInboxItems } from '@/features/inbox/utils/inbox-items';
import type {
  ConversationSummary,
  NotificationSummary,
} from '@/features/inbox/types/inbox.types';

function conversation(overrides: Partial<ConversationSummary> = {}): ConversationSummary {
  return {
    id: 1,
    updatedAt: '2026-05-01T10:00:00.000Z',
    user: { id: 'user_2', name: 'Marco' },
    transaction: { type: 'sale' },
    latestMessage: {
      content: 'Is this still available?',
      attachment: null,
      createdAt: '2026-05-01T10:00:00.000Z',
    },
    ...overrides,
  };
}

function notification(overrides: Partial<NotificationSummary> = {}): NotificationSummary {
  return {
    id: 100,
    category: 'system',
    title: 'Welcome',
    body: 'Welcome to Resole.',
    entityType: null,
    entityId: null,
    isRead: false,
    createdAt: '2026-05-01T09:00:00.000Z',
    ...overrides,
  };
}

/** Convenience: a conversation-scoped notification pointing at conversation `id`. */
function conversationNotification(id: number, overrides: Partial<NotificationSummary> = {}) {
  return notification({
    entityType: 'conversation',
    entityId: String(id),
    category: 'offer',
    ...overrides,
  });
}

describe('buildInboxItems', () => {
  it('returns nothing when there is nothing to show', () => {
    expect(buildInboxItems([], [])).toEqual([]);
  });

  describe('conversation threads', () => {
    it('builds one row per conversation', () => {
      const items = buildInboxItems([conversation()], []);

      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({
        id: 'o1',
        numericId: 1,
        tab: 'offers',
        sender: 'Marco',
        avatarInitial: 'M',
        isSystem: false,
        otherUserId: 'user_2',
        preview: 'Is this still available?',
      });
    });

    it('labels swap conversations distinctly from offer conversations', () => {
      const [swap] = buildInboxItems([conversation({ transaction: { type: 'swap' } })], []);
      const [sale] = buildInboxItems([conversation()], []);

      expect(swap.subtitle).toBe('Swap conversation');
      expect(sale.subtitle).toBe('Offer conversation');
    });

    it('previews an attachment as "Photo" instead of empty text', () => {
      const [item] = buildInboxItems(
        [
          conversation({
            latestMessage: {
              content: '',
              attachment: { path: 'x.jpg' } as never,
              createdAt: '2026-05-01T10:00:00.000Z',
            },
          }),
        ],
        []
      );

      expect(item.preview).toBe('Photo');
    });

    it('falls back to placeholder text for a thread with no messages', () => {
      const [item] = buildInboxItems([conversation({ latestMessage: null })], []);
      expect(item.preview).toBe('No messages yet');
    });

    it('falls back to the conversation updatedAt when there is no message', () => {
      const [item] = buildInboxItems([conversation({ latestMessage: null })], []);
      expect(item.rawTime).toBe('2026-05-01T10:00:00.000Z');
    });

    it('handles a conversation whose counterparty could not be resolved', () => {
      const [item] = buildInboxItems([conversation({ user: null })], []);
      expect(item.sender).toBe('Unknown');
      expect(item.avatarInitial).toBe('U');
      expect(item.otherUserId).toBeUndefined();
    });

    it('assigns a stable avatar colour for the same user', () => {
      const [first] = buildInboxItems([conversation()], []);
      const [second] = buildInboxItems([conversation({ id: 2 })], []);
      expect(first.avatarColor).toBe(second.avatarColor);
    });

    it('carries no raw timestamps that have already been localized', () => {
      // Rows must stay locale- and timezone-free so server and browser agree.
      const [item] = buildInboxItems([conversation()], []);
      expect(item.rawTime).toBe('2026-05-01T10:00:00.000Z');
    });
  });

  describe('conversation-scoped notifications', () => {
    it('folds an unread notification into its own thread instead of creating a Resole row', () => {
      const items = buildInboxItems([conversation({ id: 1 })], [conversationNotification(1)]);

      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('o1');
      expect(items[0].unread).toBe(1);
      expect(items[0].notificationIds).toEqual([100]);
    });

    it('counts several unread notifications against the same thread', () => {
      const items = buildInboxItems(
        [conversation({ id: 1 })],
        [conversationNotification(1, { id: 100 }), conversationNotification(1, { id: 101 })]
      );

      expect(items).toHaveLength(1);
      expect(items[0].unread).toBe(2);
      expect(items[0].notificationIds).toEqual([100, 101]);
    });

    it('ignores notifications that have already been read', () => {
      const items = buildInboxItems(
        [conversation({ id: 1 })],
        [conversationNotification(1, { isRead: true })]
      );

      expect(items).toHaveLength(1);
      expect(items[0].unread).toBe(0);
      expect(items[0].notificationIds).toEqual([]);
    });

    it('routes a notification for an unknown conversation to Resole', () => {
      // Otherwise it would silently vanish from the inbox entirely.
      const items = buildInboxItems([conversation({ id: 1 })], [conversationNotification(999)]);

      expect(items).toHaveLength(2);
      expect(items.map((item) => item.id)).toContain(RESOLE_THREAD_ID);
    });
  });

  describe('the Resole thread', () => {
    it('does not exist when there are no system notifications', () => {
      const items = buildInboxItems([conversation()], [conversationNotification(1)]);
      expect(items.some((item) => item.isSystem)).toBe(false);
    });

    it('collapses every system notification into exactly one row', () => {
      const items = buildInboxItems(
        [],
        [
          notification({ id: 1, category: 'promotion', createdAt: '2026-05-01T09:00:00.000Z' }),
          notification({ id: 2, category: 'listing', createdAt: '2026-05-02T09:00:00.000Z' }),
          notification({ id: 3, category: 'offer', createdAt: '2026-05-03T09:00:00.000Z' }),
        ]
      );

      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({
        id: RESOLE_THREAD_ID,
        tab: 'updates',
        sender: 'Resole',
        isSystem: true,
      });
      expect(items[0].updates).toHaveLength(3);
    });

    it('previews the newest update and orders the thread oldest first', () => {
      const items = buildInboxItems(
        [],
        [
          notification({ id: 2, body: 'Newer', createdAt: '2026-05-03T09:00:00.000Z' }),
          notification({ id: 1, body: 'Older', createdAt: '2026-05-01T09:00:00.000Z' }),
        ]
      );

      expect(items[0].preview).toBe('Newer');
      expect(items[0].updates?.map((update) => update.body)).toEqual(['Older', 'Newer']);
    });

    it('badges only the unread updates', () => {
      const items = buildInboxItems(
        [],
        [
          notification({ id: 1, isRead: true }),
          notification({ id: 2, isRead: false }),
          notification({ id: 3, isRead: false }),
        ]
      );

      expect(items[0].unread).toBe(2);
      expect(items[0].notificationIds).toEqual([2, 3]);
    });

    it('gives each update an icon for its category', () => {
      const items = buildInboxItems(
        [],
        [
          notification({ id: 1, category: 'listing' }),
          notification({ id: 2, category: 'promotion' }),
          notification({ id: 3, category: 'something-new' }),
        ]
      );

      expect(items[0].updates?.map((update) => update.icon)).toEqual([
        'bar_chart',
        'redeem',
        'notifications',
      ]);
    });
  });

  describe('ordering', () => {
    it('sorts every row newest first', () => {
      const items = buildInboxItems(
        [
          conversation({
            id: 1,
            latestMessage: { content: 'old', attachment: null, createdAt: '2026-05-01T00:00:00.000Z' },
          }),
          conversation({
            id: 2,
            latestMessage: { content: 'new', attachment: null, createdAt: '2026-05-05T00:00:00.000Z' },
          }),
        ],
        [notification({ id: 1, createdAt: '2026-05-03T00:00:00.000Z' })]
      );

      expect(items.map((item) => item.id)).toEqual(['o2', RESOLE_THREAD_ID, 'o1']);
    });
  });
});
