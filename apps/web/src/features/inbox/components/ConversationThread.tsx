'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/providers/AuthProvider';
import type { Conversation, ChatMessage, OfferData } from '../data/inbox.mock';

interface ConversationThreadProps {
  conversation: Conversation | null;
  onBack: () => void;
  onOfferAction: (messageId: string, status: 'accepted' | 'declined') => void;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

function ThreadHeader({ convo, onBack }: { convo: Conversation; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant shrink-0">
      <button
        onClick={onBack}
        aria-label="Back to conversations"
        className="md:hidden w-9 h-9 flex items-center justify-center text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: convo.avatarColor }}
      >
        {convo.isSystem && convo.icon ? (
          <span className="material-symbols-outlined text-primary text-[18px]">{convo.icon}</span>
        ) : (
          <span className="text-primary font-bold text-[14px]">{convo.avatarInitial}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-on-surface font-semibold text-[14px] truncate">{convo.sender}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {!convo.isSystem && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: convo.isOnline ? '#10B981' : '#D1D5DB' }}
            />
          )}
          <span className="text-on-surface-variant text-[12px]">{convo.subtitle}</span>
        </div>
      </div>
    </div>
  );
}

function SystemBubble({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex flex-col items-center my-2 px-8">
      <div className="bg-surface-container rounded-2xl px-4 py-2.5 max-w-sm">
        <p className="text-on-surface-variant text-[12px] text-center leading-relaxed">{text}</p>
      </div>
      <span className="text-outline text-[11px] mt-1">{time}</span>
    </div>
  );
}

function TextBubble({ msg }: { msg: ChatMessage }) {
  const isMe = msg.from === 'me';
  return (
    <div className={`flex mb-1 px-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[70%] md:max-w-[60%]">
        <div
          className={[
            'rounded-2xl px-4 py-2.5 whitespace-pre-wrap',
            isMe
              ? 'bg-primary text-on-primary rounded-tr-sm'
              : 'bg-surface-container-lowest text-on-surface rounded-tl-sm border border-outline-variant',
          ].join(' ')}
        >
          <p className="text-[14px] leading-relaxed">{msg.text}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <span className="text-outline text-[11px]">{msg.time}</span>
          {isMe && msg.seen && <span className="text-primary text-[11px]">· Seen</span>}
        </div>
      </div>
    </div>
  );
}

function OfferCard({
  msg,
  onAccept,
  onDecline,
}: {
  msg: ChatMessage;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const offer = msg.offer!;
  const isSwap = offer.type === 'swap';
  const status = offer.status;

  return (
    <div className={`flex px-4 mb-1 ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 w-full max-w-[85%] md:max-w-sm shadow-[0px_2px_8px_rgba(0,0,0,0.05)]">
        <div className="flex items-center mb-3">
          <div className="bg-secondary-container/30 rounded-xl px-2.5 py-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-[14px]">
              {isSwap ? 'sync_alt' : 'sell'}
            </span>
            <span className="text-primary text-[12px] font-semibold">{isSwap ? 'Swap Offer' : 'Buy Offer'}</span>
          </div>
        </div>

        <div className="w-full h-20 rounded-xl bg-surface-container flex items-center justify-center mb-3 text-outline overflow-hidden">
          {offer.image ? (
            <img src={offer.image} alt={offer.item} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-[28px]">footprint</span>
          )}
        </div>

        {isSwap ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-on-surface font-semibold text-[13px] flex-1 truncate">{offer.swapItem || 'Your Offer'}</span>
              <span className="material-symbols-outlined text-outline text-[16px] shrink-0">sync_alt</span>
              <span className="text-on-surface font-semibold text-[13px] flex-1 text-right truncate">{offer.item || 'Their Shoe'}</span>
            </div>
            <p className="text-on-surface-variant text-[12px] mb-3">Size {offer.size || 'N/A'}</p>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-on-surface font-semibold text-[13px] truncate">{offer.item}</p>
            <p className="text-on-surface-variant text-[12px]">Size {offer.size || 'N/A'}</p>
            <p className="text-primary font-bold text-[17px] mt-1">{offer.price}</p>
          </div>
        )}

        {status === 'pending' ? (
          msg.from === 'me' ? (
            <div className="rounded-xl bg-surface-container py-2.5 flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-outline text-[15px]">hourglass_empty</span>
              <span className="font-semibold text-[12px] text-on-surface-variant">Waiting for response</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={onDecline}
                className="flex-1 bg-surface-container rounded-xl py-2.5 text-on-surface-variant font-semibold text-[12px] hover:bg-surface-container-high transition-colors"
              >
                Decline
              </button>
              <button
                onClick={onAccept}
                className="flex-1 bg-primary rounded-xl py-2.5 text-on-primary font-semibold text-[12px] hover:opacity-90 transition-opacity"
              >
                Accept
              </button>
            </div>
          )
        ) : (
          <div
            className={[
              'rounded-xl py-2.5 flex items-center justify-center gap-1.5',
              status === 'accepted' ? 'bg-secondary-container/30' : 'bg-surface-container',
            ].join(' ')}
          >
            <span
              className={`material-symbols-outlined text-[15px] ${status === 'accepted' ? 'text-secondary' : 'text-outline'}`}
            >
              {status === 'accepted' ? 'check_circle' : 'cancel'}
            </span>
            <span
              className={`font-semibold text-[12px] ${status === 'accepted' ? 'text-secondary' : 'text-on-surface-variant'}`}
            >
              {status === 'accepted' ? 'Offer accepted' : 'Offer declined'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function InputBar({ onSend, isSending }: { onSend: (text: string) => void, isSending: boolean }) {
  const [text, setText] = useState('');

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setText('');
  }

  return (
    <div className="border-t border-outline-variant px-4 py-3 shrink-0">
      <div className="flex items-end gap-2">
        <div className="flex-1 bg-surface-container rounded-2xl px-4 py-2.5 max-h-28">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message..."
            rows={1}
            className="w-full bg-transparent text-on-surface text-[14px] outline-none resize-none placeholder:text-outline"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!text.trim() || isSending}
          aria-label="Send message"
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            text.trim() && !isSending ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'
          }`}
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-outline border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ConversationThread({ conversation, onBack, onOfferAction }: ConversationThreadProps) {
  const { user } = useAuth();
  
  const { data, mutate, error } = useSWR(
    conversation ? `/api/conversations/${conversation.id}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );
  
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (text: string) => {
    if (!conversation || !text.trim() || !user) return;
    setIsSending(true);
    
    // Optimistic Update
    mutate((prevData: any) => {
      if (!prevData) return prevData;
      return {
        ...prevData,
        messages: [
          ...(prevData.messages || []),
          {
            id: Date.now(),
            userId: user.id,
            content: text,
            createdAt: new Date().toISOString()
          }
        ]
      }
    }, false);

    try {
      const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.trim() })
      });
      if (!res.ok) throw new Error('Failed to send message');
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };
  
  const handleOfferStatus = async (messageId: string, status: 'accepted' | 'declined', offerTransactionId: number) => {
    try {
      const endpoint = status === 'accepted' ? 'accept' : 'decline';
      const res = await fetch(`/api/offers/${offerTransactionId}/${endpoint}`, { method: 'POST' });
      if (!res.ok) throw new Error(`Failed to ${endpoint} offer`);
      mutate();
    } catch (err) {
      console.error(err);
      alert(`Could not ${status} the offer.`);
    }
  };

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 bg-surface-container-lowest rounded-2xl border border-outline-variant">
        <span className="material-symbols-outlined text-[48px] text-outline-variant">forum</span>
        <p className="text-on-surface-variant text-[14px] mt-3">Select a conversation to view messages</p>
      </div>
    );
  }

  // Parse backend messages to UI structure
  const messages = data?.messages || [];
  const offers = data?.offers || [];
  
  const uiMessages: ChatMessage[] = messages.map((m: any): ChatMessage => {
    const isMe = m.userId === user?.id;
    const time = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Check if this message has a transaction attached to it
    const attachedOffer = m.transactionId ? offers.find((o: any) => o.id === m.transactionId) : null;
    
    let offerObj: OfferData | undefined;
    if (attachedOffer) {
      offerObj = {
        type: attachedOffer.type === 'swap' ? 'swap' : 'buy',
        item: attachedOffer.shoe?.model || 'Shoe Listing',
        size: attachedOffer.listing?.size,
        price: attachedOffer.type === 'sale' ? `₱${Number(attachedOffer.details?.price).toLocaleString()}` : undefined,
        swapItem: attachedOffer.type === 'swap' ? 'Multiple/Requested Shoes' : undefined,
        status: attachedOffer.isCompleted ? 'accepted' : (attachedOffer.isAccepted ? 'accepted' : attachedOffer.isAccepted === false ? 'declined' : 'pending'),
        image: attachedOffer.listing?.imageUrlSide || attachedOffer.listing?.imageUrlTop,
      };
    }

    return {
      id: String(m.id),
      from: isMe ? 'me' : 'them',
      text: m.content,
      time: time,
      seen: false, // We don't have seen status yet
      offer: offerObj,
      _rawOfferTx: m.transactionId
    } as ChatMessage & { _rawOfferTx?: number };
  });

  return (
    <div className="flex flex-col flex-1 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
      <ThreadHeader convo={conversation} onBack={onBack} />

      <div className="flex-1 overflow-y-auto py-4">
        {!data && !error && (
          <div className="flex justify-center mt-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {uiMessages.map((msg: any) => {
          if (msg.offer) {
            return (
              <div key={`offer-${msg.id}`}>
                <OfferCard
                  msg={msg}
                  onAccept={() => handleOfferStatus(msg.id, 'accepted', msg._rawOfferTx)}
                  onDecline={() => handleOfferStatus(msg.id, 'declined', msg._rawOfferTx)}
                />
                {msg.text && <TextBubble msg={msg} />}
              </div>
            );
          }
          return <TextBubble key={msg.id} msg={msg} />;
        })}
      </div>

      <InputBar onSend={handleSend} isSending={isSending} />
    </div>
  );
}
