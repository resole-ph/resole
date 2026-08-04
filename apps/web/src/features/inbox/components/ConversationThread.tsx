'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import LocalTime from './LocalTime';
import { formatMessageTime } from '../utils/format-time';
import type {
  InboxItem,
  OfferExtras,
  OfferStatus,
  SystemUpdate,
  ThreadMessage,
  ThreadOffer,
} from '../types/inbox.types';

interface ConversationThreadProps {
  item: InboxItem | null;
  messages: ThreadMessage[];
  offersById: Record<number, ThreadOffer>;
  offerExtrasById: Record<number, OfferExtras>;
  currentUserId: string | null;
  isLoading: boolean;
  isSending: boolean;
  isRespondingToOffer: boolean;
  error: string | null;
  onBack: () => void;
  onSend: (text: string) => void;
  onAccept: (transactionId: number) => void;
  onDecline: (transactionId: number) => void;
}

function getOfferStatus(offer: ThreadOffer): OfferStatus {
  if (offer.isAccepted === true) return 'accepted';
  if (offer.isAccepted === false) return 'declined';
  return 'pending';
}

function ThreadHeader({ convo, onBack }: { convo: InboxItem; onBack: () => void }) {
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
        {convo.otherUserId ? (
          <Link
            href={`/users/${convo.otherUserId}`}
            className="text-on-surface font-semibold text-[14px] truncate block w-fit max-w-full hover:text-primary hover:underline transition-colors"
          >
            {convo.sender}
          </Link>
        ) : (
          <p className="text-on-surface font-semibold text-[14px] truncate">{convo.sender}</p>
        )}
        <p className="text-on-surface-variant text-[12px] mt-0.5 truncate">{convo.subtitle}</p>
      </div>
    </div>
  );
}

function UpdateBubble({ update }: { update: SystemUpdate }) {
  return (
    <div className="flex flex-col items-start my-2 px-4">
      <div className="bg-surface-container rounded-2xl px-4 py-3 max-w-sm flex gap-3 items-start">
        <span
          className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center shrink-0"
          aria-hidden
        >
          <span className="material-symbols-outlined text-primary text-[18px]">{update.icon}</span>
        </span>
        <div className="min-w-0">
          <p className="text-on-surface text-[13px] font-semibold">{update.title}</p>
          <p className="text-on-surface-variant text-[12px] leading-relaxed mt-0.5">{update.body}</p>
        </div>
      </div>
      <span className="text-outline text-[11px] mt-1 ml-1">
        <LocalTime value={update.createdAt} variant="message" />
      </span>
    </div>
  );
}

function TextBubble({ msg, isMe }: { msg: ThreadMessage; isMe: boolean }) {
  return (
    <div className={`flex mb-1 px-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[70%] md:max-w-[60%]">
        <div
          className={[
            'rounded-2xl px-4 py-2.5',
            isMe
              ? 'bg-primary text-on-primary rounded-tr-sm'
              : 'bg-surface-container-lowest text-on-surface rounded-tl-sm border border-outline-variant',
          ].join(' ')}
        >
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <span className="text-outline text-[11px]">{formatMessageTime(msg.createdAt)}</span>
          {msg.isEdited && <span className="text-outline text-[11px]">· Edited</span>}
        </div>
      </div>
    </div>
  );
}

function PhotoBubble({ msg, isMe }: { msg: ThreadMessage; isMe: boolean }) {
  return (
    <div className={`flex mb-1 px-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div>
        {msg.attachment?.url ? (
          <a
            href={msg.attachment.url}
            target="_blank"
            rel="noreferrer"
            aria-label="Open photo attachment"
            className="block w-64 max-w-[70vw] max-h-80 overflow-hidden rounded-2xl bg-surface-container border border-outline-variant"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- signed URLs cannot use the static host allowlist */}
            <img
              src={msg.attachment.url}
              alt="Photo attachment"
              className="w-full max-h-80 object-contain"
            />
          </a>
        ) : (
          <div className="w-64 h-40 rounded-2xl bg-surface-container border border-outline-variant flex flex-col items-center justify-center text-outline">
            <span className="material-symbols-outlined text-[28px]">image</span>
            <span className="text-[12px] mt-1">Photo unavailable</span>
          </div>
        )}
        <div className={`mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
          <span className="text-outline text-[11px]">{formatMessageTime(msg.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

function OfferCard({
  offer,
  extras,
  isMe,
  canRespond,
  disabled,
  time,
  onAccept,
  onDecline,
}: {
  offer: ThreadOffer;
  extras: OfferExtras | undefined;
  isMe: boolean;
  canRespond: boolean;
  disabled: boolean;
  time: string;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const isSwap = offer.type === 'swap';
  const status = getOfferStatus(offer);
  const listing = extras?.listing ?? null;
  const swapItem = extras?.swapItem ?? null;

  return (
    <div className={`px-4 mb-1 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 w-[85%] max-w-sm shadow-[0px_2px_8px_rgba(0,0,0,0.05)]">
        <div className="flex items-center mb-3">
          <div className="bg-secondary-container/30 rounded-xl px-2.5 py-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-[14px]">
              {isSwap ? 'sync_alt' : 'sell'}
            </span>
            <span className="text-primary text-[12px] font-semibold">{isSwap ? 'Swap Offer' : 'Buy Offer'}</span>
          </div>
        </div>

        <div className="w-full h-20 rounded-xl bg-surface-container flex items-center justify-center mb-3 text-outline overflow-hidden">
          {listing?.imageUrl ? (
            <img src={listing.imageUrl} alt={listing.model} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-[28px]">footprint</span>
          )}
        </div>

        {isSwap ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-on-surface font-semibold text-[13px] flex-1 truncate">
                {swapItem?.model ?? 'Their listing'}
              </span>
              <span className="material-symbols-outlined text-outline text-[16px] shrink-0">sync_alt</span>
              <span className="text-on-surface font-semibold text-[13px] flex-1 text-right truncate">
                {listing?.model ?? 'Your listing'}
              </span>
            </div>
            <p className="text-on-surface-variant text-[12px] mb-3">Size US {listing?.size ?? '—'} · Item swap</p>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-on-surface font-semibold text-[13px] truncate">{listing?.model ?? 'Listing'}</p>
            {listing?.size && <p className="text-on-surface-variant text-[12px]">Size US {listing.size}</p>}
            <p className="text-primary font-bold text-[17px] mt-1">
              ₱{Number(offer.details?.price ?? 0).toLocaleString()}
            </p>
          </div>
        )}

        {status === 'pending' ? (
          canRespond ? (
            <div className="flex gap-2">
              <button
                onClick={onDecline}
                disabled={disabled}
                className="flex-1 bg-surface-container rounded-xl py-2.5 text-on-surface-variant font-semibold text-[12px] hover:bg-surface-container-high transition-colors disabled:opacity-60"
              >
                Decline
              </button>
              <button
                onClick={onAccept}
                disabled={disabled}
                className="flex-1 bg-primary rounded-xl py-2.5 text-on-primary font-semibold text-[12px] hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                Accept
              </button>
            </div>
          ) : (
            <div className="rounded-xl py-2.5 flex items-center justify-center gap-1.5 bg-surface-container">
              <span className="material-symbols-outlined text-outline text-[15px]">schedule</span>
              <span className="font-semibold text-[12px] text-on-surface-variant">
                Waiting for the seller&apos;s response
              </span>
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

      <span className="text-outline text-[11px] mt-1 mx-1 block">{time}</span>
    </div>
  );
}

function InputBar({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [text, setText] = useState('');

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
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
          disabled={!text.trim() || disabled}
          aria-label="Send message"
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            text.trim() && !disabled ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
        </button>
      </div>
    </div>
  );
}

export default function ConversationThread({
  item,
  messages,
  offersById,
  offerExtrasById,
  currentUserId,
  isLoading,
  isSending,
  isRespondingToOffer,
  error,
  onBack,
  onSend,
  onAccept,
  onDecline,
}: ConversationThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, item?.id]);

  const shell = 'flex flex-col flex-1 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden';

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 bg-surface-container-lowest rounded-2xl border border-outline-variant">
        <span className="material-symbols-outlined text-[48px] text-outline-variant">forum</span>
        <p className="text-on-surface-variant text-[14px] mt-3">Select a conversation to view messages</p>
      </div>
    );
  }

  return (
    <div className={shell}>
      <ThreadHeader convo={item} onBack={onBack} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <span className="material-symbols-outlined text-[32px] text-outline-variant animate-spin">progress_activity</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full px-8">
            <span className="material-symbols-outlined text-[40px] text-outline-variant">error</span>
            <p className="text-on-surface-variant text-[14px] mt-3 text-center">{error}</p>
          </div>
        ) : item.isSystem ? (
          (item.updates ?? []).map((update) => <UpdateBubble key={update.id} update={update} />)
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-on-surface-variant text-[14px]">No messages yet — say hello 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const offer = msg.transactionId != null ? offersById[msg.transactionId] : undefined;
            const extras = msg.transactionId != null ? offerExtrasById[msg.transactionId] : undefined;
            const isMe = msg.userId === currentUserId;

            return (
              <div key={msg.id}>
                {msg.attachment ? <PhotoBubble msg={msg} isMe={isMe} /> : <TextBubble msg={msg} isMe={isMe} />}
                {offer && (
                  <OfferCard
                    offer={offer}
                    extras={extras}
                    isMe={isMe}
                    canRespond={!!currentUserId && extras?.listing?.seller.id === currentUserId}
                    disabled={isRespondingToOffer}
                    time={formatMessageTime(msg.createdAt)}
                    onAccept={() => onAccept(offer.id)}
                    onDecline={() => onDecline(offer.id)}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {item.isSystem ? (
        <div className="border-t border-outline-variant py-3 text-center shrink-0">
          <p className="text-outline text-[12px]">This is a system notification — replies are not supported</p>
        </div>
      ) : (
        <InputBar onSend={onSend} disabled={isSending || isLoading} />
      )}
    </div>
  );
}
