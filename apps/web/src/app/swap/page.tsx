'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { InboxClient } from '@/features/inbox/services/inbox.client';
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

function ShoeCard({ title, listing }: { title: string; listing: SerializedShoeListing | null }) {
  return (
    <div className="flex-1 min-w-0 rounded-2xl bg-surface-container-lowest p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-primary">{title}</p>
      <div className="aspect-square mb-3 overflow-hidden rounded-xl bg-surface-container flex items-center justify-center">
        {listing?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.imageUrl} alt={listing.model} className="h-full w-full object-cover" />
        ) : <span className="material-symbols-outlined text-outline text-[28px]">footprint</span>}
      </div>
      <p className="truncate text-[11px] font-semibold uppercase text-on-surface-variant">{listing?.brand ?? 'Choose a listing'}</p>
      <p className="truncate text-[15px] font-bold text-on-surface">{listing?.model ?? 'Your listing'}</p>
      {listing && <p className="mt-1 text-[12px] text-on-surface-variant">Size {listing.size} · ₱{listing.price.toLocaleString()}</p>}
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
        const eligible = listings.filter((listing) =>
          listing.isAvailable && !listing.archivedAt && (listing.listingMode === 'Swap' || listing.listingMode === 'Both'),
        );
        setTarget(targetResponse.shoeListing);
        setMyListings(eligible);
        setSelectedId(eligible[0] ? Number(eligible[0].id) : null);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not load the swap offer.'))
      .finally(() => setLoading(false));
  }, [hasInvalidListingId, listingId]);

  const selected = useMemo(
    () => myListings.find((listing) => Number(listing.id) === selectedId) ?? null,
    [myListings, selectedId],
  );
  const topUp = parseCashTopUp(cashTopUp);
  const topUpError = topUp === null ? 'Enter ₱0–₱1,000,000 with up to two decimal places.' : null;
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

  if (hasInvalidListingId) return <main className="p-10 text-center text-error">Invalid listing.</main>;
  if (loading) return <main className="p-10 text-center text-on-surface-variant">Loading swap offer…</main>;
  if (!target) return <main className="p-10 text-center text-error">{error ?? 'Listing unavailable.'}</main>;

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <button onClick={() => router.back()} className="mb-5 text-[14px] font-semibold text-primary">← Back</button>
      <h1 className="text-[24px] font-bold text-on-surface">Make a swap offer</h1>
      <p className="mb-6 mt-1 text-[14px] text-on-surface-variant">Offer one of your listings and optionally add cash.</p>

      <div className="mb-6 flex items-center gap-3"><ShoeCard title="Your offer" listing={selected} /><span className="material-symbols-outlined text-primary">swap_horiz</span><ShoeCard title="Their listing" listing={target} /></div>

      <section className="mb-5 rounded-2xl bg-surface-container-lowest p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
        <label className="block text-[14px] font-semibold text-on-surface mb-2">Your listing</label>
        {myListings.length ? (
          <select value={selectedId ?? ''} onChange={(event) => setSelectedId(Number(event.target.value) || null)} className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-[14px] text-on-surface outline-none">
            {myListings.map((listing) => <option key={listing.id} value={listing.id}>{listing.brand} {listing.model} — ₱{listing.price.toLocaleString()}</option>)}
          </select>
        ) : <p className="text-[13px] text-on-surface-variant">You need an active Swap or Both listing before making an offer.</p>}
      </section>

      <section className="mb-5 rounded-2xl bg-surface-container-lowest p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
        <label className="block text-[14px] font-semibold text-on-surface mb-1">Cash top-up (optional)</label>
        <p className="mb-3 text-[12px] text-on-surface-variant">Add cash to sweeten your swap offer.</p>
        <div className={`flex items-center rounded-xl border bg-surface px-3 py-3 ${topUpError ? 'border-error' : 'border-outline-variant'}`}><span className="mr-2 text-on-surface-variant">₱</span><input inputMode="decimal" value={cashTopUp} onChange={(event) => setCashTopUp(event.target.value.replace(/[^0-9.]/g, ''))} placeholder="0" className="w-full bg-transparent text-on-surface outline-none" /></div>
        {topUpError && <p className="mt-2 text-[12px] text-error">{topUpError}</p>}
      </section>

      <label className="mb-5 block rounded-2xl bg-surface-container-lowest p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"><span className="mb-2 block text-[14px] font-semibold text-on-surface">Message (optional)</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} className="w-full resize-y rounded-xl border border-outline-variant bg-surface p-3 text-[14px] text-on-surface outline-none" placeholder="Add a note for the seller…" /></label>
      {error && <p className="mb-3 text-[13px] text-error">{error}</p>}
      <button onClick={handleSubmit} disabled={!canSubmit} className="w-full rounded-full bg-primary py-3.5 font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-40">{isSubmitting ? 'Sending offer…' : 'Send swap offer'}</button>
    </main>
  );
}

export default function ProposeSwapPage() {
  return <Suspense fallback={<main className="p-10 text-center text-on-surface-variant">Loading…</main>}><SwapOfferForm /></Suspense>;
}
