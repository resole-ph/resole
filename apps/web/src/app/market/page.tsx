'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import ListingCard from "@/components/ListingCard";
import { useListings } from "@/features/shoe/queries/listing.queries";
import { useSearchSuggestions } from "@/features/search/queries/search.queries";
import { profileKeys, useMyFavourites } from "@/features/profile/queries/profile.queries";
import type { FavouriteItem } from "@/features/profile/types/profile.types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthGate } from "@/providers/AuthGateProvider";
import type { SerializedShoeListing } from "@/features/shoe/utils/listing-dto";

const COLORS = {
  primary: "#2563EB",
  background: "#F9FAFB",
  surface: "#FFFFFF",
  textMain: "#191C1D",
  textMuted: "#6B7280",
  textFaint: "#9CA3AF",
  border: "#E5E7EB",
} as const;

const BRANDS = ["All", "Nike", "Adidas", "Jordan", "New Balance", "Yeezy", "Asics"];
const CATEGORIES = [
  { id: 'running', label: 'Running', icon: 'directions_run', iconColor: '#F59E0B' },
  { id: 'basketball', label: 'Basketball', icon: 'sports_basketball', iconColor: '#EF4444' },
  { id: 'football', label: 'Football', icon: 'sports_soccer', iconColor: '#16A34A' },
  { id: 'lifestyle', label: 'Lifestyle', icon: 'wb_sunny', iconColor: '#8B5CF6' },
  { id: 'skate', label: 'Skate', icon: 'trending_up', iconColor: '#10B981' },
  { id: 'training', label: 'Training', icon: 'fitness_center', iconColor: '#3B82F6' },
  { id: 'casual', label: 'Casual', icon: 'checkroom', iconColor: '#EC4899' },
  { id: 'other', label: 'Other', icon: 'more_horiz', iconColor: '#6B7280' },
] as const;

export default function MarketPage() {
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Closes only on a real outside click; an onBlur handler here raced with the
  // click on a suggestion and swallowed it.
  useEffect(() => {
    if (!isSearchFocused) return;

    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchFocused]);

  const { data: favouritesData } = useMyFavourites();

  // Overlay for hearts the user just toggled — the optimistic update has to
  // survive until the refetch lands.
  const [pendingSaves, setPendingSaves] = useState<Map<string, boolean>>(new Map());

  const savedIds = useMemo(() => {
    const ids = new Set<string>(
      // `details.id` is the save row's id, not the listing's — only
      // `listing.id` matches what the cards are keyed by.
      (favouritesData?.favourites ?? []).map((row: FavouriteItem) => String(row.listing.id))
    );
    pendingSaves.forEach((saved, id) => (saved ? ids.add(id) : ids.delete(id)));
    return ids;
  }, [favouritesData, pendingSaves]);

  const handleSaveListing = async (listingId: string) => {
    const isSaved = savedIds.has(listingId);
    setPendingSaves((prev) => new Map(prev).set(listingId, !isSaved));

    try {
      await fetch(`/api/listings/${listingId}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
      });
      await queryClient.invalidateQueries({ queryKey: profileKeys.myFavourites() });
    } catch (e) {
      console.error('Failed to toggle saved listing:', e);
    } finally {
      setPendingSaves((prev) => {
        const next = new Map(prev);
        next.delete(listingId);
        return next;
      });
    }
  };

  const handleFavorite = (listingId: string) =>
    requireAuth(() => handleSaveListing(listingId), 'Log in to save listings to your favourites.');

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const { data: suggestions } = useSearchSuggestions(debouncedSearch);
  const shoeSuggestions = suggestions?.shoes ?? [];
  const peopleSuggestions = suggestions?.people ?? [];
  const showSuggestions =
    isSearchFocused &&
    debouncedSearch.trim().length >= 2 &&
    (shoeSuggestions.length > 0 || peopleSuggestions.length > 0);

  const handlePickShoe = (shoe: { brand: string; model: string }) => {
    setSearchQuery(`${shoe.brand} ${shoe.model}`);
    setIsSearchFocused(false);
  };

  const handlePickPerson = (person: { id: string; name: string }) => {
    setIsSearchFocused(false);
    router.push(`/users/${person.id}`);
  };

  const { data: saleListings = [], isPending: loadingSale } = useListings({
    section: "sale-board",
    category: selectedCategory ?? undefined,
    brand: selectedBrand,
    search: debouncedSearch,
  });

  const { data: swapListings = [], isPending: loadingSwap } = useListings({
    section: "swap-board",
    category: selectedCategory ?? undefined,
    brand: selectedBrand,
    search: debouncedSearch,
  });

  // Narrows the grid during the 300ms before the debounced request goes out;
  // without it the list visibly lags your typing.
  const filterListings = (list: SerializedShoeListing[]) => {
    return list.filter((item) => {
      const matchesBrand = selectedBrand === "All" || item.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchesCategory = !selectedCategory || item.category?.toLowerCase() === selectedCategory;
      const term = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        item.model.toLowerCase().includes(term) ||
        item.brand.toLowerCase().includes(term) ||
        `${item.brand} ${item.model}`.toLowerCase().includes(term) ||
        (item.colorway && item.colorway.toLowerCase().includes(term));
      const matchesFavorite = !favoritesOnly || savedIds.has(String(item.id));
      return matchesBrand && matchesCategory && matchesSearch && matchesFavorite;
    });
  };

  const filteredSaleListings = filterListings(saleListings);
  const filteredSwapListings = filterListings(swapListings);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.background, fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');
        * { box-sizing: border-box; }
      `}</style>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 24px 80px" }}>
        
        <div ref={searchContainerRef} style={{ marginBottom: 16, position: "relative" }}>
          <span className="material-symbols-outlined" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: COLORS.textFaint, fontSize: 20 }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search model, brand, or colorway..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            style={{
              width: "100%",
              padding: "14px 16px 14px 48px",
              borderRadius: 16,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.surface,
              fontSize: 14,
              outline: "none",
              boxShadow: "0px 2px 8px rgba(0,0,0,0.02)",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", color: COLORS.textFaint }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          )}

          {showSuggestions && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                right: 0,
                background: COLORS.surface,
                borderRadius: 18,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0px 12px 32px rgba(0,0,0,0.1)",
                zIndex: 20,
                overflow: "hidden",
              }}
            >
              {shoeSuggestions.length > 0 && (
                <div style={{ padding: "12px 10px 6px" }}>
                  <p style={{ margin: "0 10px 6px", fontSize: 11.5, fontWeight: 700, color: COLORS.textFaint, letterSpacing: 0.5, textTransform: "uppercase" }}>
                    Shoes
                  </p>
                  {shoeSuggestions.map((shoeItem: { brand: string; model: string }, index: number) => (
                    <button
                      key={`${shoeItem.brand}-${shoeItem.model}-${index}`}
                      onClick={() => handlePickShoe(shoeItem)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "12px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        borderRadius: 12,
                        fontSize: 15,
                        color: COLORS.textMain,
                        transition: "background 0.12s ease",
                      }}
                      className="hover:bg-gray-50"
                    >
                      <span
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: "rgba(37,99,235,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                        aria-hidden
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 22, color: COLORS.primary }}>
                          footprint
                        </span>
                      </span>
                      <span>
                        <span style={{ fontWeight: 700 }}>{shoeItem.brand}</span> {shoeItem.model}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {peopleSuggestions.length > 0 && (
                <div style={{ padding: "6px 10px 12px", borderTop: shoeSuggestions.length > 0 ? `1px solid ${COLORS.border}` : "none" }}>
                  <p style={{ margin: "10px 10px 6px", fontSize: 11.5, fontWeight: 700, color: COLORS.textFaint, letterSpacing: 0.5, textTransform: "uppercase" }}>
                    People
                  </p>
                  {peopleSuggestions.map((person: { id: string; name: string }) => (
                    <button
                      key={person.id}
                      onClick={() => handlePickPerson(person)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "12px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        borderRadius: 12,
                        fontSize: 15,
                        color: COLORS.textMain,
                        transition: "background 0.12s ease",
                      }}
                      className="hover:bg-gray-50"
                    >
                      <span
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: "rgba(124,58,237,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                        aria-hidden
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#7C3AED" }}>
                          person
                        </span>
                      </span>
                      <span style={{ fontWeight: 600 }}>{person.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <button
            onClick={() => setFavoritesOnly((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderRadius: 9999,
              padding: "8px 16px",
              background: favoritesOnly ? "#FEE2E2" : COLORS.surface,
              border: `1px solid ${favoritesOnly ? "#FCA5A5" : COLORS.border}`,
              color: favoritesOnly ? "#DC2626" : COLORS.textMain,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: favoritesOnly ? "#DC2626" : COLORS.textFaint }}>favorite</span>
            Saved Kicks
          </button>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
            Category
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(active ? null : category.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 9999,
                    padding: "8px 18px",
                    background: active ? "#111827" : COLORS.surface,
                    color: active ? "#FFFFFF" : COLORS.textMain,
                    border: `1px solid ${active ? "#111827" : COLORS.border}`,
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: active ? "#FFFFFF" : category.iconColor }}>
                    {category.icon}
                  </span>
                  {category.label}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
            Brand
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {BRANDS.map((brand) => {
              const active = selectedBrand === brand;
              return (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  style={{
                    borderRadius: 9999,
                    padding: "8px 18px",
                    background: active ? COLORS.primary : COLORS.surface,
                    color: active ? "#FFFFFF" : COLORS.textMain,
                    border: `1px solid ${active ? COLORS.primary : COLORS.border}`,
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  {brand}
                </button>
              );
            })}
          </div>
        </div>

        <section style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textMain, margin: 0 }}>For Sale</h2>
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textFaint }}>
              {filteredSaleListings.length} pairs available
            </span>
          </div>
          <p style={{ fontSize: 13, color: COLORS.textFaint, margin: "0 0 20px" }}>Grab your pair at the best price</p>

          {loadingSale ? (
            <p style={{ fontSize: 13.5, color: COLORS.textMuted }}>Fetching sale listings...</p>
          ) : filteredSaleListings.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}` }}>
              <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0 }}>No sale listings found matching your search.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20 }}>
              {filteredSaleListings.map((item) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  currentUserId={user?.id}
                  isSaved={savedIds.has(String(item.id))}
                  onFavorite={handleFavorite}
                  onRequireApp={() => requireAuth(() => router.push(`/listings/${item.id}`), 'Log in to make an offer.')}
                />
              ))}
            </div>
          )}
        </section>

        <section style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: COLORS.primary }}>swap_horiz</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textMain, margin: 0 }}>Swap Board</h2>
          </div>
          <p style={{ fontSize: 13, color: COLORS.textFaint, margin: "0 0 20px" }}>Trade kicks with the community — circular commerce at its best</p>

          {loadingSwap ? (
            <p style={{ fontSize: 13.5, color: COLORS.textMuted }}>Fetching swap listings...</p>
          ) : filteredSwapListings.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}` }}>
              <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0 }}>No swap listings found matching your search.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20 }}>
              {filteredSwapListings.map((item) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  currentUserId={user?.id}
                  isSaved={savedIds.has(String(item.id))}
                  onFavorite={handleFavorite}
                  onRequireApp={() => requireAuth(() => router.push(`/swap?id=${item.id}`), 'Log in to propose a swap.')}
                />
              ))}
            </div>
          )}
        </section>

        <section style={{ borderRadius: 16, padding: 20, background: "#EFF6FF", textAlign: "center" }}>
          <div style={{ color: COLORS.primary, fontSize: 12, fontWeight: 700 }}>COMING SOON</div>
          <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}>
            Vouchers and promo codes will appear here soon.
          </div>
        </section>
      </main>

      <button
        onClick={() => requireAuth(() => router.push('/sell'), 'Log in to list a pair.')}
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: COLORS.primary,
          color: "#FFFFFF",
          border: "none",
          borderRadius: 9999,
          padding: "14px 22px",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0px 8px 20px rgba(37,99,235,0.35)",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
        Sell Your Kicks
      </button>
    </div>
  );
}
