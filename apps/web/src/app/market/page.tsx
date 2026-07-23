'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SerializedShoeListing } from "@/features/shoe/utils/listing-dto";

const COLORS = {
  primary: "#2563EB",
  background: "#F9FAFB",
  surface: "#FFFFFF",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  textMain: "#191C1D",
  textMuted: "#6B7280",
  textFaint: "#9CA3AF",
  border: "#E5E7EB",
} as const;

const CARD_SHADOW = "0px 4px 20px rgba(0,0,0,0.05)";

/* ---------------- Small components ---------------- */
function FilterDropdown({ label }: { label: string }) {
  return (
    <button
      style={{
        display: "flex", alignItems: "center", gap: 6, borderRadius: 9999,
        padding: "8px 14px", background: COLORS.surface, border: `1px solid ${COLORS.border}`,
        fontSize: 13, fontWeight: 500, color: COLORS.textMain, cursor: "pointer",
      }}
    >
      {label} <span className="material-symbols-outlined" style={{ fontSize: 13, color: COLORS.textFaint }}>expand_more</span>
    </button>
  );
}

function ListingCard({ item }: { item: SerializedShoeListing }) {
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const title = item.colorway ? `${item.model} '${item.colorway}'` : item.model;
  const isSwap = item.listingMode === "Swap";

  // Pick a color for condition dynamically (or green as default)
  const conditionColor = item.condition.includes("New") || item.condition.includes("Excellent") ? COLORS.green : COLORS.amber;

  return (
    <div
      onClick={() => router.push(`/listings/${item.id}`)}
      style={{ background: COLORS.surface, borderRadius: 16, overflow: "hidden", boxShadow: CARD_SHADOW, cursor: "pointer", transition: "transform 0.18s ease, box-shadow 0.18s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0px 12px 28px rgba(0,0,0,0.10)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = CARD_SHADOW; }}
    >
      <div style={{ position: "relative", aspectRatio: "1/1", background: "#F3F4F6" }}>
        <img src={item.imageUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <button onClick={(e) => { e.stopPropagation(); setSaved((s) => !s); }} style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: 9999, background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13, color: saved ? COLORS.red : "#6B7280", fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
        </button>
        <div style={{ position: "absolute", bottom: 8, left: 8, background: conditionColor, color: "#fff", fontSize: 9.5, fontWeight: 700, borderRadius: 9999, padding: "2px 8px" }}>
          {item.condition}
        </div>
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ fontSize: 10.5, color: COLORS.textFaint, fontWeight: 600, textTransform: "uppercase" }}>{item.brand}</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.textMain, margin: "2px 0 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        {isSwap ? (
          <>
            <div style={{ fontSize: 11, color: COLORS.textFaint, marginBottom: 2 }}>Looking to swap for</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textMain, marginBottom: 10 }}>Open to offers</div>
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/swap?id=${item.id}`); }}
              style={{ width: "100%", background: "#fff", border: `1.5px solid ${COLORS.primary}`, color: COLORS.primary, borderRadius: 9999, padding: "8px 0", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
            >
              Propose Swap
            </button>
          </>
        ) : (
          <div style={{ fontSize: 15.5, fontWeight: 700, color: COLORS.textMain }}>₱{item.price.toLocaleString()}</div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */
export default function MarketPage() {
  const [sort, setSort] = useState("Latest Arrivals");
  const router = useRouter();

  const [marketplaceListings, setMarketplaceListings] = useState<SerializedShoeListing[]>([]);
  const [swapListings, setSwapListings] = useState<SerializedShoeListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [swapLoading, setSwapLoading] = useState(true);

  useEffect(() => {
    async function loadMarketplaceListings() {
      setLoading(true);
      try {
        const res = await fetch('/api/listings?section=sale-board');
        const data = await res.json();
        if (res.ok && data.shoeListings) {
          setMarketplaceListings(data.shoeListings);
        }
      } catch (e) {
        console.error('Failed to load marketplace listings:', e);
      } finally {
        setLoading(false);
      }
    }

    async function loadSwapListings() {
      setSwapLoading(true);
      try {
        const res = await fetch('/api/listings?section=swap-board');
        const data = await res.json();
        if (res.ok && data.shoeListings) {
          setSwapListings(data.shoeListings);
        }
      } catch (e) {
        console.error('Failed to load swap listings:', e);
      } finally {
        setSwapLoading(false);
      }
    }

    loadMarketplaceListings();
    loadSwapListings();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.background, fontFamily: "Inter, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined'); * { box-sizing: border-box; }`}</style>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 24px 64px" }}>
        {/* Filter bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
          <FilterDropdown label="Brand" />
          <FilterDropdown label="Size" />
          <FilterDropdown label="Condition" />
          <FilterDropdown label="Price Range" />
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: COLORS.primary, color: "#fff", border: "none", borderRadius: 9999, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>tune</span> All Filters
          </button>
        </div>

        {/* Swap board */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: COLORS.primary }}>swap_horiz</span>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: 0 }}>Swap Board</h2>
          </div>
          <p style={{ fontSize: 13, color: COLORS.textFaint, margin: "0 0 16px" }}>Trade your kicks — circular commerce at its best</p>
          {swapLoading ? (
            <p style={{ fontSize: 13.5, color: COLORS.textMuted }}>Fetching swap listings...</p>
          ) : swapListings.length === 0 ? (
            <p style={{ fontSize: 13.5, color: COLORS.textMuted }}>No swap listings found.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {swapListings.map((item) => <ListingCard key={item.id} item={item} />)}
            </div>
          )}
        </section>

        {/* Explore marketplace */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: 0 }}>Explore Marketplace</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: COLORS.textMuted }}>
              Sort by: 
              <select 
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{ border: "none", background: "transparent", fontWeight: 700, color: COLORS.textMain, outline: "none", cursor: "pointer" }}
              >
                <option>Latest Arrivals</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>
          {loading ? (
            <p style={{ fontSize: 13.5, color: COLORS.textMuted }}>Fetching marketplace listings...</p>
          ) : marketplaceListings.length === 0 ? (
            <p style={{ fontSize: 13.5, color: COLORS.textMuted }}>No listings found.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
              {marketplaceListings.map((item) => <ListingCard key={item.id} item={item} />)}
            </div>
          )}
        </section>
      </main>

      {/* Floating sell button */}
      <button 
        onClick={() => router.push('/sell')}
        style={{ position: "fixed", bottom: 28, right: 28, display: "flex", alignItems: "center", gap: 8, background: COLORS.primary, color: "#fff", border: "none", borderRadius: 9999, padding: "14px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0px 8px 20px rgba(37,99,235,0.35)" }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> Sell Your Kicks
      </button>
    </div>
  );
}