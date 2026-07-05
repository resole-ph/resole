'use client';

import { useState } from 'react';

type TxTab = 'sales' | 'swaps' | 'donations';

type Transaction = {
  id: string;
  item: string;
  counterpart: string;
  date: string;
  amount: string;
  status: 'completed' | 'pending' | 'donated';
};

const SALES: Transaction[] = [
  { id: 's1', item: 'Jordan 1 Retro High', counterpart: 'Buyer: @jmendoza', date: 'May 28, 2026', amount: '₱18,000', status: 'completed' },
  { id: 's2', item: 'Nike SB Dunk Low', counterpart: 'Buyer: @kevinr', date: 'May 15, 2026', amount: '₱9,500', status: 'completed' },
  { id: 's3', item: 'Adidas Samba OG', counterpart: 'Buyer: @amirag', date: 'May 3, 2026', amount: '₱7,800', status: 'pending' },
];

const SWAPS: Transaction[] = [
  { id: 'w1', item: 'Yeezy 350 v2 → Air Max 97', counterpart: 'Swapped with: @pdc', date: 'May 20, 2026', amount: 'Even swap', status: 'completed' },
  { id: 'w2', item: 'NB 550 → Panda Dunk', counterpart: 'Swapped with: @lramos', date: 'Apr 30, 2026', amount: '+₱2,000', status: 'completed' },
];

const DONATIONS: Transaction[] = [
  { id: 'd1', item: 'Vans Old Skool', counterpart: 'Caritas Manila', date: 'May 22, 2026', amount: '+120 coins', status: 'donated' },
  { id: 'd2', item: 'Converse Chuck 70', counterpart: 'Gawad Kalinga', date: 'Apr 18, 2026', amount: '+80 coins', status: 'donated' },
];

const DATA: Record<TxTab, Transaction[]> = { sales: SALES, swaps: SWAPS, donations: DONATIONS };

const STATUS_STYLES: Record<Transaction['status'], { className: string; label: string }> = {
  completed: { className: 'bg-secondary-container text-on-secondary-container', label: 'Completed' },
  pending: { className: 'bg-tertiary-container/20 text-tertiary', label: 'Pending' },
  donated: { className: 'bg-secondary-container text-on-secondary-container', label: 'Donated' },
};

function TxRow({ tx }: { tx: Transaction }) {
  const status = STATUS_STYLES[tx.status];
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors">
      <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">
        <span className="material-symbols-outlined">footprint</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-on-surface truncate">{tx.item}</p>
        <p className="text-[13px] text-on-surface-variant">{tx.counterpart}</p>
        <p className="text-[13px] text-on-surface-variant">{tx.date}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[14px] font-bold text-on-surface">{tx.amount}</p>
        <span className={`inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${status.className}`}>
          {status.label}
        </span>
      </div>
    </div>
  );
}

export default function TransactionsTabs() {
  const [tab, setTab] = useState<TxTab>('sales');
  const currentData = DATA[tab];

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-2">
      <div className="flex bg-surface-container rounded-xl p-1 m-3 mb-2">
        {(['sales', 'swaps', 'donations'] as TxTab[]).map((t) => (
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
            {t}
          </button>
        ))}
      </div>

      <div className="px-1 pb-1">
        {currentData.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <span className="material-symbols-outlined text-[40px] text-outline-variant">receipt_long</span>
            <p className="text-on-surface-variant text-[14px] mt-3">No {tab} yet</p>
          </div>
        ) : (
          currentData.map((tx) => <TxRow key={tx.id} tx={tx} />)
        )}
      </div>
    </section>
  );
}
