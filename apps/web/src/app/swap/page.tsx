'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { InboxClient } from '@/features/inbox/services/inbox.client';
import { formatSizeShort } from '@/features/shoe/utils/size-conversion';
import type { SerializedShoeListing } from '@/features/shoe/utils/listing-dto';

const MAX_CASH_TOP_UP = 1_000_000;

function parseCashTopUp(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  if (!/^\d+(?:\.\d{1,2})?$/.test(trimmed)) return null;
  const amount = Number(trimmed);
  return Number.isFinite(amount) && amount >= 0 && amount <= MAX_CASH_TOP_UP ? amount : null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error ?? 'Request failed. Please try again.');
  return data as T;
}

// NOTE: `colorway` is assumed on SerializedShoeListing (used by the dev-branch
// version this was merged from). Drop the ternary and just use `listing.model`
// if that field doesn't actually exist on the type.
function listingTitle(listing: SerializedShoeListing) {
  return listing.colorway ? `${listing.model} '${listing.colorway}'` : listing.model;
}

function ShoeSquare({
  label,
  listing,
  footer,
}: {
  label: string;
  listing: SerializedShoeListing | null;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-w-0 rounded-2xl bg-surface-container-lowest p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-primary">{label}</p>
      <div className="aspect-square mb-3 overflow-hidden rounded-xl bg-surface-container flex items-center justify-center">
        {listing?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.imageUrl} alt={listingTitle(listing)} className="h-full w-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-outline text-[28px]">footprint</span>
        )}
      </div>
      <p className="truncate text-[11px] font-semibold uppercase text-on-surface-variant">{listing?.brand ?? 'Choose a listing'}</p>
      <p className="truncate text-[15px] font-bold text-on-surface">{listing ? listingTitle(listing) : 'Your listing'}</p>
      {listing && (
        <p className="mt-1 text-[12px] text-on-surface-variant">
          Size {formatSizeShort(listing.size) ?? listing.size} · ₱{listing.price.toLocaleString()}
        </p>
      )}
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}

function SwapOfferForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = Number(searchParams.get('id'));
  const hasInvalidListingId = !Number.isInteger(listingId) || listingId <= 0;

  const [target, setTarget] = useState<SerializedShoeListing | null>(null);
  const [myListings, setMyListings] = useState<SerializedShoeListing[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cashTopUp, setCashTopUp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (hasInvalidListingId) return;

    Promise.all([
      request<{ shoeListing: SerializedShoeListing }>(`/api/listings/${listingId}`),
      InboxClient.getMyListings(),
    ])
      .then(([targetResponse, listings]) => {
        // Only listings actually eligible for a swap can be offered — mirrors
        // the filtering fix/mobile-issues had that dev's version was missing.
        const eligible = listings.filter(
          (listing) =>
            listing.isAvailable &&
            !listing.archivedAt &&
            (listing.listingMode === 'Swap' || listing.listingMode === 'Both'),
        );
        setTarget(targetResponse.shoeListing);
        setMyListings(eligible);
        setSelectedId(eligible[0] ? Number(eligible[0].id) : null);
      })
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : 'Could not load the swap offer.'),
      )
      .finally(() => setLoading(false));
  }, [hasInvalidListingId, listingId]);

  const selected = useMemo(
    () => myListings.find((listing) => Number(listing.id) === selectedId) ?? null,
    [myListings, selectedId],
  );

  const topUp = parseCashTopUp(cashTopUp);
  const topUpError = topUp === null ? 'Enter ₱0–₱1,000,000 with up to two decimal places.' : null;
  const valueDiff = target && selected ? target.price - selected.price - (topUp ?? 0) : 0;
  const canSubmit = !!target && !!selected && topUp !== null && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit || !target || !selected || topUp === null) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await request<{ transactionDetails: { id: number; listing: { userId: string } } }>(
        `/api/listings/${target.id}/swap-offers`,
        { method: 'POST', body: JSON.stringify({ type: 'swap', listings: [Number(selected.id)], topUp }) },
      );
      // Offers only surface in the recipient's inbox via a message referencing
      // the transaction — dev's version skipped this and the offer would
      // never actually reach the seller.
      await request('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({
          listerId: created.transactionDetails.listing.userId,
          transactionId: created.transactionDetails.id,
          content: message.trim() || `Hello! Please check out my swap offer for your ${target.model}.`,
        }),
      });
      router.replace('/inbox');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not send your swap offer.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (hasInvalidListingId) {
    return <main className="p-10 text-center text-error">Invalid listing.</main>;
  }
  if (loading) {
    return <main className="p-10 text-center text-on-surface-variant">Loading swap offer…</main>;
  }
  if (!target) {
    return <main className="p-10 text-center text-error">{error ?? 'Listing unavailable.'}</main>;
  }
  if (myListings.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 text-center">
        <p className="mb-1.5 text-[15px] font-bold text-on-surface">You have no pairs to offer yet</p>
        <p className="mb-4 text-[13.5px] text-on-surface-variant">
          List a pair of your own and you can propose it as a swap.
        </p>
        <button
          onClick={() => router.push('/sell')}
          className="rounded-full bg-primary px-5 py-2.5 text-[14px] font-bold text-white"
        >
          List a pair
        </button>
      </main>
    );
  }

  // NOTE: `seller` on SerializedShoeListing is assumed here (dev's version
  // used it). Falls back to a generic label if it's missing at runtime, but
  // if the type doesn't actually have it, this needs adjusting to whatever
  // field carries the seller's display name.
  const ownerName = target.seller?.name || 'the seller';

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-primary text-[11.5px] font-bold text-white">
          {ownerName[0]?.toUpperCase()}
        </div>
        <span className="text-[13.5px] text-on-surface-variant">
          Proposing a swap with <strong className="text-on-surface">{ownerName}</strong>
        </span>
      </div>

      <div className="mb-6 flex items-stretch gap-3">
        <ShoeSquare
          label="Your Offer"
          listing={selected}
          footer={
            <div className="relative">
              <button
                onClick={() => setPickerOpen((open) => !open)}
                className="flex w-full items-center justify-between rounded-lg bg-surface-container px-3 py-2.5 text-[13px] font-semibold text-on-surface"
              >
                Change shoe
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
              </button>
              {pickerOpen && (
                <div className="absolute left-0 right-0 top-[110%] z-10 overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0px_10px_30px_rgba(0,0,0,0.12)]">
                  {myListings.map((listing) => (
                    <button
                      key={listing.id}
                      onClick={() => {
                        setSelectedId(Number(listing.id));
                        setPickerOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 border-b border-outline-variant px-3 py-2.5 text-left last:border-b-0 ${
                        Number(listing.id) === selectedId ? 'bg-primary/5' : 'hover:bg-surface-container'
                      }`}
                    >
                      {listing.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={listing.imageUrl}
                          alt={listingTitle(listing)}
                          className="h-[34px] w-[34px] rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-surface-container">
                          <span className="material-symbols-outlined text-outline text-[16px]">footprint</span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-bold text-on-surface">{listingTitle(listing)}</p>
                        <p className="text-[11px] text-on-surface-variant">
                          Size {formatSizeShort(listing.size) ?? listing.size} · ₱{listing.price.toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          }
        />

        <div className="flex w-12 flex-shrink-0 items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-[0_4px_12px_rgba(37,99,235,0.2)]">
            <span className="material-symbols-outlined text-[18px] text-white">swap_horiz</span>
          </div>
        </div>

        <ShoeSquare label="Their Shoe" listing={target} />
      </div>

      <section className="mb-5 rounded-2xl bg-surface-container-lowest p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
        <div className="mb-2 flex justify-between text-[13.5px]">
          <span className="text-on-surface-variant">Your offer value</span>
          <span className="font-semibold text-on-surface">₱{(selected?.price ?? 0).toLocaleString()}</span>
        </div>
        <div className="mb-3.5 flex justify-between text-[13.5px]">
          <span className="text-on-surface-variant">Their shoe value</span>
          <span className="font-semibold text-on-surface">₱{target.price.toLocaleString()}</span>
        </div>

        <label className="mb-1 block text-[14px] font-semibold text-on-surface">Cash top-up (optional)</label>
        <p className="mb-2 text-[12px] text-on-surface-variant">Add cash to sweeten your swap offer.</p>
        <div
          className={`mb-1 flex items-center rounded-xl border bg-surface px-3 py-3 ${
            topUpError ? 'border-error' : 'border-outline-variant'
          }`}
        >
          <span className="mr-2 text-on-surface-variant">₱</span>
          <input
            inputMode="decimal"
            value={cashTopUp}
            onChange={(event) => setCashTopUp(event.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0"
            className="w-full bg-transparent text-on-surface outline-none"
          />
        </div>
        {topUpError && <p className="mb-2 text-[12px] text-error">{topUpError}</p>}

        <div className="mt-3 flex items-center justify-between border-t border-outline-variant pt-3">
          <span className="text-[13.5px] font-bold text-on-surface">
            {valueDiff === 0 ? 'Even swap' : valueDiff > 0 ? "You'd be under by" : "You'd be over by"}
          </span>
          <span className={`text-[16px] font-bold ${valueDiff === 0 ? 'text-green-600' : 'text-on-surface'}`}>
            {valueDiff === 0 ? '₱0' : `₱${Math.abs(valueDiff).toLocaleString()}`}
          </span>
        </div>
      </section>

      <label className="mb-5 block rounded-2xl bg-surface-container-lowest p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
        <span className="mb-2 block text-[14px] font-semibold text-on-surface">Message (optional)</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          className="w-full resize-y rounded-xl border border-outline-variant bg-surface p-3 text-[14px] text-on-surface outline-none"
          placeholder="e.g. Happy to ship first, just let me know your address…"
        />
      </label>

      {error && <p className="mb-3 text-[13px] text-error">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="material-symbols-outlined text-[18px]">send</span>
        {isSubmitting ? 'Sending offer…' : 'Send swap offer'}
      </button>
    </main>
  );
}

export default function ProposeSwapPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-20 border-b border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto flex max-w-3xl items-center gap-3.5 px-6 py-4">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-outline-variant bg-surface"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">arrow_back</span>
          </button>
          <span className="text-[16px] font-bold text-on-surface">Propose Swap</span>
          <span
            onClick={() => router.push('/')}
            className="ml-auto cursor-pointer text-[18px] font-extrabold text-primary"
          >
            Resole
          </span>
        </div>
      </header>

      <Suspense fallback={<main className="p-10 text-center text-on-surface-variant">Loading…</main>}>
        <SwapOfferForm />
      </Suspense>
    </div>
  );
}