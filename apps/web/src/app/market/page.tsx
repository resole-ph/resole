'use client';

import { useState, useEffect } from "react";
import ListingCard from "@/components/ListingCard";
import DownloadAppModal from "@/components/DownloadAppModal";
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

export default function MarketPage() {
  const [saleListings, setSaleListings] = useState<SerializedShoeListing[]>([]);
  const [swapListings, setSwapListings] = useState<SerializedShoeListing[]>([]);
  const [loadingSale, setLoadingSale] = useState(true);
  const [loadingSwap, setLoadingSwap] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // App Modal State
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [modalMeta, setModalMeta] = useState<{ title?: string; description?: string }>({});

  const triggerAppModal = (title?: string, description?: string) => {
    setModalMeta({ title, description });
    setIsAppModalOpen(true);
  };

  // Fetch Listings with Filter Sync
  useEffect(() => {
    async function loadListings() {
      setLoadingSale(true);
      setLoadingSwap(true);

      const brandParam = selectedBrand !== "All" ? `&brand=${encodeURIComponent(selectedBrand)}` : "";
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";

      try {
        const [saleRes, swapRes] = await Promise.all([
          fetch(`/api/listings?section=sale-board${brandParam}${searchParam}`),
          fetch(`/api/listings?section=swap-board${brandParam}${searchParam}`),
        ]);

        const saleData = await saleRes.json();
        const swapData = await swapRes.json();

        if (saleRes.ok && saleData.shoeListings) setSaleListings(saleData.shoeListings);
        if (swapRes.ok && swapData.shoeListings) setSwapListings(swapData.shoeListings);
      } catch (e) {
        console.error("Failed to load listings:", e);
      } finally {
        setLoadingSale(false);
        setLoadingSwap(false);
      }
    }

    loadListings();
  }, [searchQuery, selectedBrand]);

  // Client-side Fallback Filtering
  const filterListings = (list: SerializedShoeListing[]) => {
    return list.filter((item) => {
      const matchesBrand = selectedBrand === "All" || item.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchesSearch = !searchQuery || 
        item.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.colorway && item.colorway.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesBrand && matchesSearch;
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

      {/* HEADER BAR */}
      <header style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, sticky: "top", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: COLORS.primary, letterSpacing: "-0.5px" }}>RESOLE</span>
            <span style={{ background: "#EFF6FF", color: COLORS.primary, fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 99 }}>MARKET</span>
          </div>

          <button
            onClick={() => triggerAppModal("Your Inbox", "Messaging buyers and sellers is available exclusively on the Resole Mobile App.")}
            style={{
              background: "#F3F4F6",
              border: "none",
              borderRadius: 9999,
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: COLORS.textMain,
              cursor: "pointer",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: COLORS.textMuted }}>mail</span>
            Inbox
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 24px 80px" }}>
        
        {/* SEARCH BAR */}
        <div style={{ marginBottom: 16, position: "relative" }}>
          <span className="material-symbols-outlined" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: COLORS.textFaint, fontSize: 20 }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search model, brand, or colorway..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "24px", gap: 20 }}>
              {filteredSaleListings.map((item) => (
                <ListingCard key={item.id} item={item} onRequireApp={() => triggerAppModal()} />
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "24px", gap: 20 }}>
              {filteredSwapListings.map((item) => (
                <ListingCard key={item.id} item={item} onRequireApp={() => triggerAppModal("Propose Swap", "Swapping shoes is processed securely in the Resole Mobile App.")} />
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