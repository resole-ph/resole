'use client';

import { useQueryClient } from '@tanstack/react-query';
import { profileKeys, useMyFavourites } from '../queries/profile.queries';
import { formatSizeShort } from '@/features/shoe/utils/size-conversion';
import type { FavouriteItem } from '../types/profile.types';

type FavCardItem = {
  id: string;
  listingId: number;
  name: string;
  brand: string;
  size: string;
  price: string;
  imageUrl: string | null;
};

const PESO = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

function toCardItem(row: FavouriteItem): FavCardItem {
  return {
    id: String(row.details.id),
    listingId: row.listing.id,
    name: row.details.model,
    brand: row.details.brand,
    // Same formatter the listing cards use, so "10 (US Men)" reads the same
    // everywhere instead of this page's old hardcoded "US 10".
    size: formatSizeShort(row.details.size) ?? '',
    price: PESO.format(Number(row.details.price ?? 0)),
    imageUrl: row.listing.imageUrlTop,
  };
}

function FavCard({ item, onToggle }: { item: FavCardItem; onToggle: (item: FavCardItem) => void }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-3 relative">
      <div className="w-full h-24 rounded-lg bg-surface-container flex items-center justify-center text-outline mb-2 overflow-hidden">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-[28px]">footprint</span>
        )}
      </div>

      <button
        onClick={() => onToggle(item)}
        className="absolute top-5 right-5 w-7 h-7 rounded-full bg-white shadow-[0px_2px_6px_rgba(0,0,0,0.12)] flex items-center justify-center"
        aria-label={`Remove ${item.name} from favourites`}
      >
        <span
          className="material-symbols-outlined text-error text-[16px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          favorite
        </span>
      </button>

      <p className="text-on-surface-variant text-[12px]">{item.brand}</p>
      <p className="text-on-surface font-semibold text-[14px] mt-0.5 truncate">{item.name}</p>
      <p className="text-on-surface-variant text-[12px]">{item.size}</p>
      <p className="text-primary font-bold text-[14px] mt-1">{item.price}</p>
    </div>
  );
}

export default function FavouritesGrid() {
  const queryClient = useQueryClient();

  // This page previously rendered eight hardcoded sneakers, so it disagreed
  // with the favourites count the preview card on /profile showed. Same query
  // key as that card now, so the two cannot diverge.
  const { data, isPending } = useMyFavourites();

  const saved = (data?.favourites ?? []).map(toCardItem);

  const handleToggle = async (item: FavCardItem) => {
    // Optimistic removal, reverted by the refetch below if the request fails.
    queryClient.setQueryData<{ totalCount: number; favourites: FavouriteItem[] }>(
      profileKeys.myFavourites(),
      (prev) => {
        if (!prev) return prev;
        const favourites = prev.favourites.filter((row) => String(row.details.id) !== item.id);
        return { totalCount: favourites.length, favourites };
      }
    );

    try {
      const response = await fetch(`/api/listings/${item.listingId}/save`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to remove favourite');
    } catch (error) {
      console.error('Failed to remove favourite:', error);
    } finally {
      queryClient.invalidateQueries({ queryKey: profileKeys.myFavourites() });
    }
  };

  if (isPending) {
    return (
      <div className="flex flex-col items-center py-20">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant text-[14px] mt-3">Loading favourites…</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-on-surface-variant text-[13px] mb-4">
        {saved.length} sneaker{saved.length !== 1 ? 's' : ''} saved
      </p>

      {saved.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <span className="material-symbols-outlined text-[40px] text-outline-variant">favorite</span>
          <p className="text-on-surface-variant text-[14px] mt-3">No saved items yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {saved.map((item) => (
            <FavCard key={item.id} item={item} onToggle={handleToggle} />
          ))}
        </div>
      )}
    </div>
  );
}
