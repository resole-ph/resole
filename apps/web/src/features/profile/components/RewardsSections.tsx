'use client';

import { useMemo } from 'react';
import {
  useMyStats,
  useRedeemOptions,
  useWalletTransactions,
} from '../queries/profile.queries';
import type { RedeemOptionRow, WalletTransactionRow } from '../types/profile.types';

type RedeemOption = {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: string;
  highlight?: boolean;
};

type CoinTx = {
  id: string;
  label: string;
  sub: string;
  amount: number;
  date: string;
  icon: string;
};

const DATE = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

/** Vouchers carry a type string rather than an icon name, so map it here. */
const VOUCHER_ICONS: Record<string, string> = {
  discount: 'local_offer',
  shipping: 'local_shipping',
  charity: 'volunteer_activism',
  boost: 'confirmation_number',
};

function toRedeemOption(row: RedeemOptionRow, index: number): RedeemOption {
  return {
    id: String(row.id),
    title: row.name,
    description: row.description ?? '',
    cost: row.amount,
    icon: VOUCHER_ICONS[row.voucherType] ?? 'redeem',
    // The design highlights the first card; the server orders by newest and
    // largest, so that is the one worth featuring.
    highlight: index === 0,
  };
}

const TX_ICONS: Record<string, string> = {
  donate: 'favorite',
  sale: 'sell',
  swap: 'sync',
};

function toCoinTx(row: WalletTransactionRow): CoinTx {
  const label =
    row.type === 'donate'
      ? `Donated ${row.listing.brand} ${row.listing.model}`
      : row.type === 'sale'
        ? `Sold ${row.listing.brand} ${row.listing.model}`
        : `Swapped ${row.listing.brand} ${row.listing.model}`;

  return {
    id: String(row.id),
    label,
    sub: row.isLister ? 'As lister' : 'As recipient',
    amount: row.coinsEarned,
    date: DATE.format(new Date(row.createdAt)),
    icon: TX_ICONS[row.type] ?? 'redeem',
  };
}

function RedeemCard({ option, balance }: { option: RedeemOption; balance: number }) {
  const canAfford = balance >= option.cost;

  return (
    <div
      className={[
        'rounded-xl p-4 flex items-center gap-3',
        option.highlight ? 'bg-secondary text-on-secondary' : 'bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.05)]',
      ].join(' ')}
    >
      <div
        className={[
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
          option.highlight ? 'bg-white/15' : 'bg-secondary/10 text-secondary',
        ].join(' ')}
      >
        <span className="material-symbols-outlined text-[20px]">{option.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-[14px] ${option.highlight ? '' : 'text-on-surface'}`}>{option.title}</p>
        <p className={`text-[13px] mt-0.5 ${option.highlight ? 'opacity-80' : 'text-on-surface-variant'}`}>
          {option.description}
        </p>
      </div>
      <button
        disabled={!canAfford}
        className={[
          'shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-colors',
          !canAfford
            ? 'bg-surface-container text-on-surface-variant cursor-not-allowed'
            : option.highlight
              ? 'bg-white text-secondary hover:bg-surface-bright'
              : 'bg-secondary text-on-secondary hover:opacity-90',
        ].join(' ')}
      >
        {option.cost} pts
      </button>
    </div>
  );
}

function HistoryRow({ tx }: { tx: CoinTx }) {
  const isPositive = tx.amount > 0;
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl">
      <div
        className={[
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
          isPositive ? 'bg-secondary/10 text-secondary' : 'bg-tertiary-container/20 text-tertiary',
        ].join(' ')}
      >
        <span className="material-symbols-outlined text-[20px]">{tx.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-on-surface truncate">{tx.label}</p>
        <p className="text-[13px] text-on-surface-variant">{tx.sub}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-[14px] font-bold ${isPositive ? 'text-secondary' : 'text-tertiary'}`}>
          {isPositive ? '+' : ''}
          {tx.amount}
        </p>
        <p className="text-[13px] text-on-surface-variant">{tx.date}</p>
      </div>
    </div>
  );
}

export default function RewardsSections() {
  // Both lists were hardcoded before, and the affordability check compared
  // costs against a fixed 1,240 balance rather than the user's own.
  const { data: redeemData } = useRedeemOptions();
  const { data: walletData } = useWalletTransactions();
  // Shares the cache entry with RecycleCoinsCard, which is on this same page.
  const { data: stats } = useMyStats();

  const balance = Number(stats?.coinBalance ?? 0);

  const redeemOptions = useMemo(
    () => (redeemData ?? []).map(toRedeemOption),
    [redeemData]
  );

  const history = useMemo(() => (walletData ?? []).map(toCoinTx), [walletData]);

  return (
    <>
      <section>
        <h3 className="text-[16px] font-semibold text-on-surface mb-3">Redeem</h3>
        {redeemOptions.length === 0 ? (
          <p className="text-on-surface-variant text-[14px]">No rewards available right now.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {redeemOptions.map((option) => (
              <RedeemCard key={option.id} option={option} balance={balance} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-[16px] font-semibold text-on-surface mb-3">History</h3>
        {history.length === 0 ? (
          <p className="text-on-surface-variant text-[14px]">No coin activity yet.</p>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] divide-y divide-surface-variant">
            {history.map((tx) => (
              <HistoryRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
