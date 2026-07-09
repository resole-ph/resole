const BALANCE = 1_240;

type RedeemOption = {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: string;
  highlight?: boolean;
};

const REDEEM_OPTIONS: RedeemOption[] = [
  { id: 'r1', title: '₱200 off next purchase', description: 'Apply as discount on any listing', cost: 200, icon: 'local_offer', highlight: true },
  { id: 'r2', title: 'Donate 100 coins', description: 'We plant a tree in your name', cost: 100, icon: 'eco' },
  { id: 'r3', title: 'Priority listing boost', description: 'Push your listing to the top for 7 days', cost: 300, icon: 'confirmation_number' },
  { id: 'r4', title: 'Charity bundle', description: 'Funds ₱500 worth of charity goods', cost: 500, icon: 'volunteer_activism' },
];

type CoinTx = {
  id: string;
  label: string;
  sub: string;
  amount: number;
  date: string;
  icon: string;
};

const COIN_HISTORY: CoinTx[] = [
  { id: '1', label: 'Donated Converse Chuck 70', sub: 'Gawad Kalinga', amount: 80, date: 'May 22, 2026', icon: 'favorite' },
  { id: '2', label: 'Recycled Vans Old Skool', sub: 'Drop-off verified', amount: 120, date: 'May 18, 2026', icon: 'sync' },
  { id: '3', label: 'Listing milestone', sub: '10th listing bonus', amount: 50, date: 'May 10, 2026', icon: 'star' },
  { id: '4', label: 'Redeemed discount', sub: '₱200 off on purchase', amount: -200, date: 'May 5, 2026', icon: 'redeem' },
  { id: '5', label: 'Donated Puma RS-X', sub: 'Caritas Manila', amount: 100, date: 'Apr 30, 2026', icon: 'favorite' },
];

function RedeemCard({ option }: { option: RedeemOption }) {
  const canAfford = BALANCE >= option.cost;

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
  return (
    <>
      <section>
        <h3 className="text-[16px] font-semibold text-on-surface mb-3">Redeem</h3>
        <div className="flex flex-col gap-3">
          {REDEEM_OPTIONS.map((option) => (
            <RedeemCard key={option.id} option={option} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-[16px] font-semibold text-on-surface mb-3">History</h3>
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] divide-y divide-surface-variant">
          {COIN_HISTORY.map((tx) => (
            <HistoryRow key={tx.id} tx={tx} />
          ))}
        </div>
      </section>
    </>
  );
}
