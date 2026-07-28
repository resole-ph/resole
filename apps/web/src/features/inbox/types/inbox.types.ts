import type { SerializedShoeListing } from '@/features/shoe/utils/listing-dto';

/** Client-side inbox types. Server/Drizzle types live in `./types.ts`. */

export type InboxTab = 'offers' | 'updates';
export type ListTab = 'all' | InboxTab;

/** A row in the conversation list — either a real thread or a system notification. */
export type InboxItem = {
  /** Prefixed id: `o<conversationId>` for threads, `u<notificationId>` for notifications. */
  id: string;
  numericId: number;
  tab: InboxTab;
  sender: string;
  avatarInitial: string;
  avatarColor: string;
  icon?: string;
  isSystem: boolean;
  subtitle: string;
  preview: string;
  time: string;
  /** Raw ISO timestamp behind `time`, kept for sorting. */
  rawTime: string | null;
  unread: number;
  /** Unread notification ids folded into this row, cleared when it is opened. */
  notificationIds: number[];
  /** Set on the single aggregated "Resole" row — every system update, oldest first. */
  updates?: SystemUpdate[];
};

/** One system notification, rendered as a bubble inside the Resole thread. */
export type SystemUpdate = {
  id: number;
  title: string;
  body: string;
  icon: string;
  time: string;
  isRead: boolean;
};

export type ThreadMessage = {
  id: number;
  userId: string;
  conversationId: number;
  transactionId: number | null;
  content: string;
  isEdited: boolean;
  createdAt: string;
};

export type OfferStatus = 'pending' | 'accepted' | 'declined';

/** Transaction + type-specific details, as returned by `/api/conversations/[id]`. */
export type ThreadOffer = {
  id: number;
  type: 'sale' | 'swap' | 'donation';
  listingId: number | null;
  isAccepted: boolean | null;
  isCompleted: boolean;
  details: { price?: string; items?: { itemId: number }[] } | null;
};

export type OfferExtras = {
  listing: SerializedShoeListing | null;
  swapItem: SerializedShoeListing | null;
};

export type ConversationThreadData = {
  messages: ThreadMessage[];
  offers: ThreadOffer[];
};
