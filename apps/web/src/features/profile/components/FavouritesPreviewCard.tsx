'use client';

import Link from 'next/link';
import { useMyFavourites } from '../queries/profile.queries';

const PREVIEW_COUNT = 4;

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

export default function FavouritesPreviewCard() {
  // Shared with FavouritesGrid on /profile/favourites, so "View all" is a
  // cache hit rather than a second trip to /api/users/me/favourites.
  const { data } = useMyFavourites();

  const favourites = data?.favourites ?? [];
  const totalCount = data?.totalCount ?? 0;

  const preview = favourites.slice(0, PREVIEW_COUNT);

  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">favorite</span>
        </div>
        <h4 className="flex-1 text-[14px] font-semibold text-on-surface">Favourites</h4>
        <Link href="/profile/favourites" className="text-primary text-[13px] font-semibold hover:underline">
          View all
        </Link>
      </div>

      <div className="flex gap-2 mb-3">
        {preview.length === 0
          ? Array.from({ length: PREVIEW_COUNT }).map((_, i) => <Thumb key={i} />)
          : preview.map((item) => (
              <Thumb
                key={item.details.id}
                imageUrl={item.listing.imageUrlTop}
                alt={item.details.model}
              />
            ))}
      </div>

      <p className="text-[13px] text-on-surface-variant">
        <span className="font-semibold text-on-surface">
          {totalCount} {totalCount === 1 ? 'sneaker' : 'sneakers'}
        </span>{' '}
        saved across all brands
      </p>
    </div>
  );
}
