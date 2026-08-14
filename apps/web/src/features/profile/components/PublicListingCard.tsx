'use client';

import Link from 'next/link';
import type { ProfileListing } from '../types/profile.types';
import { CONDITION_COLORS } from '@/features/sell/utils/condition';
import { usePreferredSizeSystem } from '@/features/shoe/hooks/usePreferredSizeSystem';
import { formatSize } from '@/features/shoe/utils/size-conversion';

/**
 * Web port of the mobile home-feed listing card. The seller row is dropped on
 * purpose — every card here belongs to the profile you are already looking at.
 */

const BADGE_STYLES: Record<string, { className: string; icon: string; label?: string }> = {
  Swap: { className: 'bg-primary text-white', icon: 'swap_horiz' },
  Sale: { className: 'bg-secondary text-white', icon: 'sell' },
  Both: { className: 'bg-[#8B5CF6] text-white', icon: 'swap_horiz', label: 'Swap & Sell' },
};

const LISTING_DURATION_DAYS = 30;

function getDaysLeft(createdAt: string | Date): number {
  const elapsed = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  return Math.max(Math.round(LISTING_DURATION_DAYS - elapsed), 0);
}

export default function PublicListingCard({ listing }: { listing: ProfileListing }) {
  const sizeSystem = usePreferredSizeSystem();
  const badge = BADGE_STYLES[listing.listingMode];
  const conditionColor = CONDITION_COLORS[listing.condition] ?? '#9CA3AF';
  const daysLeft = getDaysLeft(listing.createdAt);
  const isSwapOnly = listing.listingMode === 'Swap';

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0px_4px_12px_rgba(0,0,0,0.08)] flex flex-col hover:shadow-[0px_6px_18px_rgba(0,0,0,0.12)] transition-shadow"
    >
      <div className="relative">
        <div className="w-full h-[148px] bg-surface-container">
          {listing.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.imageUrl} alt={listing.model} className="w-full h-full object-cover" />
          )}
        </div>

        <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-1 bg-white/95">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: daysLeft <= 3 ? '#EF4444' : '#10B981' }}
          />
          <span className="text-[9px] font-bold text-[#374151]">{daysLeft}d left</span>
        </span>

        {badge && (
          <span
            className={`absolute top-2 right-2 flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${badge.className}`}
          >
            <span className="material-symbols-outlined text-[12px]">{badge.icon}</span>
            {badge.label ?? listing.listingMode}
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[12px] text-on-surface-variant font-medium">{listing.brand}</span>
          <span className="flex items-center gap-1 text-[12px]" style={{ color: conditionColor }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: conditionColor }} />
            {listing.condition}
          </span>
        </div>

        <p className="text-on-surface font-semibold text-[14px] leading-tight mb-2 line-clamp-2">
          {listing.model}
        </p>

        {isSwapOnly ? (
          <div className="mt-auto pt-2 border-t border-surface-variant">
            <p className="text-on-surface-variant text-[12px]">Open to swap offers</p>
            <p className="text-on-surface font-semibold text-[12px] mt-0.5">
              {formatSize(Number(listing.size), sizeSystem)}
            </p>
          </div>
        ) : (
          <div className="mt-auto">
            <p className="text-primary font-bold text-[16px]">
              ₱{Number(listing.price || 0).toLocaleString()}
            </p>
            <p className="text-on-surface-variant text-[12px] mt-0.5">
              {formatSize(Number(listing.size), sizeSystem)}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
