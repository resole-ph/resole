'use client';

import { useCallback, useEffect, useState } from 'react';
import ConversationList from './ConversationList';
import ConversationThread from './ConversationThread';
import { InboxClient } from '../services/inbox.client';
import type {
  InboxItem,
  ListTab,
  OfferExtras,
  ThreadMessage,
  ThreadOffer,
} from '../types/inbox.types';

/**
 * `initialConversations` / `initialUserId` come from the server render. When they
 * are present the list is already on screen and no start-up fetch is needed; the
 * component still works without them, which is what a signed-out visitor gets.
 */
export default function InboxView({
  initialConversations,
  initialUserId,
}: {
  initialConversations?: InboxItem[];
  initialUserId?: string;
} = {}) {
  const hasServerData = initialConversations != null;

  const [conversations, setConversations] = useState<InboxItem[]>(initialConversations ?? []);
  const [isLoadingList, setIsLoadingList] = useState(!hasServerData);
  const [tab, setTab] = useState<ListTab>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(initialUserId ?? null);

  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [offersById, setOffersById] = useState<Record<number, ThreadOffer>>({});
  const [offerExtrasById, setOfferExtrasById] = useState<Record<number, OfferExtras>>({});

  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRespondingToOffer, setIsRespondingToOffer] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;
  const totalUnread = conversations.reduce((n, c) => n + c.unread, 0);

  useEffect(() => {
    if (hasServerData) return;

    (async () => {
      try {
        const [userId, items] = await Promise.all([
          InboxClient.getCurrentUserId(),
          InboxClient.getInboxItems(),
        ]);
        setCurrentUserId(userId);
        setConversations(items);
      } catch (error) {
        console.error('Failed to load inbox:', error);
      } finally {
        setIsLoadingList(false);
      }
    })();
  }, [hasServerData]);

  const loadThread = useCallback(async (conversationId: number) => {
    setIsLoadingThread(true);
    setThreadError(null);
    try {
      // The thread arrives with the listings behind its offers already attached,
      // so there is no second round of requests before the cards can render.
      const thread = await InboxClient.getConversationThread(conversationId);
      setMessages(thread.messages ?? []);

      const offers = thread.offers ?? [];
      setOffersById(Object.fromEntries(offers.map((offer) => [offer.id, offer])));
      setOfferExtrasById(thread.offerExtras ?? {});
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setThreadError('Conversation could not be loaded.');
    } finally {
      setIsLoadingThread(false);
    }
  }, []);

  async function handleSelectConversation(id: string) {
    setSelectedId(id);
    setMessages([]);
    setOffersById({});
    setOfferExtrasById({});
    setThreadError(null);

    const item = conversations.find((c) => c.id === id);
    if (!item) return;

    // Threads fold in one notification per received message, so opening the row
    // clears all of them at once.
    if (item.notificationIds.length > 0) {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unread: 0, notificationIds: [] } : c))
      );
      Promise.all(
        item.notificationIds.map((notificationId) =>
          InboxClient.markNotificationRead(notificationId)
        )
      ).catch((error) => console.error('Failed to mark notifications read:', error));
    }

    if (item.isSystem) return;

    await loadThread(item.numericId);
  }

  async function handleSend(text: string) {
    if (!selected || selected.isSystem) return;

    setIsSending(true);
    try {
      const { message } = await InboxClient.sendMessage(selected.numericId, text);
      setMessages((prev) => [...prev, message]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selected.id ? { ...c, preview: text, rawTime: new Date().toISOString() } : c
        )
      );
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  }

  async function handleOfferResponse(transactionId: number, accept: boolean) {
    setIsRespondingToOffer(true);
    try {
      if (accept) {
        await InboxClient.acceptOffer(transactionId);
      } else {
        await InboxClient.declineOffer(transactionId);
      }
      setOffersById((prev) => ({
        ...prev,
        [transactionId]: { ...prev[transactionId], isAccepted: accept },
      }));
    } catch (error) {
      console.error(`Failed to ${accept ? 'accept' : 'decline'} offer:`, error);
    } finally {
      setIsRespondingToOffer(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[24px] leading-8 font-bold text-on-surface">Inbox</h1>
        {totalUnread > 0 && (
          <span className="bg-primary text-on-primary text-[12px] font-bold rounded-full px-3 py-1">
            {totalUnread} new
          </span>
        )}
      </div>

      <div className="flex gap-5 h-[calc(100vh-220px)] min-h-[480px]">
        <ConversationList
          conversations={conversations}
          tab={tab}
          selectedId={selectedId}
          isLoading={isLoadingList}
          onSelectTab={setTab}
          onSelectConversation={handleSelectConversation}
          className={`w-full md:w-[360px] shrink-0 ${selectedId ? 'hidden md:flex' : 'flex'}`}
        />

        <div className={`flex-1 ${selectedId ? 'flex' : 'hidden md:flex'}`}>
          <ConversationThread
            item={selected}
            messages={messages}
            offersById={offersById}
            offerExtrasById={offerExtrasById}
            currentUserId={currentUserId}
            isLoading={isLoadingThread}
            isSending={isSending}
            isRespondingToOffer={isRespondingToOffer}
            error={threadError}
            onBack={() => setSelectedId(null)}
            onSend={handleSend}
            onAccept={(id) => handleOfferResponse(id, true)}
            onDecline={(id) => handleOfferResponse(id, false)}
          />
        </div>
      </div>
    </div>
  );
}
