import { Ionicons } from '@expo/vector-icons';

export type MsgTab = 'all' | 'offers' | 'updates';

/** One system notification, rendered as a bubble inside the Resole thread. */
export type SystemUpdate = {
  id: number;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  time: string;
  isRead: boolean;
};

export type Message = {
  id: string;
  tab: MsgTab;
  sender: string;
  /** The other party's user id — absent for the system/Resole thread. */
  userId?: string;
  avatarColor?: string;
  avatarInitial: string;
  preview: string;
  time: string;
  unread: number;
  icon?: keyof typeof Ionicons.glyphMap;
  isSystem: boolean;
  /** Unread notification ids folded into this row, cleared when it is opened. */
  notificationIds: number[];
  /** Set on the single aggregated "Resole" row — every system update, oldest first. */
  updates?: SystemUpdate[];
};

export type PhotoAttachment = {
  type: 'image';
  mimeType: string;
  size: number;
  width: number;
  height: number;
  fileName: string;
  url: string | null;
};

export type ThreadMessage = {
  id: number;
  userId: string;
  conversationId: number;
  transactionId: number | null;
  content: string;
  attachment: PhotoAttachment | null;
  createdAt: string;
};

export type PickedInboxPhoto = {
  uri: string;
  fileName: string | null;
  mimeType: string | null;
};
