'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuthGate } from '@/providers/AuthGateProvider';
import ListingCard from '@/components/ListingCard';

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

  // Dynamic States
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

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

  // Fetch listings dynamically
  useEffect(() => {
    async function loadListings() {
      setLoading(true);
      try {
        let url = '/api/listings';
        const params = new URLSearchParams();
        if (activeBrand) {
          params.append('brand', activeBrand);
        }
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok && data.shoeListings) {
          setListings(data.shoeListings);
        }
      } catch (e) {
        console.error('Failed to load listings:', e);
      } finally {
        setLoading(false);
      }
    }
    loadListings();
  }, [activeBrand]);

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

  // Client-side category filtering
  const visibleListings = useMemo(() => {
    return listings.filter((l) => {
      if (!activeCategory) return true;
      const cat = (l.category || '').toLowerCase();
      const active = activeCategory.toLowerCase();
      if (active === 'lifestyle' || active === 'casual') {
        return cat === 'lifestyle' || cat === 'casual';
      }
      return cat === active;
    });
  }, [listings, activeCategory]);

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
      </main>
    </div>
  );
}