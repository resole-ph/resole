'use client';

import { useMemo, useState } from 'react';
import { useMyTransactions } from '../queries/profile.queries';
import type { TransactionRow } from '../types/profile.types';

type TxTab = 'sales' | 'swaps' | 'donations';

type Transaction = {
  id: string;
  item: string;
  counterpart: string;
  date: string;
  amount: string;
  status: 'completed' | 'pending' | 'donated';
};

const PESO = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

const DATE = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

/**
 * The server returns one flat row per transaction; this shapes it into what
 * the row component renders. Amount reads differently per type — a donation
 * earns coins, a swap has no price — which is why it is not just a currency
 * format of `amount`.
 */
function toTransaction(row: TransactionRow): Transaction {
  const counterpart =
    row.type === 'donate'
      ? row.charityName ?? 'Charity'
      : row.recipientName ?? row.ownerName ?? 'Unknown';

  const amount =
    row.type === 'donate'
      ? `+${row.coinsEarned ?? 0} coins`
      : row.amount
        ? PESO.format(Number(row.amount))
        : 'Even swap';

  return {
    id: String(row.id),
    item: `${row.shoeBrand} ${row.shoeModel}`,
    counterpart:
      row.type === 'sale'
        ? `Buyer: ${counterpart}`
        : row.type === 'swap'
          ? `Swapped with: ${counterpart}`
          : counterpart,
    date: DATE.format(new Date(row.completedAt ?? row.createdAt)),
    amount,
    status: row.completedAt ? (row.type === 'donate' ? 'donated' : 'completed') : 'pending',
  };
}

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

  // Real history now. This page previously rendered seven hardcoded rows,
  // which meant every account saw the same fictional sales and donations.
  const { data } = useMyTransactions();

  const grouped = useMemo(() => {
    const buckets: Record<TxTab, Transaction[]> = { sales: [], swaps: [], donations: [] };

    for (const row of data ?? []) {
      const tx = toTransaction(row);
      if (row.type === 'sale') buckets.sales.push(tx);
      else if (row.type === 'swap') buckets.swaps.push(tx);
      else if (row.type === 'donate') buckets.donations.push(tx);
    }

    return buckets;
  }, [data]);

  const currentData = grouped[tab];

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
