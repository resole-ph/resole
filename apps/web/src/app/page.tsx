'use client';

import { useState } from "react";
import { useAuthGate } from "@/providers/AuthGateProvider";

/* ---------------------------------------------------------
   Resole design tokens (from resole-web-design-details.txt)
--------------------------------------------------------- */
const COLORS = {
  primary: "#2563EB",
  primaryDark: "#004AC6",
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
};

const CARD_SHADOW = "0px 4px 20px rgba(0,0,0,0.05)";

/* ---------------------------------------------------------
   Mock data
--------------------------------------------------------- */
const CATEGORIES = [
  { label: "Running", icon: "directions_run", iconColor: "#F59E0B" },
  { label: "Basketball", icon: "sports_basketball", iconColor: "#EF4444" },
  { label: "Lifestyle", icon: "wb_sunny", iconColor: "#8B5CF6" },
  { label: "Skate", icon: "trending_up", iconColor: "#10B981" },
  { label: "Training", icon: "fitness_center", iconColor: "#3B82F6" },
  { label: "Casual", icon: "checkroom", iconColor: "#EC4899" },
  { label: "Other", icon: "more_horiz", iconColor: "#EC4899" },
];

const BRANDS = ["Nike", "Adidas", "Jordan Brand", "New Balance", "Asics", "Salomon", "Puma"];

const CHARITIES = [
  { id: "gawad-kalinga", name: "Gawad Kalinga", cause: "Community building", image: "/charity-gawad-kalinga.jpg" },
  { id: "red-cross", name: "Philippine Red Cross", cause: "Disaster relief", image: "/charity-red-cross.png" },
  { id: "wwf", name: "WWF Philippines", cause: "Environment & wildlife", image: "/charity-wwf.jpg" },
  { id: "unicef", name: "UNICEF Philippines", cause: "Children's welfare", image: "/charity-unicef.png" },
  { id: "caritas", name: "Caritas Philippines", cause: "Poverty alleviation", image: "/charity-caritas.png" },
  { id: "save-children", name: "Save the Children", cause: "Child education", image: "/charity-save-children.png" },
];

const LISTINGS = [
  {
    id: 1,
    brand: "New Balance",
    name: "990v5 Core Grey",
    condition: "VNDS Condition",
    price: "9,200",
    tag: null,
    seller: "M",
    image:
      "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 2,
    brand: "Jordan Brand",
    name: "Air Jordan 1 Panda",
    condition: "Excellent",
    price: "12,500",
    tag: "SALE",
    seller: "A",
    image:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    brand: "Adidas",
    name: "Ultraboost 1.0 DNA",
    condition: "Brand New",
    price: "8,400",
    tag: null,
    seller: "S",
    image:
      "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 4,
    brand: "Nike SB",
    name: "Dunk Low 'What The'",
    condition: "Gently Used",
    price: "15,800",
    tag: "SALE",
    seller: "R",
    image:
      "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=80&w=600&auto=format&fit=crop",
  },
];

/* ---------------------------------------------------------
   Small building blocks
--------------------------------------------------------- */
function Pill({ children, icon, iconColor, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 9999,
        padding: "8px 18px",
        fontSize: 13.5,
        fontWeight: 600,
        fontFamily: "Inter, sans-serif",
        border: active ? "none" : `1px solid ${COLORS.border}`,
        background: active ? COLORS.primary : COLORS.surface,
        color: active ? "#fff" : COLORS.textMain,
        whiteSpace: "nowrap",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {icon && (
        <span className="material-symbols-outlined" style={{ fontSize: 15, color: active ? "#fff" : iconColor }}>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}

// Custom hook to fix Next.js hydration issues with local client sizing
function Badge({ children, color }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 9999,
        padding: "3px 9px",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "Inter, sans-serif",
        color,
        background: `${color}1A`,
      }}
    >
      {children}
    </span>
  );
}

function ListingCard({ listing }) {
  const [saved, setSaved] = useState(false);

  const { requireAuth } = useAuthGate();
  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: CARD_SHADOW,
        cursor: "pointer",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0px 12px 28px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = CARD_SHADOW;
      }}
    >
      <div style={{ position: "relative", aspectRatio: "1/1", background: "#F3F4F6" }}>
        <img
          src={listing.image}
          alt={`${listing.brand} ${listing.name}`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {listing.tag && (
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <Badge color={COLORS.green}>{listing.tag}</Badge>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSaved((s) => !s);
            requireAuth(() => setSaved((s) => !s), 'Log in to save listings to your favourites.');
          }}
          aria-label="Save listing"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 30,
            height: 30,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.9)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <span 
            className="material-symbols-outlined" 
            style={{ 
              fontSize: 18, 
              color: saved ? COLORS.red : "#6B7280",
              fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" 
            }}
          >
            favorite
          </span>
        </button>
      </div>

      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: COLORS.textFaint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {listing.brand}
        </div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, fontWeight: 700, color: COLORS.textMain, margin: "2px 0 4px" }}>
          {listing.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: 9999, background: COLORS.green }} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.textMuted }}>{listing.condition}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.textMain }}>
            ₱{listing.price}
          </span>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 9999,
              background: COLORS.primary,
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {listing.seller}
          </div>
        </div>
      </div>
    </div>
  );
}

function CharityCard({ charity, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 160,
        textAlign: "left",
        flexShrink: 0,
        background: selected ? "#EFF6FF" : COLORS.surface,
        borderRadius: 16,
        padding: 12,
        border: selected ? `1.5px solid ${COLORS.primary}` : `1.5px solid ${COLORS.border}`,
        boxShadow: CARD_SHADOW,
        cursor: "pointer",
        position: "relative",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <img
        src={charity.image}
        alt={charity.name}
        style={{ width: "100%", height: 90, objectFit: "contain", borderRadius: 12, marginBottom: 10, background: "#F9FAFB" }}
      />
      <div style={{ fontSize: 13.5, fontWeight: 700, color: selected ? "#1D4ED8" : COLORS.textMain, marginBottom: 2 }}>
        {charity.name}
      </div>
      <div style={{ fontSize: 11.5, color: COLORS.textFaint }}>{charity.cause}</div>

      {selected && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 20,
            height: 20,
            borderRadius: 9999,
            background: COLORS.primary,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check</span>
        </div>
      )}
    </button>
  );
}

function CharitiesSection({ selectedCharity, onSelect }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: 0 }}>Support a Cause</h3>
        <p style={{ fontSize: 13, color: COLORS.textFaint, margin: "2px 0 0" }}>
          Pick a charity — donation proceeds go straight to them.
        </p>
      </div>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
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
   Page
--------------------------------------------------------- */
export default function ResoleHome({ userName = "Miguel" }) {
  const [activeCategory, setActiveCategory] = useState("Lifestyle");
  const [activeBrand, setActiveBrand] = useState(null);
  const [selectedCharity, setSelectedCharity] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.background, fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* ---------------- Main ---------------- */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 64px" }}>
        {/* Greeting */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: COLORS.textMain, margin: 0 }}>
            Good morning, {userName}
          </h1>
          <p style={{ fontSize: 14.5, color: COLORS.textFaint, margin: "4px 0 0" }}>Find your next pair today</p>
        </div>

        {/* Hero banner (Sized Up 🚀) */}
        <div
          style={{
            position: "relative",
            borderRadius: 28,
            overflow: "hidden",
            background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 60%, #3b7cf0 100%)`,
            padding: "60px 60px",
            marginBottom: 32,
            minHeight: 360,
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Sized up text container layout */}
          <div style={{ position: "relative", zIndex: 2, maxWidth: 460 }}>
            <h2 style={{ color: "#fff", fontSize: 42, fontWeight: 800, lineHeight: 1.1, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
              Know what your kicks are worth.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.88)", fontSize: 16, lineHeight: 1.6, margin: "0 0 28px" }}>
              Get instant AI-driven valuation for any sneaker in our database with 98% accuracy.
            </p>
            <button
              style={{
                background: "#fff",
                color: COLORS.primary,
                border: "none",
                borderRadius: 9999,
                padding: "14px 28px",
                fontSize: 15,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                boxShadow: "0px 4px 14px rgba(0,0,0,0.1)",
                transition: "transform 0.2s ease",
              }}
            >
              Try Valuation <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
            </button>
          </div>

          {/* Sized up sneaker to match container background bounds */}
          <img
            src="https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=80&w=900&auto=format&fit=crop"
            alt="Featured sneaker"
            style={{
              position: "absolute",
              right: -10,
              bottom: -40,
              width: 560,
              height: 560,
              objectFit: "contain",
              transform: "rotate(-10deg)",
              filter: "drop-shadow(0 25px 35px rgba(0,0,0,0.4))",
            }}
          />
        </div>

        {/* Categories */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: 0 }}>Categories</h3>
          <button style={{ background: "none", border: "none", color: COLORS.primary, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
            See all
          </button>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
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
        <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: "0 0 16px" }}>Brands</h3>
        <div style={{ display: "flex", gap: 10, marginBottom: 36, flexWrap: "wrap" }}>
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p style={{ fontSize: 13.5, color: COLORS.textFaint, margin: 0 }}>
            <span style={{ color: COLORS.textMain, fontWeight: 700 }}>{LISTINGS.length}</span> products found
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 9999,
                padding: "8px 14px",
                background: COLORS.surface,
                border: "none",
                boxShadow: CARD_SHADOW,
                color: COLORS.primary,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>tune</span> Filter
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 9999,
                padding: "8px 14px",
                background: COLORS.surface,
                border: "none",
                boxShadow: CARD_SHADOW,
                color: COLORS.textMuted,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sort
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
          }}
        >
          {LISTINGS.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </main>
    </div>
  );
}