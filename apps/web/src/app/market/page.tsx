'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ALL_SNEAKERS, SneakerItem } from "../data/sneakers";

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
  inputBg: "#F3F4F6",
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

function CountdownBadge({ hours = 3, minutes = 12, seconds = 45 }: { hours?: number; minutes?: number; seconds?: number }) {
  const [t, setT] = useState({ h: hours, m: minutes, s: seconds });
  useEffect(() => {
    const id = setInterval(() => {
      setT((prev) => {
        let { h, m, s } = prev;
        s -= 1;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) return { h: 0, m: 0, s: 0 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", background: "rgba(0,0,0,0.55)", borderRadius: 6, padding: "2px 6px" }}>
      {pad(t.h)}:{pad(t.m)}:{pad(t.s)}
    </span>
  );
}

function FlashSaleCard({ item }: { item: SneakerItem }) {
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  return (
    <div 
      onClick={() => router.push(`/listings/${item.id}`)}
      style={{ background: COLORS.surface, borderRadius: 16, overflow: "hidden", boxShadow: CARD_SHADOW, cursor: "pointer" }}
    >
      <div style={{ position: "relative", aspectRatio: "4/3", background: "#F3F4F6" }}>
        <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", alignItems: "center", gap: 4, background: COLORS.amber, borderRadius: 9999, padding: "3px 8px" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 10, color: "#fff", fontVariationSettings: "'FILL' 1" }}>bolt</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>Flash Deal</span>
        </div>
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          <button onClick={(e) => { e.stopPropagation(); setSaved((s) => !s); }} style={{ width: 26, height: 26, borderRadius: 9999, background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13, color: saved ? COLORS.red : "#6B7280", fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
          </button>
        </div>
        <div style={{ position: "absolute", bottom: 8, left: 8 }}>
          {/* Using the last digit of the ID to generate fake time for the mock */}
          <CountdownBadge hours={2 + parseInt(item.id.slice(-1))} minutes={9 * parseInt(item.id.slice(-1))} seconds={0} />
        </div>
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ fontSize: 10.5, color: COLORS.textFaint, fontWeight: 600, textTransform: "uppercase" }}>{item.brand}</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.textMain, margin: "2px 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
        <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginBottom: 8 }}>{item.condition}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: 15.5, fontWeight: 700, color: COLORS.textMain }}>₱{item.price.toLocaleString()}</span>
            {item.was && <span style={{ fontSize: 11, color: COLORS.textFaint, textDecoration: "line-through", marginLeft: 6 }}>₱{item.was.toLocaleString()}</span>}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); router.push(`/listings/${item.id}`); }}
            style={{ background: COLORS.primary, color: "#fff", border: "none", borderRadius: 9999, padding: "6px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}

function SwapCard({ item }: { item: SneakerItem }) {
  const router = useRouter();
  const owner = item.swapOwner;

  if (!owner) return null;

  return (
    <div style={{ background: COLORS.surface, borderRadius: 16, padding: 16, boxShadow: CARD_SHADOW, minWidth: 300 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 9999, background: owner.avatarColor, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {owner.name[0]}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMain }}>{owner.name}</div>
        <div style={{ fontSize: 11, color: COLORS.textFaint, marginLeft: "auto" }}>{owner.time}</div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <img src={item.image} alt={item.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", background: "#F3F4F6" }} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.green, textTransform: "uppercase", letterSpacing: "0.03em" }}>Offering</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMain }}>{item.name}</div>
          <div style={{ fontSize: 11.5, color: COLORS.textFaint }}>Size {item.size}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 13, color: COLORS.textFaint }}>swap_horiz</span>
      </div>

      <div style={{ background: COLORS.inputBg, borderRadius: 10, padding: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.primary, textTransform: "uppercase", letterSpacing: "0.03em" }}>Looking for</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMain }}>{owner.lookingFor}</div>
        <div style={{ fontSize: 11.5, color: COLORS.textFaint }}>{owner.note}</div>
      </div>

      <button 
        onClick={() => router.push(`/swap?id=${item.id}`)}
        style={{ width: "100%", background: "#fff", border: `1.5px solid ${COLORS.primary}`, color: COLORS.primary, borderRadius: 9999, padding: "9px 0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
      >
        Propose Swap
      </button>
    </div>
  );
}

function ListingCard({ item }: { item: SneakerItem }) {
  const [saved, setSaved] = useState(false);
  const router = useRouter();

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
        <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <button onClick={(e) => { e.stopPropagation(); setSaved((s) => !s); }} style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: 9999, background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13, color: saved ? COLORS.red : "#6B7280", fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
        </button>
        <div style={{ position: "absolute", bottom: 8, left: 8, background: conditionColor, color: "#fff", fontSize: 9.5, fontWeight: 700, borderRadius: 9999, padding: "2px 8px" }}>
          {item.condition}
        </div>
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ fontSize: 10.5, color: COLORS.textFaint, fontWeight: 600, textTransform: "uppercase" }}>{item.brand}</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.textMain, margin: "2px 0 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
        <div style={{ fontSize: 15.5, fontWeight: 700, color: COLORS.textMain }}>₱{item.price.toLocaleString()}</div>
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */
export default function MarketPage() {
  const [sort, setSort] = useState("Latest Arrivals");
  const router = useRouter();

  // Split our ALL_SNEAKERS array into the 3 sections based on flags
  const flashSales = ALL_SNEAKERS.filter(item => item.isFlashSale);
  const swapBoard = ALL_SNEAKERS.filter(item => item.isSwapBoard);
  const marketplaceListings = ALL_SNEAKERS.filter(item => !item.isFlashSale && !item.isSwapBoard);

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

        {/* Flash sales */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: 0 }}>Flash Sales</h2>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ width: 28, height: 28, borderRadius: 9999, border: `1px solid ${COLORS.border}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><span className="material-symbols-outlined" style={{ fontSize: 14, color: COLORS.textMuted }}>chevron_left</span></button>
              <button style={{ width: 28, height: 28, borderRadius: 9999, border: `1px solid ${COLORS.border}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><span className="material-symbols-outlined" style={{ fontSize: 14, color: COLORS.textMuted }}>chevron_right</span></button>
            </div>
          </div>
          <p style={{ fontSize: 13, color: COLORS.textFaint, margin: "0 0 16px" }}>Ends soon — up to 40% off authenticated kicks</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {flashSales.map((item) => <FlashSaleCard key={item.id} item={item} />)}
          </div>
        </section>

        {/* Swap board */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: COLORS.primary }}>swap_horiz</span>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: 0 }}>Swap Board</h2>
          </div>
          <p style={{ fontSize: 13, color: COLORS.textFaint, margin: "0 0 16px" }}>Trade your kicks — circular commerce at its best</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {swapBoard.map((item) => <SwapCard key={item.id} item={item} />)}
          </div>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {marketplaceListings.map((item) => <ListingCard key={item.id} item={item} />)}
          </div>
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