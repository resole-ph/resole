'use client';

import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthGate } from '@/providers/AuthGateProvider';
import {
  profileKeys,
  useMyFavourites,
  useMyListings,
  useMyProfile,
} from '@/features/profile/queries/profile.queries';
import ListingCard from '@/components/ListingCard';
import { getConditionLabel } from '@/features/sell/utils/condition';

/* ---------------------------------------------------------
   Resole design tokens
   --------------------------------------------------------- */
const COLORS = {
  primary: '#2563EB',
  primaryDark: '#004AC6',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  textMain: '#191C1D',
  textMuted: '#6B7280',
  textFaint: '#9CA3AF',
  border: '#E5E7EB',
  inputBg: '#F3F4F6',
};

const CARD_SHADOW = '0px 4px 20px rgba(0,0,0,0.05)';

/* ---------------------------------------------------------
   Static configurations
   --------------------------------------------------------- */
const CATEGORIES = [
  { label: 'Running', icon: 'directions_run', iconColor: '#F59E0B' },
  { label: 'Basketball', icon: 'sports_basketball', iconColor: '#EF4444' },
  { label: 'Lifestyle', icon: 'wb_sunny', iconColor: '#8B5CF6' },
  { label: 'Skate', icon: 'trending_up', iconColor: '#10B981' },
  { label: 'Training', icon: 'fitness_center', iconColor: '#3B82F6' },
  { label: 'Casual', icon: 'checkroom', iconColor: '#EC4899' },
  { label: 'Other', icon: 'more_horiz', iconColor: '#EC4899' },
];

const BRANDS = ['Nike', 'Adidas', 'Jordan Brand', 'New Balance', 'Asics', 'Salomon', 'Puma'];

type CharitySummary = {
  id: number;
  name: string;
  cause: string;
  image: string | null;
};

/** Flattens a favourite row into the same shape ListingCard expects. */
function favouriteToListing(row: any) {
  return {
    id: String(row.listing?.id ?? row.listingId),
    brand: row.shoe?.brand ?? row.details?.brand ?? '',
    model: row.shoe?.model ?? row.details?.model ?? '',
    price: Number(row.listing?.value ?? row.details?.price ?? 0),
    condition: getConditionLabel(Number(row.listing?.conditionScore ?? 0)),
    category: row.shoe?.category ?? '',
    imageUrl: row.listing?.imageUrlTop ?? null,
    seller: { name: row.user?.name },
  };
}

/* ---------------------------------------------------------
   UI Sub-components
   --------------------------------------------------------- */
function Pill({
  children,
  icon,
  iconColor,
  active,
  onClick,
}: {
  children: string;
  icon?: string;
  iconColor?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        borderRadius: 9999,
        padding: '8px 18px',
        fontSize: 13.5,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        border: active ? 'none' : `1px solid ${COLORS.border}`,
        background: active ? COLORS.primary : COLORS.surface,
        color: active ? '#fff' : COLORS.textMain,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {icon && (
        <span className="material-symbols-outlined" style={{ fontSize: 15, color: active ? '#fff' : iconColor }}>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}

/**
 * Animates its children open/closed. The content stays mounted and its height
 * is measured so max-height can transition to a real value rather than a guess.
 */
function Collapsible({ open, children }: { open: boolean; children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const measure = () => setHeight(el.scrollHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden={!open}
      style={{
        maxHeight: open ? height : 0,
        opacity: open ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.28s ease, opacity 0.2s ease',
      }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}

/** Compact removable chip summarising an applied filter. */
function ActiveFilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        borderRadius: 9999,
        padding: '5px 8px 5px 12px',
        fontSize: 12.5,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        background: '#EFF6FF',
        color: '#1D4ED8',
      }}
    >
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          color: '#1D4ED8',
          cursor: 'pointer',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>close</span>
      </button>
    </span>
  );
}


function CharityCard({ charity, selected, onClick }: { charity: CharitySummary; selected: boolean; onClick: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button
      onClick={onClick}
      style={{
        width: 160,
        textAlign: 'left',
        flexShrink: 0,
        background: selected ? '#EFF6FF' : COLORS.surface,
        borderRadius: 16,
        padding: 12,
        border: selected ? `1.5px solid ${COLORS.primary}` : `1.5px solid ${COLORS.border}`,
        boxShadow: CARD_SHADOW,
        cursor: 'pointer',
        position: 'relative',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {charity.image && !imageFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={charity.image}
          alt={`${charity.name} logo`}
          onError={() => setImageFailed(true)}
          style={{ width: '100%', height: 90, objectFit: 'contain', borderRadius: 12, marginBottom: 10, background: '#F9FAFB' }}
        />
      ) : (
        <div style={{ width: '100%', height: 90, borderRadius: 12, marginBottom: 10, background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ color: COLORS.textFaint, fontSize: 28 }}>volunteer_activism</span>
        </div>
      )}
      <div style={{ fontSize: 13.5, fontWeight: 700, color: selected ? '#1D4ED8' : COLORS.textMain, marginBottom: 2 }}>
        {charity.name}
      </div>
      <div style={{ fontSize: 11.5, color: COLORS.textFaint }} className="truncate">{charity.cause}</div>

      {selected && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 20,
            height: 20,
            borderRadius: 9999,
            background: COLORS.primary,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check</span>
        </div>
      )}
    </button>
  );
}

function CharitiesSection({ charities, loading, unavailable, selectedCharity, onSelect }: {
  charities: CharitySummary[];
  loading: boolean;
  unavailable: boolean;
  selectedCharity: number | null;
  onSelect: (id: number | null) => void;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: 0 }}>Support a Cause</h3>
        <p style={{ fontSize: 13, color: COLORS.textFaint, margin: '2px 0 0' }}>
          Pick a charity — donation proceeds go straight to them.
        </p>
      </div>
      {loading ? (
        <div style={{ color: COLORS.textFaint, fontSize: 13, padding: '20px 0' }}>Loading charity partners…</div>
      ) : unavailable || charities.length === 0 ? (
        <div style={{ borderRadius: 16, padding: 20, background: '#EFF6FF', textAlign: 'center' }}>
          <div style={{ color: COLORS.primary, fontSize: 12, fontWeight: 700 }}>COMING SOON</div>
          <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}>Charity partners will appear here soon.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
        {charities.map((charity) => (
          <CharityCard
            key={charity.id}
            charity={charity}
            selected={selectedCharity === charity.id}
            onClick={() => onSelect(selectedCharity === charity.id ? null : charity.id)}
          />
        ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   Main Page Component
   --------------------------------------------------------- */
export default function ResoleHome() {
  const { requireAuth } = useAuthGate();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [selectedCharity, setSelectedCharity] = useState<number | null>(null);
  const [charities, setCharities] = useState<CharitySummary[]>([]);
  const [charitiesLoading, setCharitiesLoading] = useState(true);
  const [charitiesUnavailable, setCharitiesUnavailable] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Dynamic States
  const queryClient = useQueryClient();

  useEffect(() => {
    fetch('/api/charities')
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to load charities');
        return response.json() as Promise<{ charities?: CharitySummary[] }>;
      })
      .then((data) => setCharities(data.charities ?? []))
      .catch(() => setCharitiesUnavailable(true))
      .finally(() => setCharitiesLoading(false));
  }, []);
  const [activeTab, setActiveTab] = useState<'inventory' | 'favourites'>('inventory');

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // The home page only shows the signed-in user's own inventory and the
  // listings they favourited — the full catalogue lives on /market.
  //
  // These are the same three query keys the /profile page uses, so moving
  // between home and profile is a cache hit in both directions rather than
  // six repeated requests.
  const { data: user } = useMyProfile();
  const { data: myListingsData, isPending: loading } = useMyListings();
  const { data: favouritesData } = useMyFavourites();

  const myListings = myListingsData ?? [];

  // `any[]` preserves what this was before the cache conversion, when
  // `favourites` was untyped state. favouriteToListing only builds 8 of the
  // ~26 fields ListingCard expects, so typing it properly fails to compile —
  // a real pre-existing gap in the favourites mapping, not one to fix here.
  const favourites = useMemo<any[]>(
    () => (favouritesData?.favourites ?? []).map(favouriteToListing),
    [favouritesData]
  );

  // Derived from the cache, but with an overlay for hearts the user just
  // toggled — the optimistic update has to survive until the refetch lands.
  const [pendingSaves, setPendingSaves] = useState<Map<string, boolean>>(new Map());

  const savedIds = useMemo(() => {
    const ids = new Set<string>(favourites.map((r: any) => r.id));
    pendingSaves.forEach((saved, id) => (saved ? ids.add(id) : ids.delete(id)));
    return ids;
  }, [favourites, pendingSaves]);

  const handleSaveListing = async (listingId: string) => {
    const isSaved = savedIds.has(listingId);
    setPendingSaves((prev) => new Map(prev).set(listingId, !isSaved));

    try {
      await fetch(`/api/listings/${listingId}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
      });
      // Refetch the shared entry so the favourites tab here and the preview
      // card on /profile both reflect the toggle.
      await queryClient.invalidateQueries({ queryKey: profileKeys.myFavourites() });
      setPendingSaves((prev) => {
        const next = new Map(prev);
        next.delete(listingId);
        return next;
      });
    } catch (e) {
      console.error('Failed to toggle saved listing:', e);
      setPendingSaves((prev) => {
        const next = new Map(prev);
        next.delete(listingId);
        return next;
      });
    }
  };

  const activeFilterCount = (activeCategory ? 1 : 0) + (activeBrand ? 1 : 0);

  const TABS = [
    { key: 'inventory' as const, label: 'My Inventory', icon: 'inventory_2', count: myListings.length },
    { key: 'favourites' as const, label: 'Saved Shoes', icon: 'favorite', count: favourites.length },
  ];

  // Slide the segmented-control thumb under whichever tab is active. The two
  // segments aren't equal width (labels and counts differ), so measure them.
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [thumb, setThumb] = useState({ left: 0, width: 0, ready: false });

  useLayoutEffect(() => {
    function measure() {
      const el = tabRefs.current[activeTab];
      if (!el) return;
      setThumb({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeTab, myListings.length, favourites.length]);

  // Client-side brand + category filtering over the active tab
  const visibleListings = useMemo(() => {
    const source = activeTab === 'inventory' ? myListings : favourites;
    return source.filter((l) => {
      if (activeBrand && (l.brand || '').toLowerCase() !== activeBrand.toLowerCase()) return false;
      if (!activeCategory) return true;
      const cat = (l.category || '').toLowerCase();
      const active = activeCategory.toLowerCase();
      if (active === 'lifestyle' || active === 'casual') {
        return cat === 'lifestyle' || cat === 'casual';
      }
      return cat === active;
    });
  }, [activeTab, myListings, favourites, activeBrand, activeCategory]);

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background, fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes resole-tab-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .resole-tab-panel { animation: resole-tab-in 0.26s cubic-bezier(0.4, 0, 0.2, 1); }
        @media (prefers-reduced-motion: reduce) {
          .resole-tab-panel { animation: none; }
        }
      `}</style>

      {/* ---------------- Main ---------------- */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 64px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: COLORS.textMain, margin: 0 }}>
            {greeting}, {user?.name || 'Resoler'}
          </h1>
          <p style={{ fontSize: 14.5, color: COLORS.textFaint, margin: '4px 0 0' }}>
            Your shoes and the ones you&apos;ve saved
          </p>
        </div>

        {/* Hero banner */}
        <div
          style={{
            position: 'relative',
            borderRadius: 28,
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 60%, #3b7cf0 100%)`,
            padding: '60px 60px',
            marginBottom: 32,
            minHeight: 360,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 460 }}>
            <h2 style={{ color: '#fff', fontSize: 42, fontWeight: 800, lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              Know what your kicks are worth.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 16, lineHeight: 1.6, margin: '0 0 28px' }}>
              Get instant AI-driven valuation for any sneaker in our database with 98% accuracy.
            </p>
            <Link
              href="/sell"
              style={{
                background: '#fff',
                color: COLORS.primary,
                border: 'none',
                borderRadius: 9999,
                padding: '14px 28px',
                fontSize: 15,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: '0px 4px 14px rgba(0,0,0,0.1)',
                textDecoration: 'none',
              }}
              className="hover:scale-[1.03] transition-transform duration-200"
            >
              Try Valuation <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
            </Link>
          </div>

          {/* Sized up sneaker to match container background bounds */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=80&w=900&auto=format&fit=crop"
            alt="Featured sneaker"
            style={{
              position: 'absolute',
              right: -10,
              bottom: -40,
              width: 560,
              height: 560,
              objectFit: 'contain',
              transform: 'rotate(-10deg)',
              filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.4))',
            }}
          />
        </div>

        {/* Your Shoes — inventory / saved tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
          <div
            role="tablist"
            style={{
              position: 'relative',
              display: 'inline-flex',
              gap: 4,
              padding: 4,
              background: COLORS.inputBg,
              borderRadius: 9999,
            }}
          >
            {/* Sliding thumb behind the active segment */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: 4,
                bottom: 4,
                left: thumb.left,
                width: thumb.width,
                background: COLORS.surface,
                borderRadius: 9999,
                boxShadow: '0px 1px 3px rgba(0,0,0,0.12)',
                opacity: thumb.ready ? 1 : 0,
                transition: thumb.ready
                  ? 'left 0.28s cubic-bezier(0.4, 0, 0.2, 1), width 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease'
                  : 'none',
              }}
            />
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={isActive}
                  ref={(el) => {
                    tabRefs.current[tab.key] = el;
                  }}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 9999,
                    padding: '9px 18px',
                    fontSize: 13.5,
                    fontWeight: 700,
                    fontFamily: 'Inter, sans-serif',
                    color: isActive ? COLORS.textMain : COLORS.textMuted,
                    cursor: 'pointer',
                    transition: 'color 0.22s ease',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 17,
                      color: isActive ? COLORS.primary : COLORS.textFaint,
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                      transform: isActive ? 'scale(1.08)' : 'scale(1)',
                      transition: 'color 0.22s ease, transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                  <span
                    style={{
                      minWidth: 20,
                      borderRadius: 9999,
                      padding: '1px 6px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      background: isActive ? '#EFF6FF' : 'rgba(0,0,0,0.06)',
                      color: isActive ? COLORS.primary : COLORS.textMuted,
                      transition: 'background 0.22s ease, color 0.22s ease',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
          <Link
            href="/market"
            style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.primary, textDecoration: 'none' }}
          >
            Browse the full market →
          </Link>
        </div>

        {/* Result count + collapsible filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 13.5, color: COLORS.textFaint, margin: 0 }}>
            <span style={{ color: COLORS.textMain, fontWeight: 700 }}>{visibleListings.length}</span>{' '}
            {activeTab === 'inventory' ? 'of your pairs' : 'saved shoes'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {activeCategory && (
              <ActiveFilterChip label={activeCategory} onRemove={() => setActiveCategory(null)} />
            )}
            {activeBrand && <ActiveFilterChip label={activeBrand} onRemove={() => setActiveBrand(null)} />}
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setActiveCategory(null);
                  setActiveBrand(null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 12.5,
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  color: COLORS.textMuted,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Clear all
              </button>
            )}

            <button
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 9999,
                padding: '8px 16px',
                fontSize: 13.5,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                border: `1px solid ${filtersOpen || activeFilterCount > 0 ? COLORS.primary : COLORS.border}`,
                background: filtersOpen ? COLORS.primary : COLORS.surface,
                color: filtersOpen ? '#fff' : activeFilterCount > 0 ? COLORS.primary : COLORS.textMain,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>tune</span>
              Filters
              {activeFilterCount > 0 && (
                <span
                  style={{
                    minWidth: 17,
                    height: 17,
                    borderRadius: 9999,
                    background: filtersOpen ? 'rgba(255,255,255,0.25)' : COLORS.primary,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 5px',
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                {filtersOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>
        </div>

        <Collapsible open={filtersOpen}>
          {/* Padding rather than margin so the measured height stays accurate. */}
          <div
            style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 16,
              padding: '18px 20px',
              boxShadow: CARD_SHADOW,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Category
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              {CATEGORIES.map((c) => (
                <Pill
                  key={c.label}
                  icon={c.icon}
                  iconColor={c.iconColor}
                  active={activeCategory === c.label}
                  onClick={() => setActiveCategory(activeCategory === c.label ? null : c.label)}
                >
                  {c.label}
                </Pill>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Brand
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {BRANDS.map((b) => (
                <Pill key={b} active={activeBrand === b} onClick={() => setActiveBrand(activeBrand === b ? null : b)}>
                  {b}
                </Pill>
              ))}
            </div>
          </div>
          <div style={{ height: 20 }} />
        </Collapsible>

        {/* Keyed on the tab so switching remounts and replays the entry animation */}
        <div key={activeTab} className="resole-tab-panel">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p style={{ fontSize: 13.5, color: COLORS.textMuted, marginTop: 12 }}>Loading your shoes...</p>
          </div>
        ) : visibleListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-symbols-outlined text-[48px] text-outline-variant">
              {activeTab === 'inventory' ? 'inventory_2' : 'favorite'}
            </span>
            <p style={{ fontSize: 14.5, color: COLORS.textMuted, marginTop: 12 }}>
              {activeTab === 'inventory'
                ? 'Nothing in your inventory matches these filters.'
                : 'No saved shoes match these filters.'}
            </p>
            <Link
              href={activeTab === 'inventory' ? '/sell' : '/market'}
              style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.primary, textDecoration: 'none', marginTop: 8 }}
            >
              {activeTab === 'inventory' ? 'List a pair →' : 'Browse the market →'}
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 20,
            }}
          >
            {visibleListings.map((l) => (
              <ListingCard
                key={l.id}
                item={l}
                isSaved={savedIds.has(String(l.id))}
                onFavorite={(id) => {
                  requireAuth(() => handleSaveListing(id), 'Log in to save listings to your favourites.');
                }}
                onRequireApp={() => {
                  requireAuth(() => {}, 'Log in to interact with listings.');
                }}
              />
            ))}
          </div>
        )}
        </div>

        {/* Charities */}
        <div style={{ marginTop: 48 }}>
          <CharitiesSection
            charities={charities}
            loading={charitiesLoading}
            unavailable={charitiesUnavailable}
            selectedCharity={selectedCharity}
            onSelect={setSelectedCharity}
          />
        </div>
      </main>
    </div>
  );
}
