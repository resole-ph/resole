import type { SerializedShoeListing } from '@/features/shoe/utils/listing-dto';
import type { MessageAttachment } from '@/db/subschemas/inbox.schema';

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
  /** The other participant, when this row is a real thread — links to their profile. */
  otherUserId?: string;
  subtitle: string;
  preview: string;
  /** Raw ISO timestamp — sorted on, and localized at render by `<LocalTime>`. */
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
  createdAt: string;
  isRead: boolean;
};

/** A conversation row as `/api/conversations` returns it. */
export type ConversationSummary = {
  id: number;
  updatedAt: string;
  user: { id: string; name: string } | null;
  transaction: { type: string } | null;
  latestMessage: { content: string; attachment: MessageAttachment | null; createdAt: string } | null;
};

/** A notification as `/api/notifications` returns it. */
export type NotificationSummary = {
  id: number;
  category: string;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
};

export type ThreadMessage = {
  id: number;
  userId: string;
  conversationId: number;
  transactionId: number | null;
  content: string;
  attachment: (MessageAttachment & { url: string | null }) | null;
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
  details: { price?: string; items?: { itemId: number }[]; topUp?: string | null } | null;
};

export type OfferExtras = {
  listing: SerializedShoeListing | null;
  swapItem: SerializedShoeListing | null;
};

export type ConversationThreadData = {
  messages: ThreadMessage[];
  offers: ThreadOffer[];
  /** Listings behind each offer, keyed by offer id — resolved server-side. */
  offerExtras: Record<number, OfferExtras>;
};

/** Payload for `PATCH /api/offers/[id]` — shape depends on the offer's type. */
export type EditOfferPayload = { price: number } | { listings: number[]; topUp: number };
