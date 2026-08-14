'use client';

import type { OfferExtras, ThreadOffer } from '../types/inbox.types';
import { usePreferredSizeSystem } from '@/features/shoe/hooks/usePreferredSizeSystem';
import { formatSize } from '@/features/shoe/utils/size-conversion';

type ConfirmOfferModalProps = {
  offer: ThreadOffer;
  extras: OfferExtras | undefined;
  /** `true` confirms an accept, `false` confirms a decline. */
  accept: boolean;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmOfferModal({
  offer,
  extras,
  accept,
  isSubmitting,
  error,
  onClose,
  onConfirm,
}: ConfirmOfferModalProps) {
  const isSwap = offer.type === 'swap';
  const sizeSystem = usePreferredSizeSystem();
  const listing = extras?.listing ?? null;
  const swapItem = extras?.swapItem ?? null;

  const title = accept ? 'Accept this offer?' : 'Decline this offer?';
  const body = accept
    ? isSwap
      ? 'You are agreeing to swap your listing for the item below. This cannot be undone.'
      : 'You are agreeing to sell your listing at the price below. This cannot be undone.'
    : 'The buyer will be notified. They can still send a revised offer afterwards.';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0px_8px_32px_rgba(0,0,0,0.15)] p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[20px] font-bold text-on-surface">{title}</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-on-surface-variant text-[13px] mb-5">{body}</p>

        <div className="bg-surface-container rounded-xl p-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-surface-container-lowest flex items-center justify-center overflow-hidden shrink-0">
              {listing?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={listing.imageUrl} alt={listing.model} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-outline text-[22px]">footprint</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-on-surface font-semibold text-[13px] truncate">{listing?.model ?? 'Listing'}</p>
              {listing?.size && (
                <p className="text-on-surface-variant text-[12px]">
                  Size {formatSize(Number(listing.size), sizeSystem)}
                </p>
              )}
            </div>
          </div>

          {isSwap ? (
            <div className="mt-3 pt-3 border-t border-outline-variant">
              <p className="text-on-surface-variant text-[12px] mb-2">You receive in exchange</p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-surface-container-lowest flex items-center justify-center overflow-hidden shrink-0">
                  {swapItem?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={swapItem.imageUrl} alt={swapItem.model} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-outline text-[18px]">footprint</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-on-surface font-semibold text-[13px] truncate">
                    {swapItem?.model ?? 'Their listing'}
                  </p>
                  {swapItem?.size && (
                    <p className="text-on-surface-variant text-[12px]">
                      Size {formatSize(Number(swapItem.size), sizeSystem)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t border-outline-variant flex items-center justify-between">
              <span className="text-on-surface-variant text-[12px]">Offer price</span>
              <span className="text-primary font-bold text-[17px]">
                ₱{Number(offer.details?.price ?? 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="text-error text-[12px] mb-3">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-full text-[14px] font-semibold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={[
              'flex-1 py-2.5 rounded-full text-[14px] font-semibold text-white transition-opacity',
              'hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed',
              accept ? 'bg-primary' : 'bg-error',
            ].join(' ')}
          >
            {isSubmitting ? (accept ? 'Accepting...' : 'Declining...') : accept ? 'Accept offer' : 'Decline offer'}
          </button>
        </div>
      </div>
    </div>
  );
}
