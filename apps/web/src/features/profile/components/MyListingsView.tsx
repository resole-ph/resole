'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { profileKeys, useMyListings } from '../queries/profile.queries';
import { usePreferredSizeSystem } from '@/features/shoe/hooks/usePreferredSizeSystem';
import { formatSize } from '@/features/shoe/utils/size-conversion';

type Tab = 'active' | 'removed';

const TAB_LABELS: Record<Tab, string> = {
  active: 'Active',
  removed: 'Removed',
};

function getDaysLeft(createdAtStr: string): number {
  const LISTING_DURATION_DAYS = 30;
  const now = new Date().getTime();
  const listing = new Date(createdAtStr).getTime();
  const daysElapsed = (now - listing) / (1000 * 60 * 60 * 24);
  return Math.max(Math.round(LISTING_DURATION_DAYS - daysElapsed), 0);
}

function Thumbnail({ imageUrl }: { imageUrl?: string }) {
  return (
    <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center text-outline shrink-0 overflow-hidden">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="Shoe Thumbnail"
          className="w-full h-full object-cover scale-[1.5]"
        />
      ) : (
        <span className="material-symbols-outlined text-[26px]">footprint</span>
      )}
    </div>
  );
}

function ActiveCard({ item, onEdit, onDelete }: { item: any; onEdit: () => void; onDelete: () => void }) {
  const sizeSystem = usePreferredSizeSystem();
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-4 flex items-center gap-3">
      <Thumbnail imageUrl={item.imageUrl} />

      <div className="flex-1 min-w-0">
        <p className="text-on-surface font-semibold text-[14px] truncate">{item.model}</p>
        <p className="text-on-surface-variant text-[12px] mt-0.5">
          {item.brand} &middot; {formatSize(Number(item.size), sizeSystem)}
        </p>
        <p className="text-primary font-bold text-[14px] mt-1">₱{Number(item.price || 0).toLocaleString()}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          <span className="text-on-surface-variant text-[12px]">{item.daysLeft}d left</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onEdit}
          className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
          aria-label={`Edit ${item.model}`}
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button
          onClick={onDelete}
          className="w-9 h-9 rounded-lg bg-error-container/40 flex items-center justify-center text-error hover:bg-error-container transition-colors"
          aria-label={`Remove ${item.model}`}
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  );
}

function RemovedCard({
  item,
  onRelist,
  onDonate,
}: {
  item: any;
  onRelist: () => void;
  onDonate: () => void;
}) {
  const sizeSystem = usePreferredSizeSystem();
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Thumbnail imageUrl={item.imageUrl} />

        <div className="flex-1 min-w-0">
          <p className="text-on-surface font-semibold text-[14px] truncate">{item.model}</p>
          <p className="text-on-surface-variant text-[12px] mt-0.5">
            {item.brand} &middot; {formatSize(Number(item.size), sizeSystem)}
          </p>
          <p className="text-primary font-bold text-[14px] mt-1">₱{Number(item.price || 0).toLocaleString()}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
            <span className="text-on-surface-variant text-[12px]">Removed from market</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onRelist}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12.5px] font-bold bg-[#EFF6FF] border border-[#BFDBFE] text-primary hover:bg-[#DBEAFE] transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]">refresh</span>
          Re-list
        </button>
        <button
          onClick={onDonate}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12.5px] font-bold bg-[#F0FDF4] border border-[#BBF7D0] text-secondary hover:bg-[#DCFCE7] transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]">favorite</span>
          Donate
        </button>
      </div>
    </div>
  );
}

function DonateComingSoon({ charityName, onClose }: { charityName: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Donations coming soon"
        className="w-full max-w-sm bg-surface-container-lowest rounded-xl shadow-[0px_8px_32px_rgba(0,0,0,0.15)] p-6 flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-secondary-container/30 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-secondary text-[26px]">favorite</span>
        </div>
        <p className="text-secondary text-[12px] font-bold tracking-wide mb-1">COMING SOON</p>
        <h3 className="text-on-surface font-bold text-[18px] mb-1.5">Donate to {charityName}</h3>
        <p className="text-on-surface-variant text-[13px] leading-relaxed mb-6">
          We&apos;re still building donations. Soon you&apos;ll be able to send proceeds straight to {charityName}.
        </p>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-full text-[14px] font-semibold text-white bg-primary hover:opacity-90 transition-opacity"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-16">
      <span className="material-symbols-outlined text-[40px] text-outline-variant">inventory_2</span>
      <p className="text-on-surface-variant text-[14px] mt-3">{label}</p>
    </div>
  );
}

export default function MyListingsView() {
  const router = useRouter();

  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>('active');

  // Charity donation states
  const [donateListingId, setDonateListingId] = useState<string | null>(null);
  const [charities, setCharities] = useState<any[]>([]);
  const [charitiesLoading, setCharitiesLoading] = useState(false);
  // Donations aren't wired up to actually transfer proceeds yet — picking a
  // charity shows a "coming soon" notice instead of hitting the donate API.
  const [comingSoonCharity, setComingSoonCharity] = useState<{ name: string } | null>(null);

  // Same cache entry MyListingsPreviewCard fills on /profile, so arriving here
  // via "View all" renders instantly instead of refetching a list we just had.
  const { data, isPending, error, refetch } = useMyListings({ includeArchived: 'true' });

  /**
   * Applies a change to the cached listing array. Every action below used to
   * hand-maintain two separate `active`/`removed` arrays in local state, which
   * meant the preview card on /profile kept showing the pre-action list until
   * a hard reload. Writing to the cache instead updates every reader at once.
   */
  const patchCache = (fn: (items: any[]) => any[]) => {
    queryClient.setQueryData<any[]>(profileKeys.myListings(), (prev) => fn(prev ?? []));
    // The summary counts (active/unavailable) are now stale by definition.
    queryClient.invalidateQueries({ queryKey: profileKeys.myListingSummary() });
  };

  // Derived rather than stored, so the two lists can never drift out of sync
  // with each other the way two independent useState arrays could.
  const { active, removed } = useMemo(() => {
    const listings = (data ?? []).map((item: any) => ({
      ...item,
      daysLeft: getDaysLeft(item.createdAt),
    }));

    return {
      active: listings.filter((item: any) => item.isAvailable !== false && item.daysLeft > 0),
      removed: listings.filter((item: any) => item.isAvailable === false),
    };
  }, [data]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Remove ${name}? This will take it off the market. You can re-list or donate it later.`)) {
      return;
    }
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete listing');

      // Flipping the flag is enough — the active/removed split is derived.
      patchCache((items) =>
        items.map((l) => (l.id === id ? { ...l, isAvailable: false } : l))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not remove listing');
    }
  };

  const handleRelist = async (id: string) => {
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to re-list listing');

      patchCache((items) =>
        items.map((l) => (l.id === id ? { ...l, isAvailable: true } : l))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not re-list listing');
    }
  };

  const openDonateModal = async (id: string) => {
    setDonateListingId(id);
    if (charities.length === 0) {
      setCharitiesLoading(true);
      try {
        const response = await fetch('/api/charities');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch charities');
        setCharities(data.charities || []);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Could not load charities');
        setDonateListingId(null);
      } finally {
        setCharitiesLoading(false);
      }
    }
  };

  const handlePickCharity = (charity: { name: string }) => {
    setDonateListingId(null);
    setComingSoonCharity(charity);
  };

  const handleEdit = (id: string) => {
    router.push(`/sell?edit=${id}`);
  };

  const counts: Record<Tab, number> = { active: active.length, removed: removed.length };

  if (isPending) {
    return (
      <section className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-10 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant text-[14px] mt-3">Loading listings...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-10 text-center">
        <span className="material-symbols-outlined text-error text-[40px] mb-2">error</span>
        <p className="text-error font-semibold text-[15px]">
          {error.message || 'Something went wrong'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-semibold"
        >
          Try Again
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-2">
        <div className="flex bg-surface-container rounded-xl p-1 m-3 mb-2">
          {(['active', 'removed'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                'flex-1 py-2 rounded-lg text-[13px] font-semibold capitalize transition-colors',
                tab === t
                  ? 'bg-surface-container-lowest text-on-surface shadow-[0px_2px_8px_rgba(0,0,0,0.06)]'
                  : 'text-on-surface-variant',
              ].join(' ')}
            >
              {TAB_LABELS[t]} <span className={tab === t ? 'text-primary' : 'text-on-surface-variant'}>({counts[t]})</span>
            </button>
          ))}
        </div>

        <div className="px-1 pb-1 flex flex-col gap-3">
          {tab === 'active' &&
            (active.length === 0 ? (
              <EmptyState label="No active listings" />
            ) : (
              active.map((item) => (
                <ActiveCard
                  key={item.id}
                  item={item}
                  onEdit={() => handleEdit(item.id)}
                  onDelete={() => handleDelete(item.id, item.model)}
                />
              ))
            ))}

          {tab === 'removed' &&
            (removed.length === 0 ? (
              <EmptyState label="No removed listings" />
            ) : (
              removed.map((item) => (
                <RemovedCard
                  key={item.id}
                  item={item}
                  onRelist={() => handleRelist(item.id)}
                  onDonate={() => openDonateModal(item.id)}
                />
              ))
            ))}
        </div>
      </section>

      {/* Charity selection modal */}
      {donateListingId && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-[4px] z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-surface-container-lowest w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 shadow-2xl flex flex-col max-h-[70vh] md:max-h-[500px]">
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-2">
              <h3 className="font-bold text-[16px] text-on-surface">Choose a charity</h3>
              <button
                onClick={() => setDonateListingId(null)}
                className="text-on-surface-variant hover:text-on-surface flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {charitiesLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 flex flex-col gap-2 pr-1">
                {charities.map((charity) => (
                  <button
                    key={charity.id}
                    onClick={() => handlePickCharity(charity)}
                    className="flex items-center justify-between rounded-xl px-4 py-3 bg-surface-container hover:bg-surface-container-high transition-colors text-left"
                  >
                    {charity.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={charity.image}
                        alt={`${charity.name} logo`}
                        className="w-12 h-12 rounded-xl object-contain bg-surface-container-lowest mr-3 shrink-0"
                      />
                    ) : (
                      <span className="material-symbols-outlined w-12 h-12 rounded-xl bg-surface-container-lowest text-outline flex items-center justify-center mr-3 shrink-0">
                        volunteer_activism
                      </span>
                    )}
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-on-surface font-semibold text-[14px] truncate">{charity.name}</p>
                      <p className="text-on-surface-variant text-[11px] mt-0.5 truncate">{charity.cause}</p>
                    </div>
                    <span className="material-symbols-outlined text-outline-variant text-[20px] flex items-center justify-center">chevron_right</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {comingSoonCharity && (
        <DonateComingSoon
          charityName={comingSoonCharity.name}
          onClose={() => setComingSoonCharity(null)}
        />
      )}
    </>
  );
}
