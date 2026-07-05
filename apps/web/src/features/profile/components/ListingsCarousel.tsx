type Listing = {
  name: string;
  price: string;
  tag: string;
  tagTone: 'swap' | 'sale';
  badge?: string;
  tint: string;
};

const LISTINGS: Listing[] = [
  {
    name: "Nike Jordan 1 Retro '85",
    price: '₱12,400',
    tag: 'Swap Ready',
    tagTone: 'swap',
    badge: 'AI 8.5',
    tint: 'bg-primary/10 text-primary',
  },
  {
    name: 'Adidas Ultraboost 5.0',
    price: '₱8,200',
    tag: 'For Sale',
    tagTone: 'sale',
    badge: 'Mint',
    tint: 'bg-secondary-container text-on-secondary-container',
  },
  {
    name: 'Prada Cloudbust Thunder',
    price: '₱42,000',
    tag: 'Swap Ready',
    tagTone: 'swap',
    tint: 'bg-tertiary/10 text-tertiary',
  },
];

export default function ListingsCarousel() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-[24px] leading-8 font-bold text-on-surface">My Active Listings</h3>
          <p className="text-[14px] text-on-surface-variant">Items currently for sale or swap</p>
        </div>
        <a className="text-primary text-[14px] font-semibold hover:underline" href="#">
          View All
        </a>
      </div>

      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
        {LISTINGS.map((listing) => (
          <div
            key={listing.name}
            className="min-w-[240px] bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform"
          >
            <div className={`relative h-40 flex items-center justify-center ${listing.tint}`}>
              <span className="material-symbols-outlined text-[40px] opacity-60">inventory_2</span>
              {listing.badge && (
                <div className="absolute top-2 left-2">
                  <span className="bg-tertiary-container/90 text-on-tertiary-container text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                    {listing.badge}
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h4 className="text-[14px] font-semibold truncate">{listing.name}</h4>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[20px] leading-6 font-bold text-primary">{listing.price}</span>
                <span
                  className={[
                    'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                    listing.tagTone === 'swap'
                      ? 'text-secondary bg-secondary-container'
                      : 'text-on-surface-variant bg-surface-container',
                  ].join(' ')}
                >
                  {listing.tag}
                </span>
              </div>
            </div>
          </div>
        ))}

        <div className="min-w-[200px] flex flex-col items-center justify-center bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant group hover:border-primary transition-colors cursor-pointer">
          <span className="text-[24px] leading-8 font-bold text-outline-variant group-hover:text-primary">
            +11 more
          </span>
          <p className="text-[14px] font-semibold text-outline-variant mt-2 group-hover:text-primary">
            View Full Inventory
          </p>
        </div>
      </div>
    </section>
  );
}
