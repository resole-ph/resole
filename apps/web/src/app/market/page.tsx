'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ListingCard from "@/components/ListingCard";
import DownloadAppModal from "@/components/DownloadAppModal";
import { useListings } from "@/features/shoe/queries/listing.queries";
import { useSearchSuggestions } from "@/features/search/queries/search.queries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAuth } from "@/providers/AuthProvider";
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
  { id: 'running', label: 'Running' },
  { id: 'basketball', label: 'Basketball' },
  { id: 'football', label: 'Football' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'skate', label: 'Skate' },
  { id: 'training', label: 'Training' },
  { id: 'casual', label: 'Casual' },
  { id: 'other', label: 'Other' },
] as const;

export default function MarketPage() {
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  // Null when signed out, which is a valid way to browse the boards — every
  // card then reads as someone else's.
  const { user } = useAuth();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Closing the dropdown on the input's `onBlur` raced with the click on a
  // suggestion — the blur fired and unmounted the dropdown before the click
  // event landed, so suggestions looked unclickable. Closing only on a real
  // outside click removes that race entirely.
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

  // App Modal State
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [modalMeta, setModalMeta] = useState<{ title?: string; description?: string }>({});

  const triggerAppModal = (title?: string, description?: string) => {
    setModalMeta({ title, description });
    setIsAppModalOpen(true);
  };

  // The input updates on every keystroke for responsiveness, but only the
  // settled value reaches the query — otherwise typing "jordan" fired twelve
  // uncached requests across the two boards.
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

  // Cached per (section, brand, search), so clearing a filter or retyping a
  // previous search resolves from cache, and coming back from a listing page
  // renders the grid with no request at all.
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

  // Client-side filtering on top of the server's. It looks redundant, but with
  // the search debounced it is what narrows the grid during the 300ms before
  // the request goes out — without it the list would visibly lag your typing.
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
      return matchesBrand && matchesCategory && matchesSearch;
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

      {/*
        No header bar here — the global <Navbar /> in app/layout.tsx already
        renders one for every route, and a second brand/inbox row directly
        under it read as a duplicate navbar.
      */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 24px 80px" }}>
        
        {/* SEARCH BAR */}
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

        {/* FAVORITES TOGGLE & CATEGORIES ROW */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, overflowX: "auto", paddingBottom: 4 }}>
          {/* Favorites Filter */}
          <button
            onClick={() => triggerAppModal("Saved Favorites", "View and sync your favorite sneakers across devices using the Resole Mobile App.")}
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

          <div style={{ height: 20, width: 1, background: COLORS.border }} />

          {/* Category Filter */}
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(active ? null : category.id)}
                style={{
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
                {category.label}
              </button>
            );
          })}

          <div style={{ height: 20, width: 1, background: COLORS.border }} />

          {/* Brands Filter */}
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

        {/* FOR SALE FEED */}
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
                <ListingCard key={item.id} item={item} currentUserId={user?.id} onRequireApp={() => triggerAppModal()} />
              ))}
            </div>
          )}
        </section>

        {/* SWAP BOARD FEED */}
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
                <ListingCard key={item.id} item={item} currentUserId={user?.id} onRequireApp={() => triggerAppModal("Propose Swap", "Swapping shoes is processed securely in the Resole Mobile App.")} />
              ))}
            </div>
          )}
        </section>

        {/* HERO BANNER (Voucher Promo) */}
        <section
          onClick={() => triggerAppModal("Claim Voucher", "Claim free shipping vouchers and apply discount codes inside the Resole Mobile App.")}
          style={{
            background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            borderRadius: 24,
            padding: "32px",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            boxShadow: "0px 10px 30px rgba(37,99,235,0.25)",
          }}
        >
          <div>
            <span style={{ background: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 99, letterSpacing: "0.5px" }}>
              LIMITED OFFER
            </span>
            <h3 style={{ fontSize: 24, fontWeight: 800, margin: "12px 0 6px", lineHeight: 1.2 }}>
              Claim your Free Shipping Voucher
            </h3>
            <p style={{ fontSize: 13.5, opacity: 0.9, margin: 0 }}>
              Valid for Metro Manila deliveries
            </p>
          </div>

          <button
            style={{
              background: "#FFFFFF",
              color: COLORS.primary,
              border: "none",
              borderRadius: 9999,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Claim Now
          </button>
        </section>
      </main>

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => triggerAppModal("Sell Your Kicks", "Listing sneakers for sale or trade is exclusively supported on the Resole Mobile App.")}
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

      {/* APP DOWNLOAD POPUP MODAL */}
      <DownloadAppModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        title={modalMeta.title}
        description={modalMeta.description}
      />
    </div>
  );
}
