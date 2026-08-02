'use client';

import Link from 'next/link';
import { useMyListingSummary, useMyListings } from '../queries/profile.queries';

const PREVIEW_COUNT = 3;

function Thumb({ imageUrl, alt }: { imageUrl?: string | null; alt?: string }) {
  return (
    <div className="flex-1 h-20 rounded-lg bg-surface-container flex items-center justify-center text-outline overflow-hidden">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={alt ?? ''} className="w-full h-full object-cover" />
      ) : (
        <span className="material-symbols-outlined text-[22px]">image</span>
      )}
    </div>
  );
}

export default function MyListingsPreviewCard() {
  // ['profile','me','listings'] is the same entry MyListingsView uses on
  // /profile/listings, so "View all" now renders from cache instead of
  // refetching the list this card just loaded.
  const { data } = useMyListings();
  const { data: summary } = useMyListingSummary();

  // Both queries previously swallowed errors into empty/null, and the render
  // below already treats an empty list as "no listings yet". Keeping that.
  const listings = data ?? [];

  const preview = listings.slice(0, PREVIEW_COUNT);
  const overflow = Math.max(listings.length - PREVIEW_COUNT, 0);
  const active = summary?.active ?? listings.filter((item) => item.isAvailable !== false).length;
  const unavailable = summary?.unavailable ?? listings.filter((item) => item.isAvailable === false).length;

  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">inventory_2</span>
        </div>
        <h4 className="flex-1 text-[14px] font-semibold text-on-surface">My Listings</h4>
        <Link href="/profile/listings" className="text-primary text-[13px] font-semibold hover:underline">
          View all
        </Link>
      </div>

      <div className="flex gap-2 mb-3">
        {preview.length === 0
          ? Array.from({ length: PREVIEW_COUNT }).map((_, i) => <Thumb key={i} />)
          : preview.map((item) => (
              <Thumb key={item.id} imageUrl={item.imageUrl} alt={item.model} />
            ))}
        {overflow > 0 && (
          <div className="w-16 h-20 rounded-lg bg-surface-container-high flex items-center justify-center">
            <span className="text-on-surface-variant font-semibold text-[13px]">+{overflow}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-on-surface-variant">
          <span className="font-semibold text-on-surface">{active}</span> active
        </span>
        <span className="text-outline-variant">&middot;</span>
        <span className="text-on-surface-variant">
          <span className="font-semibold text-on-surface">{unavailable}</span> removed
        </span>
      </div>
    </div>
  );
}
