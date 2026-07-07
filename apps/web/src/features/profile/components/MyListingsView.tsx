'use client';

import { useState } from 'react';

type Tab = 'active' | 'pending';

type Listing = {
  id: string;
  name: string;
  size: string;
  price: string;
  daysLeft?: number;
};

const INITIAL_ACTIVE: Listing[] = [
  { id: '1', name: 'Nike Air Max 90', size: 'US 10', price: '₱4,500', daysLeft: 12 },
  { id: '2', name: 'Adidas Ultraboost 22', size: 'US 9.5', price: '₱6,200', daysLeft: 7 },
  { id: '3', name: 'Jordan 1 Retro High', size: 'US 11', price: '₱18,000', daysLeft: 3 },
  { id: '4', name: 'New Balance 550', size: 'US 8', price: '₱3,800', daysLeft: 21 },
  { id: '5', name: 'Converse Chuck 70', size: 'US 9', price: '₱2,800', daysLeft: 14 },
];

const PENDING_LISTINGS: Listing[] = [
  { id: 'p1', name: 'Nike Dunk Low Panda', size: 'US 9', price: '₱7,500' },
  { id: 'p2', name: 'Jordan 1 Mid Chicago', size: 'US 10', price: '₱9,000' },
];

function Thumbnail() {
  return (
    <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center text-outline shrink-0">
      <span className="material-symbols-outlined text-[26px]">footprint</span>
    </div>
  );
}

function ActiveCard({ item, onDelete }: { item: Listing; onDelete: () => void }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-4 flex items-center gap-3">
      <Thumbnail />

      <div className="flex-1 min-w-0">
        <p className="text-on-surface font-semibold text-[14px] truncate">{item.name}</p>
        <p className="text-on-surface-variant text-[12px] mt-0.5">{item.size}</p>
        <p className="text-primary font-bold text-[14px] mt-1">{item.price}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          <span className="text-on-surface-variant text-[12px]">{item.daysLeft}d left</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
          aria-label={`Edit ${item.name}`}
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button
          onClick={onDelete}
          className="w-9 h-9 rounded-lg bg-error-container/40 flex items-center justify-center text-error hover:bg-error-container transition-colors"
          aria-label={`Remove ${item.name}`}
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  );
}

function PendingCard({ item }: { item: Listing }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-4 flex items-center gap-3">
      <Thumbnail />

      <div className="flex-1 min-w-0">
        <p className="text-on-surface font-semibold text-[14px] truncate">{item.name}</p>
        <p className="text-on-surface-variant text-[12px] mt-0.5">{item.size}</p>
        <p className="text-primary font-bold text-[14px] mt-1">{item.price}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
          <span className="text-tertiary text-[12px]">Pending AI review</span>
        </div>
      </div>

      <span className="shrink-0 bg-tertiary-container/20 text-tertiary font-semibold text-[12px] px-3 py-1.5 rounded-lg">
        In Review
      </span>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-16">
      <span className="material-symbols-outlined text-[40px] text-outline-variant">inventory_2</span>
      <p className="text-on-surface-variant text-[14px] mt-3">{label}</p>
    </div>
  );
}

export default function MyListingsView() {
  const [tab, setTab] = useState<Tab>('active');
  const [active, setActive] = useState<Listing[]>(INITIAL_ACTIVE);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Remove ${name}? This will take it off the market.`)) {
      setActive((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const counts: Record<Tab, number> = { active: active.length, pending: PENDING_LISTINGS.length };

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-2">
      <div className="flex bg-surface-container rounded-xl p-1 m-3 mb-2">
        {(['active', 'pending'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'flex-1 py-2 rounded-lg text-[13px] font-semibold capitalize transition-colors',
              tab === t
                ? 'bg-surface-container-lowest text-on-surface shadow-[0px_2px_8px_rgba(0,0,0,0.06)]'
                : 'text-on-surface-variant',
            ].join(' ')}
          >
            {t} <span className={tab === t ? 'text-primary' : 'text-on-surface-variant'}>({counts[t]})</span>
          </button>
        ))}
      </div>

      <div className="px-1 pb-1 flex flex-col gap-3">
        {tab === 'active' &&
          (active.length === 0 ? (
            <EmptyState label="No active listings" />
          ) : (
            active.map((item) => (
              <ActiveCard key={item.id} item={item} onDelete={() => handleDelete(item.id, item.name)} />
            ))
          ))}

        {tab === 'pending' &&
          (PENDING_LISTINGS.length === 0 ? (
            <EmptyState label="No listings pending review" />
          ) : (
            PENDING_LISTINGS.map((item) => <PendingCard key={item.id} item={item} />)
          ))}
      </div>
    </section>
  );
}
