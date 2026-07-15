'use client';

import { useState } from 'react';
import useSWR from 'swr';
import ConversationList from './ConversationList';
import ConversationThread from './ConversationThread';
import { type Conversation, type ConversationTab } from '../data/inbox.mock';
import { useAuthGate } from '@/providers/AuthGateProvider';

type ListTab = 'all' | ConversationTab;

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function InboxView() {
  const { data, error } = useSWR('/api/conversations', fetcher, { refreshInterval: 5000 });
  const [tab, setTab] = useState<ListTab>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Map API conversations to the UI mock shape
  const conversations: Conversation[] = data?.conversations?.map((conv: any) => {
    return {
      id: String(conv.id),
      tab: 'offers' as ConversationTab, // Everything peer-to-peer is an offer for now
      sender: `@${conv.user.name.toLowerCase().replace(/\s+/g, '')}`,
      avatarInitial: conv.user.name.charAt(0).toUpperCase(),
      avatarColor: '#EFF6FF', // Static blue for now, or could use random logic
      isSystem: false,
      isOnline: true, // We don't have presence yet
      subtitle: 'Online now',
      preview: conv.latestMessage?.content || 'Started a conversation',
      time: conv.latestMessage?.createdAt 
        ? new Date(conv.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : '',
      unread: 0,
      messages: [] // Messages are fetched in ConversationThread
    };
  }) || [];

  const totalUnread = conversations.reduce((n, c) => n + c.unread, 0);
  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  function handleSelectConversation(id: string) {
    setSelectedId(id);
  }

  // Handle send logic from the thread (Optimistic Update)
  function handleSend(text: string) {}

  // Handle offer action logic from the thread (Optimistic Update)
  function handleOfferAction(messageId: string, status: 'accepted' | 'declined') {}

  if (!data && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant text-[14px] mt-4 font-medium">Loading inbox...</p>
      </div>
    );
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
          onSelectTab={setTab}
          onSelectConversation={handleSelectConversation}
          className={`w-full md:w-[360px] shrink-0 ${selectedId ? 'hidden md:flex' : 'flex'}`}
        />

        <div className={`flex-1 ${selectedId ? 'flex' : 'hidden md:flex'}`}>
          <ConversationThread
            conversation={selected}
            onBack={() => setSelectedId(null)}
            onSend={handleSend}
            onOfferAction={handleOfferAction}
          />
        </div>
      </div>
    </div>
  );
}
