'use client';

import { useState } from 'react';
import ConversationList from './ConversationList';
import ConversationThread from './ConversationThread';
import { MOCK_CONVERSATIONS, type Conversation, type ConversationTab } from '../data/inbox.mock';

type ListTab = 'all' | ConversationTab;

export default function InboxView() {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [tab, setTab] = useState<ListTab>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const totalUnread = conversations.reduce((n, c) => n + c.unread, 0);
  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  function handleSelectConversation(id: string) {
    setSelectedId(id);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  }

  function handleSend(text: string) {
    if (!selectedId) return;
    const newMsg = {
      id: String(Date.now()),
      from: 'me' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, messages: [...c.messages, newMsg], preview: text, time: newMsg.time }
          : c
      )
    );
  }

  function handleOfferAction(messageId: string, status: 'accepted' | 'declined') {
    if (!selectedId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId && m.offer ? { ...m, offer: { ...m.offer, status } } : m
              ),
            }
          : c
      )
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
