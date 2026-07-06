'use client';

import { useState } from "react";

/* ---------------------------------------------------------
   Resole Design Tokens
--------------------------------------------------------- */
const COLORS = {
  primary: "#2563EB", 
  primaryDark: "#004AC6",
  background: "#F9FAFB",
  surface: "#FFFFFF",
  surfaceContainerLow: "#f3f4f5",
  green: "#10B981",
  greenTint: "rgba(16, 185, 129, 0.1)",
  amber: "#F59E0B",
  amberTint: "rgba(245, 158, 11, 0.1)",
  red: "#EF4444",
  textMain: "#191C1D",
  textMuted: "#6B7280",
  textFaint: "#9CA3AF",
  border: "#E5E7EB",
};

const SHADOW = {
  base: "0px 4px 20px rgba(0, 0, 0, 0.05)",
  hover: "0px 12px 28px rgba(0, 0, 0, 0.10)",
};

/* ---------------------------------------------------------
   Mock Data
--------------------------------------------------------- */
const FLASH_SALES = [
  {
    id: 1,
    name: "Nike Dunk Low 'Tiffany'",
    condition: "9/10",
    timeLeft: "00:59:50",
    price: "14,500",
    oldPrice: "18,200",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Yeezy Boost 350 'Cream'",
    condition: "BRAND NEW",
    timeLeft: "01:29:50",
    price: "12,200",
    oldPrice: "15,000",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Jordan 1 Retro High",
    condition: "8.5/10",
    timeLeft: "03:15:20",
    price: "28,000",
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "NB 2002R 'Protection Pack'",
    condition: "VNDS",
    timeLeft: "05:40:10",
    price: "9,800",
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=500&auto=format&fit=crop",
  },
];

const SWAP_BOARD = [
  {
    id: 1,
    user: "John D.",
    initials: "JD",
    timeAgo: "2 mins ago",
    offering: { name: "Jordan 4 'Midnight Navy'", size: "10 US", image: "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?q=80&w=200&auto=format&fit=crop" },
    lookingFor: { desc: "Any Yeezy 700 V3", condition: "Condition: 8.5+ only" },
  },
  {
    id: 2,
    user: "Maya S.",
    initials: "MS",
    initialsColor: COLORS.green,
    timeAgo: "15 mins ago",
    offering: { name: "AF1 'Valentine's'", size: "7W US", image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=200&auto=format&fit=crop" },
    lookingFor: { desc: "Dunk Low 'Panda'", condition: "Size 7W / Brand New" },
  },
  {
    id: 3,
    user: "Kevin C.",
    initials: "KC",
    initialsColor: COLORS.amber,
    timeAgo: "1 hour ago",
    offering: { name: "Salomon XT-6 Phantom", size: "11 US", image: "https://images.unsplash.com/photo-1605340537584-f6fb6a182bdc?q=80&w=200&auto=format&fit=crop" },
    lookingFor: { desc: "Hoka Clifton 9", condition: "Open to other trail runners" },
  },
];

const EXPLORE = [
  { id: 1, name: "Jordan 1 High 'Lost & Found'", price: "24,500", condition: "9.5/10", aiScore: "98%", image: "https://images.unsplash.com/photo-1620012253295-c15ce331c19b?q=80&w=500&auto=format&fit=crop" },
  { id: 2, name: "Yeezy 700 'Wave Runner'", price: "18,200", condition: "9/10", aiScore: "92%", image: "https://images.unsplash.com/photo-1610444585141-8f537b03b22b?q=80&w=500&auto=format&fit=crop" },
  { id: 3, name: "Dunk Low 'Panda'", price: "6,500", condition: "BRAND NEW", aiScore: "100%", image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=500&auto=format&fit=crop" },
  { id: 4, name: "Travis Scott x AJ1 Low", price: "65,000", condition: "BRAND NEW", aiScore: "100%", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=500&auto=format&fit=crop" },
];

/* ---------------------------------------------------------
   Reusable Components
--------------------------------------------------------- */
function FilterPill({ label, icon, active = false }) {
  return (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: 9999,
        border: active ? "none" : `1px solid ${COLORS.border}`,
        background: active ? COLORS.primary : COLORS.background,
        color: active ? "#fff" : COLORS.textMain,
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "Inter, sans-serif",
        cursor: "pointer",
      }}
    >
      {label}
      {icon && <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>}
    </button>
  );
}

function Badge({ children, type = "default" }) {
  const getStyles = () => {
    switch (type) {
      case "amber": return { color: COLORS.amber, bg: COLORS.amberTint };
      case "green": return { color: COLORS.green, bg: COLORS.greenTint };
      default: return { color: COLORS.textMain, bg: COLORS.border };
    }
  };
  const styles = getStyles();

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "4px 8px",
      borderRadius: 9999,
      background: styles.bg,
      color: styles.color,
      fontSize: 10,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      fontFamily: "Inter, sans-serif"
    }}>
      {children}
    </span>
  );
}

/* ---------------------------------------------------------
   Page
--------------------------------------------------------- */
export default function MarketTab() {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.background, fontFamily: "Inter, sans-serif", paddingBottom: 100 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        .hover-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-card:hover { transform: translateY(-4px); box-shadow: ${SHADOW.hover} !important; }
      `}</style>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "24px" }}>
        
        {/* Filters Row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 40, flexWrap: "wrap" }}>
          <FilterPill label="Brand" icon="expand_more" />
          <FilterPill label="Size" icon="expand_more" />
          <FilterPill label="Condition" icon="expand_more" />
          <FilterPill label="Price Range" icon="expand_more" />
          <div style={{ width: 1, background: COLORS.border, margin: "0 8px" }} />
          <FilterPill label="All Filters" icon="tune" active />
        </div>

        {/* ---------------- Flash Sales ---------------- */}
        <section style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: COLORS.textMain, margin: "0 0 4px" }}>Flash Sales</h2>
              <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0 }}>Ends soon — Up to 40% off authenticated kicks</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ width: 32, height: 32, borderRadius: 9999, border: "none", background: COLORS.border, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: COLORS.textMain }}>chevron_left</span>
              </button>
              <button style={{ width: 32, height: 32, borderRadius: 9999, border: "none", background: COLORS.border, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: COLORS.textMain }}>chevron_right</span>
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {FLASH_SALES.map((item) => (
              <div key={item.id} className="hover-card" style={{ background: COLORS.surface, borderRadius: 16, padding: 16, boxShadow: SHADOW.base, position: "relative" }}>
                
                {/* Image & Badges */}
                <div style={{ background: COLORS.surfaceContainerLow, borderRadius: 12, aspectRatio: "1/1", marginBottom: 16, position: "relative", overflow: "hidden" }}>
                  <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", top: 12, left: 12 }}>
                    <Badge type="amber"><span className="material-symbols-outlined" style={{ fontSize: 12 }}>bolt</span> Flash Deal</Badge>
                  </div>
                  <button style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 9999, background: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: COLORS.textMuted }}>favorite</span>
                  </button>
                </div>

                {/* Info */}
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                   <Badge type="green">Condition: {item.condition}</Badge>
                   <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                     <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span> {item.timeLeft}
                   </span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.textMain, margin: "0 0 12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</h3>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary }}>₱{item.price}</span>
                    {item.oldPrice && <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textFaint, textDecoration: "line-through" }}>₱{item.oldPrice}</span>}
                  </div>
                  <button style={{ background: COLORS.primary, color: "#fff", border: "none", borderRadius: 9999, padding: "8px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Buy</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- Swap Board ---------------- */}
        <section style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span className="material-symbols-outlined" style={{ color: COLORS.primary, fontSize: 28 }}>swap_horiz</span>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: COLORS.textMain, margin: "0 0 4px" }}>Swap Board</h2>
              <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0 }}>Trade your kicks — Circular commerce at its best</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {SWAP_BOARD.map((swap) => (
              <div key={swap.id} style={{ background: COLORS.surface, borderRadius: 16, padding: 20, border: `1px dashed ${COLORS.border}`, boxShadow: SHADOW.base }}>
                
                {/* User Info */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9999, background: swap.initialsColor || COLORS.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                      {swap.initials}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.textMain }}>{swap.user}</span>
                  </div>
                  <span style={{ fontSize: 12, color: COLORS.textFaint }}>{swap.timeAgo}</span>
                </div>

                {/* Offering */}
                <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                  <img src={swap.offering.image} alt={swap.offering.name} style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", background: COLORS.surfaceContainerLow }} />
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.green, textTransform: "uppercase", letterSpacing: "0.05em" }}>Offering</span>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: COLORS.textMain, margin: "4px 0" }}>{swap.offering.name}</h4>
                    <span style={{ fontSize: 13, color: COLORS.textMuted }}>Size: {swap.offering.size}</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", margin: "-8px 0", position: "relative", zIndex: 2 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9999, background: COLORS.background, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: COLORS.textFaint, transform: "rotate(90deg)" }}>swap_horiz</span>
                  </div>
                </div>

                {/* Looking For */}
                <div style={{ background: COLORS.background, borderRadius: 12, padding: 16, marginBottom: 20, marginTop: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.primary, textTransform: "uppercase", letterSpacing: "0.05em" }}>Looking For</span>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: COLORS.textMain, margin: "4px 0" }}>{swap.lookingFor.desc}</h4>
                  <span style={{ fontSize: 13, color: COLORS.textMuted }}>{swap.lookingFor.condition}</span>
                </div>

                <button style={{ width: "100%", padding: "12px 0", borderRadius: 9999, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.primary, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  Propose Swap
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- Explore Marketplace ---------------- */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: COLORS.textMain, margin: 0 }}>Explore Marketplace</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: COLORS.textMuted, cursor: "pointer" }}>
              Sort by: <span style={{ fontWeight: 600, color: COLORS.textMain }}>Latest Arrivals</span>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_more</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {EXPLORE.map((item) => (
              <div key={item.id} className="hover-card" style={{ background: COLORS.surface, borderRadius: 16, padding: 16, boxShadow: SHADOW.base, position: "relative" }}>
                
                {/* Image */}
                <div style={{ background: COLORS.surfaceContainerLow, borderRadius: 12, aspectRatio: "1/1", marginBottom: 16, position: "relative", overflow: "hidden" }}>
                  <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 9999, background: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: COLORS.textMuted }}>favorite</span>
                  </button>
                  <div style={{ position: "absolute", bottom: 12, left: 12 }}>
                    <Badge type="amber">AI {item.aiScore}</Badge>
                  </div>
                </div>

                {/* Info */}
                <div style={{ marginBottom: 8 }}>
                   <Badge type="green">{item.condition}</Badge>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.textMain, margin: "0 0 12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</h3>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.textMain }}>₱{item.price}</span>
                  <button style={{ width: 32, height: 32, borderRadius: 9999, background: COLORS.surface, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: COLORS.textMuted }}>add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <button 
        style={{ 
          position: "fixed", 
          bottom: 32, 
          right: 32, 
          background: COLORS.primary, 
          color: "#fff", 
          border: "none", 
          borderRadius: 9999, 
          padding: "16px 24px", 
          fontSize: 16, 
          fontWeight: 700, 
          fontFamily: "Inter, sans-serif",
          display: "flex", 
          alignItems: "center", 
          gap: 8, 
          cursor: "pointer", 
          boxShadow: "0px 8px 24px rgba(37, 99, 235, 0.4)",
          zIndex: 100
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_circle</span>
        Sell Your Kicks
      </button>

    </div>
  );
}