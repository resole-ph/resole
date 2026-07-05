export default function RecycleDonateSection() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border-l-4 border-secondary">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="text-[24px] leading-8 font-bold">Schedule Pickup</h4>
            <p className="text-[14px] text-on-surface-variant mt-1">
              Ready to donate or recycle old sneakers? We&apos;ll come to you.
            </p>
          </div>
          <div className="p-3 bg-secondary/10 rounded-full text-secondary">
            <span className="material-symbols-outlined">local_shipping</span>
          </div>
        </div>
        <button className="w-full py-3 bg-secondary text-on-secondary rounded-xl text-[14px] font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]">
          Book Free Pickup
        </button>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border-l-4 border-outline">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="text-[24px] leading-8 font-bold">Find Drop-off</h4>
            <p className="text-[14px] text-on-surface-variant mt-1">
              Locate authorized Resole bins in your city for instant points.
            </p>
          </div>
          <div className="p-3 bg-on-surface-variant/10 rounded-full text-on-surface-variant">
            <span className="material-symbols-outlined">location_on</span>
          </div>
        </div>
        <button className="w-full py-3 bg-surface-container-high text-on-surface rounded-xl text-[14px] font-semibold hover:bg-surface-variant transition-colors active:scale-[0.98]">
          Open Map
        </button>
      </div>
    </section>
  );
}
