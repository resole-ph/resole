'use client';

import { useState } from 'react';
import type { EditOfferPayload, OfferExtras, ThreadOffer } from '../types/inbox.types';
import type { SerializedShoeListing } from '@/features/shoe/utils/listing-dto';

type EditOfferModalProps = {
  offer: ThreadOffer;
  extras: OfferExtras | undefined;
  myListings: SerializedShoeListing[] | null;
  isLoadingListings: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: EditOfferPayload) => void;
};

export default function EditOfferModal({
  offer,
  extras,
  myListings,
  isLoadingListings,
  isSaving,
  onClose,
  onSave,
}: EditOfferModalProps) {
  const isSwap = offer.type === 'swap';
  const [price, setPrice] = useState(offer.details?.price ?? '');
  const [selectedListingId, setSelectedListingId] = useState<number | null>(
    extras?.swapItem ? Number(extras.swapItem.id) : null
  );

  const priceValue = Number.parseFloat(price);
  const isSaleValid = !isSwap && Number.isFinite(priceValue) && priceValue > 0;
  const isSwapValid = isSwap && selectedListingId != null;
  const canSave = (isSaleValid || isSwapValid) && !isSaving;

  function handleSave() {
    if (!canSave) return;

    if (isSwap) {
      if (selectedListingId == null) return;
      onSave({ listings: [selectedListingId] });
    } else {
      onSave({ price: priceValue });
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={isSaving ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit offer"
        className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0px_8px_32px_rgba(0,0,0,0.15)] p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-on-surface">Edit Offer</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6 bg-surface-container rounded-xl p-3">
          <div className="w-14 h-14 rounded-lg bg-surface-container-lowest flex items-center justify-center overflow-hidden shrink-0">
            {extras?.listing?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={extras.listing.imageUrl} alt={extras.listing.model} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-outline text-[22px]">footprint</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-on-surface font-semibold text-[13px] truncate">{extras?.listing?.model ?? 'Listing'}</p>
            {extras?.listing?.size && (
              <p className="text-on-surface-variant text-[12px]">Size US {extras.listing.size}</p>
            )}
          </div>
        </div>

        {isSwap ? (
          <div className="flex flex-col gap-1.5 mb-6">
            <span className="text-on-surface-variant text-[13px] font-semibold">Choose one of your listings to offer</span>
            {isLoadingListings ? (
              <div className="flex items-center justify-center py-8">
                <span className="material-symbols-outlined text-[28px] text-outline-variant animate-spin">progress_activity</span>
              </div>
            ) : !myListings || myListings.length === 0 ? (
              <p className="text-on-surface-variant text-[13px] py-4 text-center">
                You don&apos;t have any listings available to swap.
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {myListings.map((listing) => {
                  const selected = selectedListingId === Number(listing.id);
                  return (
                    <button
                      key={listing.id}
                      type="button"
                      onClick={() => setSelectedListingId(selected ? null : Number(listing.id))}
                      className={[
                        'flex items-center gap-3 rounded-lg border p-2.5 text-left transition-colors',
                        selected
                          ? 'border-primary bg-secondary-container/20'
                          : 'border-outline-variant hover:bg-surface-container',
                      ].join(' ')}
                    >
                      <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden shrink-0">
                        {listing.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={listing.imageUrl} alt={listing.model} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-outline text-[18px]">footprint</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-on-surface font-semibold text-[13px] truncate">{listing.model}</p>
                        <p className="text-on-surface-variant text-[12px]">Size US {listing.size}</p>
                      </div>
                      {selected && <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <label className="flex flex-col gap-1.5 mb-6">
            <span className="text-on-surface-variant text-[13px] font-semibold">Offer price</span>
            <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-colors">
              <span className="text-on-surface-variant text-[14px]">₱</span>
              <input
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex-1 bg-transparent text-[14px] text-on-surface outline-none"
                placeholder="0"
              />
            </div>
          </label>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-full text-[14px] font-semibold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 py-2.5 rounded-full text-[14px] font-semibold text-white bg-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
