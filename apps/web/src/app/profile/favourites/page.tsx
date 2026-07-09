import FavouritesGrid from '@/features/profile/components/FavouritesGrid';

export default function FavouritesPage() {
  return (
    <>
      <div>
        <h1 className="text-[24px] leading-8 font-bold text-on-surface">Favourites</h1>
        <p className="text-[14px] text-on-surface-variant mt-1">Sneakers you&apos;ve saved across all brands</p>
      </div>

      <FavouritesGrid />
    </>
  );
}
