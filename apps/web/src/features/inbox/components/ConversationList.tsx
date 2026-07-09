'use client';

import type { Conversation, ConversationTab } from '../data/inbox.mock';

type ListTab = 'all' | ConversationTab;

const TAB_LABELS: { id: ListTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'offers', label: 'Offers' },
  { id: 'updates', label: 'Updates' },
];

interface ConversationListProps {
  conversations: Conversation[];
  tab: ListTab;
  selectedId: string | null;
  onSelectTab: (tab: ListTab) => void;
  onSelectConversation: (id: string) => void;
  className?: string;
}

function Avatar({
  color,
  initial,
  icon,
  isSystem,
}: {
  color: string;
  initial: string;
  icon?: string;
  isSystem: boolean;
}) {
  return (
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: color }}
    >
      {isSystem && icon ? (
        <span className="material-symbols-outlined text-primary text-[22px]">{icon}</span>
      ) : (
        <span className="text-primary font-bold text-[16px]">{initial}</span>
      )}
    </div>
  );
}

function ConversationRow({
  convo,
  isSelected,
  onClick,
}: {
  convo: Conversation;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isUnread = convo.unread > 0;
  return (
    <button
      onClick={onClick}
      className={[
        'w-full flex items-center gap-3 px-4 py-3.5 border-b border-outline-variant text-left transition-colors',
        isSelected ? 'bg-secondary-container/20' : 'hover:bg-surface-container-low',
      ].join(' ')}
    >
      <Avatar color={convo.avatarColor} initial={convo.avatarInitial} icon={convo.icon} isSystem={convo.isSystem} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={`text-[14px] truncate ${isUnread ? 'font-bold text-on-surface' : 'font-semibold text-on-surface-variant'}`}>
            {convo.sender}
          </span>
          <span className={`text-[11px] shrink-0 ${isUnread ? 'text-primary font-semibold' : 'text-outline'}`}>
            {convo.time}
          </span>
        </div>
        <p className={`text-[12px] leading-relaxed line-clamp-2 ${isUnread ? 'text-on-surface' : 'text-on-surface-variant'}`}>
          {convo.preview}
        </p>
      </div>

      {isUnread ? (
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
          <span className="text-white text-[11px] font-bold">{convo.unread}</span>
        </div>
      ) : (
        <span className="material-symbols-outlined text-outline-variant text-[16px] shrink-0">chevron_right</span>
      )}
    </button>
  );
}

export default function ConversationList({
  conversations,
  tab,
  selectedId,
  onSelectTab,
  onSelectConversation,
  className,
}: ConversationListProps) {
  const filtered = tab === 'all' ? conversations : conversations.filter((c) => c.tab === tab);

  return (
    <div className={`flex flex-col bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden ${className ?? ''}`}>
      <div className="flex bg-surface-container rounded-xl p-1 m-3 mb-2 shrink-0">
        {TAB_LABELS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onSelectTab(id)}
            className={[
              'flex-1 py-2 rounded-lg text-[13px] font-semibold transition-colors',
              tab === id
                ? 'bg-surface-container-lowest text-on-surface shadow-[0px_2px_8px_rgba(0,0,0,0.06)]'
                : 'text-on-surface-variant',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <span className="material-symbols-outlined text-[40px] text-outline-variant">mail</span>
            <p className="text-on-surface-variant text-[14px] mt-3">No messages here</p>
          </div>
        ) : (
          filtered.map((convo) => (
            <ConversationRow
              key={convo.id}
              convo={convo}
              isSelected={convo.id === selectedId}
              onClick={() => onSelectConversation(convo.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
