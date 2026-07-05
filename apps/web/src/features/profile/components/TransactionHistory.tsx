type HistoryItem = {
  title: string;
  subtitle: string;
  amount: string;
  amountTone: 'positive' | 'coins' | 'neutral';
  date: string;
  icon: string;
  iconTint: string;
};

const HISTORY: HistoryItem[] = [
  {
    title: 'Swap Completed',
    subtitle: "Yeezy 350 v2 for Jordan 4 'Military'",
    amount: '+₱500 Fee',
    amountTone: 'positive',
    date: 'Jun 24, 2026',
    icon: 'sync',
    iconTint: 'bg-secondary-container text-on-secondary-container',
  },
  {
    title: 'Recycle Bonus',
    subtitle: 'Donated 3 pairs of old sneakers',
    amount: '+150 Coins',
    amountTone: 'coins',
    date: 'Jun 21, 2026',
    icon: 'eco',
    iconTint: 'bg-secondary/10 text-secondary',
  },
  {
    title: 'Purchase',
    subtitle: "New Balance 550 'White/Grey'",
    amount: '-₱6,500',
    amountTone: 'neutral',
    date: 'Jun 18, 2026',
    icon: 'shopping_bag',
    iconTint: 'bg-error-container text-on-error-container',
  },
];

const AMOUNT_TONE_CLASS: Record<HistoryItem['amountTone'], string> = {
  positive: 'text-secondary',
  coins: 'text-secondary',
  neutral: 'text-on-surface',
};

export default function TransactionHistory() {
  return (
    <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[24px] leading-8 font-bold">Recent History</h3>
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="text-[14px] font-semibold">Filter:</span>
          <select className="bg-transparent border-none focus:ring-0 text-[14px] font-semibold py-0">
            <option>All Activity</option>
            <option>Sales</option>
            <option>Swaps</option>
            <option>Rewards</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        {HISTORY.map((item) => (
          <div
            key={item.title + item.date}
            className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 flex items-center justify-center rounded-full ${item.iconTint}`}>
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <div>
                <p className="text-[14px] font-semibold">{item.title}</p>
                <p className="text-[14px] text-on-surface-variant">{item.subtitle}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-[14px] font-bold ${AMOUNT_TONE_CLASS[item.amountTone]}`}>{item.amount}</p>
              <p className="text-[14px] text-on-surface-variant">{item.date}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-2 text-on-surface-variant hover:text-primary text-[14px] font-semibold flex items-center justify-center gap-2 group transition-all">
        Load More History
        <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">
          expand_more
        </span>
      </button>
    </section>
  );
}
