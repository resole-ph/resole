'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useAuthGate } from '@/providers/AuthGateProvider';

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

/* ---------------------------------------------------------
   UI Components
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

function ListingCard({
  listing,
  isSaved,
  onSave,
  currentUserId,
}: {
  listing: any;
  isSaved: boolean;
  onSave: (id: string) => void;
  currentUserId?: string;
}) {
  const { requireAuth } = useAuthGate();
  const isOwnListing = !!currentUserId && listing.seller?.id === currentUserId;

  const daysLeft = useMemo(() => {
    if (!listing.createdAt) return 30;
    const created = new Date(listing.createdAt);
    const diffTime = Math.abs(new Date().getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - diffDays);
  }, [listing.createdAt]);

  const badge = useMemo(() => {
    if (!listing.listingMode) return null;
    const mode = listing.listingMode;
    if (mode === 'Swap') return { bg: '#2563EB', text: '#fff', label: 'Swap' };
    if (mode === 'Sale') return { bg: '#10B981', text: '#fff', label: 'Sale' };
    if (mode === 'Both') return { bg: '#8B5CF6', text: '#fff', label: 'Sale & Swap' };
    return null;
  }, [listing.listingMode]);

  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: CARD_SHADOW,
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
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

        {/* Days left badge */}
        {daysLeft !== undefined ? (
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 9999,
              padding: '3px 8px',
              background: 'rgba(255, 255, 255, 0.9)',
              fontSize: 10,
              fontWeight: 700,
              color: '#374151',
              zIndex: 10,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 9999,
                marginRight: 4,
                background: daysLeft <= 3 ? '#EF4444' : '#10B981',
              }}
            />
            {daysLeft}d left
          </div>
        ) : null}

        {/* Mode badge */}
        {badge && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              borderRadius: 9999,
              padding: '3px 8px',
              background: badge.bg,
              color: badge.text,
              fontSize: 10,
              fontWeight: 700,
              zIndex: 10,
            }}
          >
            {badge.label}
          </div>
        )}

        {/* Save button (Only if not owned) */}
        {!isOwnListing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              requireAuth(() => onSave(listing.id), 'Log in to save listings to your favourites.');
            }}
            aria-label="Save listing"
            style={{
              position: 'absolute',
              bottom: 10,
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
        )}
      </div>

      <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: COLORS.textFaint, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {listing.brand}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: COLORS.green }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: COLORS.textMuted }}>{listing.condition || 'Good'}</span>
            </div>
          </div>
          <Link href={`/listings/${listing.id}`} style={{ textDecoration: 'none' }}>
            <div
              style={{ fontFamily: 'Inter, sans-serif', fontSize: 14.5, fontWeight: 700, color: COLORS.textMain, margin: '2px 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '36px' }}
              className="hover:text-primary transition-colors"
            >
              {listing.model}
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '6px 0 10px' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 800, color: COLORS.primary }}>
              ₱{Number(listing.price || 0).toLocaleString()}
            </span>
          </div>

          {/* Seller initials avatar + full name + rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 9999,
                background: '#E0F2FE',
                color: COLORS.primary,
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {listing.seller?.name ? listing.seller.name.substring(0, 1).toUpperCase() : 'S'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {listing.seller?.name || 'Resoler'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <span className="material-symbols-outlined text-amber-500 text-[13px] fill-current">star</span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.textMuted }}>{listing.seller?.rating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {isOwnListing ? (
            <Link
              href={`/sell?edit=${listing.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: '#F3F4F6',
                border: 'none',
                borderRadius: 12,
                padding: '9px 0',
                fontSize: 12.5,
                fontWeight: 700,
                color: '#4B5563',
                width: '100%',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              className="hover:bg-gray-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">edit</span>
              Edit Listing
            </Link>
          ) : listing.listingMode === 'Swap' ? (
            <Link
              href={`/listings/${listing.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: '#EFF6FF',
                border: '1.5px solid #BFDBFE',
                borderRadius: 12,
                padding: '8px 0',
                fontSize: 12.5,
                fontWeight: 700,
                color: COLORS.primary,
                width: '100%',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              className="hover:bg-blue-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
              Propose Swap
            </Link>
          ) : (
            <Link
              href={`/listings/${listing.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: '#EFF6FF',
                border: '1.5px solid #BFDBFE',
                borderRadius: 12,
                padding: '8px 0',
                fontSize: 12.5,
                fontWeight: 700,
                color: COLORS.primary,
                width: '100%',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              className="hover:bg-blue-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">sell</span>
              Make Offer
            </Link>
          )}
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);

  // Dynamic States
  const [user, setUser] = useState<any>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Fetch logged in user & saved favorites
  useEffect(() => {
    async function loadUserData() {
      try {
        const resUser = await fetch('/api/users/me');
        const dataUser = await resUser.json();
        if (resUser.ok && dataUser.user) {
          setUser(dataUser.user);
        }

        const resFav = await fetch('/api/users/me/favourites');
        const dataFav = await resFav.json();
        if (resFav.ok && dataFav.favourites) {
          setSavedIds(new Set(dataFav.favourites.map((f: any) => String(f.listingId || f.listing?.id))));
        }
      } catch (e) {
        console.error('Failed to load user data:', e);
      }
    }
    loadUserData();
  }, []);

  // Fetch listings dynamically with SWR
  const fetcher = (url: string) => fetch(url).then(r => r.json());
  
  const listingsUrl = useMemo(() => {
    let url = '/api/listings';
    const params = new URLSearchParams();
    if (activeBrand) {
      params.append('brand', activeBrand);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    return url;
  }, [activeBrand]);

  const { data: listingsData, isLoading: loading } = useSWR(listingsUrl, fetcher, {
    revalidateOnFocus: false, // Prevents awful refetching on every tab click
    dedupingInterval: 60000, // 1 minute deduplication cache
  });
  
  const listings = listingsData?.shoeListings || [];

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

  // Client-side category filtering & hide own listings
  const visibleListings = useMemo(() => {
    return listings.filter((l: any) => {
      // Hide own listings
      if (user?.id && l.seller?.id === user.id) return false;

      if (!activeCategory) return true;
      const cat = (l.category || '').toLowerCase();
      const active = activeCategory.toLowerCase();
      if (active === 'lifestyle' || active === 'casual') {
        return cat === 'lifestyle' || cat === 'casual';
      }
      return cat === active;
    });
  }, [listings, activeCategory, user]);

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background, fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* ---------------- Main ---------------- */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 64px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: COLORS.textMain, margin: 0 }}>
            {greeting}, {user?.name || 'Resoler'}
          </h1>
          <p style={{ fontSize: 14.5, color: COLORS.textFaint, margin: '4px 0 0' }}>Find your next pair today</p>
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

        {/* Categories */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: 0 }}>Categories</h3>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
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

        {/* Charities */}
        <CharitiesSection selectedCharity={selectedCharity} onSelect={setSelectedCharity} />

        {/* Brands */}
        <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: '0 0 16px' }}>Brands</h3>
        <div style={{ display: 'flex', gap: 10, marginBottom: 36, flexWrap: 'wrap' }}>
          {BRANDS.map((b) => (
            <Pill
              key={b}
              active={activeBrand === b}
              onClick={() => setActiveBrand(activeBrand === b ? null : b)}
            >
              {b}
            </Pill>
          ))}
        </div>

        {/* Filter / sort bar + listings */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 13.5, color: COLORS.textFaint, margin: 0 }}>
            <span style={{ color: COLORS.textMain, fontWeight: 700 }}>{visibleListings.length}</span> products found
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p style={{ fontSize: 13.5, color: COLORS.textMuted, marginTop: 12 }}>Fetching marketplace listings...</p>
          </div>
        ) : visibleListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-symbols-outlined text-[48px] text-outline-variant">inventory_2</span>
            <p style={{ fontSize: 14.5, color: COLORS.textMuted, marginTop: 12 }}>No sneaker listings found matching the filters.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 20,
            }}
          >
            {visibleListings.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                isSaved={savedIds.has(String(l.id))}
                onSave={handleSaveListing}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}