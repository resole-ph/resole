const PREVIEW_COUNT = 3;

export default function MyListingsPreviewCard() {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">inventory_2</span>
        </div>
        <h4 className="flex-1 text-[14px] font-semibold text-on-surface">My Listings</h4>
        <a href="#" className="text-primary text-[13px] font-semibold hover:underline">
          View all
        </a>
      </div>

      <div className="flex gap-2 mb-3">
        {Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-20 rounded-lg bg-surface-container flex items-center justify-center text-outline"
          >
            <span className="material-symbols-outlined text-[22px]">image</span>
          </div>
        ))}
        <div className="w-16 h-20 rounded-lg bg-surface-container-high flex items-center justify-center">
          <span className="text-on-surface-variant font-semibold text-[13px]">+11</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-on-surface-variant">
          <span className="font-semibold text-on-surface">5</span> active
        </span>
        <span className="text-outline-variant">&middot;</span>
        <span className="text-on-surface-variant">
          <span className="font-semibold text-on-surface">2</span> pending review
        </span>
      </div>
    </div>
  );
}
