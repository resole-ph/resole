import { MsgTab, Message } from "../types/inbox.types";
import { apiFetch } from "@/lib/api-client";

export const InboxService = {
  async getConversations(): Promise<Message[]> {
    const offerRes = await apiFetch<any>(`api/conversations`, {
      method: 'GET'
    });

    const updateRes = await apiFetch<any>(`api/notifications`, {
      method: 'GET'
    });

    const offerMsgs: Message[] = offerRes.map((item: any) => {
      return {
        id: `o${item.id}`,
        tab: 'offers',
        sender: item.user.name,
        avatarInitial: item.user.name.toUpperCase().get(0),
        preview: item.latestMessage.content,
        time: item.latestMessage.createdAt.toLocaleString("en-US", {
          hour12: true,
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        unread: 0, // REPLACE IN THE FUTURE
        isSystem: false
      };
    })

    const updateMsgs: Message[] = updateRes.map((item: any) => {
      return {
        id: `u${item.id}`,
        tab: 'updates',
        sender: 'Resole',
        avatarInitial: 'R',
        preview: item.body,
        time: item.createdAt.toLocaleString("en-US", {
          hour12: true,
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        unread: item.isRead ? 0 : 1,
        isSystem: true
      };
    })

    return [ ...offerMsgs, ...updateMsgs ];
  }
}