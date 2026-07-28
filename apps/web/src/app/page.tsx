'use client';

import { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import { useAuthGate } from '@/providers/AuthGateProvider';
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

const CHARITIES = [
  { id: 'gawad-kalinga', name: 'Gawad Kalinga', cause: 'Community building', image: '/charity-gawad-kalinga.jpg' },
  { id: 'red-cross', name: 'Philippine Red Cross', cause: 'Disaster relief', image: '/charity-red-cross.png' },
  { id: 'wwf', name: 'WWF Philippines', cause: 'Environment & wildlife', image: '/charity-wwf.jpg' },
  { id: 'unicef', name: 'UNICEF Philippines', cause: "Children's welfare", image: '/charity-unicef.png' },
  { id: 'caritas', name: 'Caritas Philippines', cause: 'Poverty alleviation', image: '/charity-caritas.png' },
  { id: 'save-children', name: 'Save the Children', cause: 'Child education', image: '/charity-save-children.png' },
];

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

function ListingCard({
  listing,
  isSaved,
  onSave,
}: {
  listing: any;
  isSaved: boolean;
  onSave: (id: string) => void;
}) {
  const { requireAuth } = useAuthGate();
  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: CARD_SHADOW,
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
      className="group hover:-translate-y-1 hover:shadow-lg"
    >
      <div style={{ position: 'relative', aspectRatio: '1/1', background: '#F3F4F6', overflow: 'hidden' }}>
        <Link href={`/listings/${listing.id}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={listing.imageUrl || listing.imageUrlTop || 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=600&auto=format&fit=crop'}
            alt={`${listing.brand} ${listing.model}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.5)' }}
          />
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            requireAuth(() => onSave(listing.id), 'Log in to save listings to your favourites.');
          }}
          aria-label="Save listing"
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 30,
            height: 30,
            borderRadius: 9999,
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 18,
              color: isSaved ? COLORS.red : '#6B7280',
              fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            favorite
          </span>
        </button>
      </div>

      <div style={{ padding: '12px 14px 14px' }}>
        <Link href={`/listings/${listing.id}`}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: COLORS.textFaint, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {listing.brand}
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14.5, fontWeight: 700, color: COLORS.textMain, margin: '2px 0 4px' }} className="hover:text-primary transition-colors truncate">
            {listing.model}
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: 9999, background: COLORS.green }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: COLORS.textMuted }}>{listing.condition || 'Good Condition'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 700, color: COLORS.textMain }}>
            ₱{Number(listing.price || 0).toLocaleString()}
          </span>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 9999,
              background: COLORS.primary,
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {listing.seller?.name ? listing.seller.name.substring(0, 1).toUpperCase() : 'R'}
          </div>
        </div>
      </div>
    </div>
  );
}

function CharityCard({ charity, selected, onClick }: { charity: any; selected: boolean; onClick: () => void }) {
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={charity.image}
        alt={charity.name}
        style={{ width: '100%', height: 90, objectFit: 'contain', borderRadius: 12, marginBottom: 10, background: '#F9FAFB' }}
      />
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

function CharitiesSection({ selectedCharity, onSelect }: { selectedCharity: string | null; onSelect: (id: string | null) => void }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: 0 }}>Support a Cause</h3>
        <p style={{ fontSize: 13, color: COLORS.textFaint, margin: '2px 0 0' }}>
          Pick a charity — donation proceeds go straight to them.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
        {CHARITIES.map((charity) => (
          <CharityCard
            key={charity.id}
            charity={charity}
            selected={selectedCharity === charity.id}
            onClick={() => onSelect(selectedCharity === charity.id ? null : charity.id)}
          />
        ))}
      </div>
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
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Dynamic States
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'favourites'>('inventory');
  const [myListings, setMyListings] = useState<any[]>([]);
  const [favourites, setFavourites] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const loadFavourites = useCallback(async () => {
    try {
      const res = await fetch('/api/users/me/favourites');
      const data = await res.json();
      if (res.ok && data.favourites) {
        const rows = data.favourites.map(favouriteToListing);
        setFavourites(rows);
        setSavedIds(new Set(rows.map((r: any) => r.id)));
      }
    } catch (e) {
      console.error('Failed to load favourites:', e);
    }
  }, []);

  // The home page only shows the signed-in user's own inventory and the
  // listings they favourited — the full catalogue lives on /market.
  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      try {
        const resUser = await fetch('/api/users/me');
        const dataUser = await resUser.json();
        if (resUser.ok && dataUser.user) {
          setUser(dataUser.user);
        }

        const resMine = await fetch('/api/users/me/listings');
        const dataMine = await resMine.json();
        if (resMine.ok && dataMine.shoeListings) {
          setMyListings(dataMine.shoeListings);
        }

        await loadFavourites();
      } catch (e) {
        console.error('Failed to load user data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [loadFavourites]);

  const handleSaveListing = async (listingId: string) => {
    const isSaved = savedIds.has(listingId);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(listingId);
      else next.add(listingId);
      return next;
    });

    try {
      await fetch(`/api/listings/${listingId}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
      });
      // Keep the favourites tab in sync with the heart toggle.
      await loadFavourites();
    } catch (e) {
      console.error('Failed to toggle saved listing:', e);
      // Revert on error
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(listingId);
        else next.delete(listingId);
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
          <CharitiesSection selectedCharity={selectedCharity} onSelect={setSelectedCharity} />
        </div>
      </main>
    </div>
  );
}