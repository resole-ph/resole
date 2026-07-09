import { MsgTab, Message } from "../types/inbox.types";
import { apiFetch } from "@/lib/api-client";

function formatTimestamp(value: string | Date | undefined): string {
  if (!value) return '';
  return new Date(value).toLocaleString("en-US", {
    hour12: true,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const InboxService = {
  async getConversations(): Promise<Message[]> {
    const offerRes = await apiFetch<{ conversations: any[] }>(`api/conversations`, {
      method: 'GET'
    });

    const updateRes = await apiFetch<{ notifications: any[]; unreadCount: number }>(`api/notifications`, {
      method: 'GET'
    });

    const offerMsgs: Message[] = (offerRes.conversations ?? []).map((item: any) => {
      const name: string = item.user?.name ?? 'Unknown';
      return {
        id: `o${item.id}`,
        tab: 'offers' as MsgTab,
        sender: name,
        avatarInitial: name.charAt(0).toUpperCase(),
        preview: item.latestMessage?.content ?? '',
        time: formatTimestamp(item.latestMessage?.createdAt ?? item.updatedAt),
        unread: 0, // REPLACE IN THE FUTURE
        isSystem: false
      };
    });

    const updateMsgs: Message[] = (updateRes.notifications ?? []).map((item: any) => {
      return {
        id: `u${item.id}`,
        tab: 'updates' as MsgTab,
        sender: 'Resole',
        avatarInitial: 'R',
        preview: item.body,
        time: formatTimestamp(item.createdAt),
        unread: item.isRead ? 0 : 1,
        isSystem: true
      };
    });

    return [ ...offerMsgs, ...updateMsgs ];
  },

  async getConversationThread(conversationId: number) {
    return apiFetch<{ messages: any[]; offers: any[] }>(`api/conversations/${conversationId}`, {
      method: 'GET',
      cacheTtl: 0,
    });
  },

  async sendMessage(conversationId: number, content: string) {
    return apiFetch<{ message: any }>(`api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: { content },
    });
  },

  async markNotificationRead(notificationId: number) {
    return apiFetch<any>(`api/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },
}
