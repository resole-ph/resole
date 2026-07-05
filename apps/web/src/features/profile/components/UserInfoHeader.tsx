const STATS = [
  { value: '14', label: 'Listings' },
  { value: '28', label: 'Sold' },
  { value: '6', label: 'Swaps' },
];

export default function UserInfoHeader() {
  return (
    <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-[32px] font-bold relative group overflow-hidden">
          <span className="z-10">M</span>
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <span className="material-symbols-outlined">edit</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] leading-8 font-semibold text-on-surface">Miguel Rodriguez</h1>
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span
              className="material-symbols-outlined text-[18px] text-tertiary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="text-[14px] font-semibold text-on-surface">4.9</span>
            <span className="text-on-surface-variant text-[14px] ml-1">(156 reviews)</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {STATS.map(({ value, label }) => (
          <div key={label} className="bg-surface-container p-4 rounded-xl text-center min-w-[80px]">
            <p className="text-[24px] leading-8 font-bold text-primary">{value}</p>
            <p className="text-[14px] font-semibold text-on-surface-variant">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
