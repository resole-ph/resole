const ANALYTICS = [
  { label: 'Profile Views', value: '1,240', delta: '+18%', icon: 'visibility', tint: 'text-primary bg-primary/10' },
  { label: 'Watchers', value: '84', delta: '+5%', icon: 'group', tint: 'text-tertiary bg-tertiary/10' },
  { label: 'Saved Items', value: '31', delta: null, icon: 'bookmark', tint: 'text-error bg-error/10' },
];

export default function RewardsBento() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recycle Coins balance */}
      <div className="lg:col-span-2 bg-secondary text-on-secondary p-8 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[14px] font-semibold tracking-[0.1em] opacity-80 uppercase">
                Available Balance
              </p>
              <h2 className="text-[40px] leading-[48px] font-bold tracking-tight mt-2">
                1,240 Recycle Coins
              </h2>
            </div>
            <span className="material-symbols-outlined text-[48px]">eco</span>
          </div>
          <p className="text-[16px] mt-4 max-w-xs opacity-90">
            Redeem these for platform fees, shipping labels, or exclusive sneaker drops.
          </p>
        </div>
        <div className="mt-8 flex gap-3">
          <button className="bg-white text-secondary px-6 py-2 rounded-full text-[14px] font-semibold hover:bg-surface-bright transition-colors">
            Redeem Now
          </button>
          <button className="bg-white/15 border border-white/30 text-white px-6 py-2 rounded-full text-[14px] font-semibold hover:bg-white/25 transition-colors">
            View Perks
          </button>
        </div>
      </div>

      {/* Seller analytics */}
      <div className="flex flex-col gap-4">
        {ANALYTICS.map(({ label, value, delta, icon, tint }) => (
          <div
            key={label}
            className="bg-surface-container-lowest p-5 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between"
          >
            <div>
              <p className="text-[14px] font-semibold text-on-surface-variant">{label}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[24px] leading-8 font-bold">{value}</span>
                {delta && (
                  <span className="text-secondary text-[12px] font-semibold bg-secondary-container px-2 py-0.5 rounded-full">
                    {delta}
                  </span>
                )}
              </div>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tint}`}>
              <span className="material-symbols-outlined">{icon}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
