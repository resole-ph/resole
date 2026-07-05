export default function QuickLinksCard() {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] px-5">
      <a
        href="#"
        className="flex items-center gap-3 py-4 hover:bg-surface-container-low -mx-5 px-5 rounded-xl transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">receipt_long</span>
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-on-surface">Transactions</p>
          <p className="text-[13px] text-on-surface-variant">Sales, swaps, donations</p>
        </div>
        <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
      </a>
    </div>
  );
}
