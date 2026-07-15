'use client';

import Link from 'next/link';

interface ConfirmationStepProps {
  listingId: number | string | null;
  onListAnother: () => void;
  flowMode?: 'create' | 'edit';
}

export default function ConfirmationStep({ listingId, onListAnother, flowMode = 'create' }: ConfirmationStepProps) {
  const isEditing = flowMode === 'edit';
  return (
    <div className="flex flex-col items-center text-center py-10">
      <div className="w-24 h-24 rounded-full bg-secondary-container/30 flex items-center justify-center shadow-[0px_8px_24px_rgba(0,108,73,0.15)]">
        <span className="material-symbols-outlined text-secondary text-[56px]">check_circle</span>
      </div>

      <h1 className="text-[24px] font-bold text-on-surface mt-6">
        {isEditing ? 'Listing Updated!' : 'Listing Published!'}
      </h1>
      <p className="text-[14px] text-on-surface-variant mt-2 max-w-xs">
        {isEditing
          ? 'Your changes have been saved. Buyers will see the updated details shortly.'
          : 'Your shoe is now live on the marketplace. Buyers will be able to find it shortly.'}
      </p>

      {listingId && (
        <div className="bg-surface-container-low rounded-xl px-4 py-2 mt-5">
          <p className="text-[12px] text-on-surface-variant">Listing ID</p>
          <p className="text-[14px] font-semibold text-primary">#{listingId}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full mt-8 max-w-xs">
        <Link
          href="/market"
          className="w-full py-3.5 rounded-full font-semibold text-[15px] text-white bg-primary text-center hover:opacity-90 transition-opacity"
        >
          Go to Marketplace
        </Link>
        {isEditing ? (
          <Link
            href="/profile/listings"
            className="w-full py-3.5 rounded-full font-semibold text-[15px] text-on-surface-variant border border-outline-variant text-center"
          >
            Back to My Listings
          </Link>
        ) : (
          <button
            onClick={onListAnother}
            className="w-full py-3.5 rounded-full font-semibold text-[15px] text-on-surface-variant border border-outline-variant"
          >
            List Another
          </button>
        )}
      </div>
    </div>
  );
}
