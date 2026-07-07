'use client';

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ALL_SNEAKERS } from "../data/sneakers";

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

// Subcomponent that renders a single shoe box in the VS view
function ShoeSquare({
  label,
  labelColor,
  name,
  brand,
  size,
  condition,
  estValue,
  image,
  footer,
}: {
  label: string;
  labelColor: string;
  name: string;
  brand: string;
  size: string;
  condition: string;
  estValue: number;
  image: string;
  footer?: React.ReactNode;
}) {
  return (
    <div style={{ background: COLORS.surface, borderRadius: 20, padding: 16, boxShadow: CARD_SHADOW, flex: 1 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: labelColor, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ position: "relative", aspectRatio: "1/1", borderRadius: 14, overflow: "hidden", background: "#F3F4F6", marginBottom: 12 }}>
        <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ fontSize: 11.5, color: COLORS.textFaint, fontWeight: 600, textTransform: "uppercase" }}>{brand}</div>
      <div style={{ fontSize: 15.5, fontWeight: 700, color: COLORS.textMain, margin: "2px 0 8px" }}>{name}</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11.5, color: COLORS.textMuted, background: COLORS.inputBg, borderRadius: 9999, padding: "3px 10px" }}>{size}</span>
        <span style={{ fontSize: 11.5, color: COLORS.textMuted, background: COLORS.inputBg, borderRadius: 9999, padding: "3px 10px" }}>{condition}</span>
      </div>
      <div style={{ fontSize: 13, color: COLORS.textFaint }}>
        Est. value <span style={{ color: COLORS.textMain, fontWeight: 700 }}>₱{estValue.toLocaleString()}</span>
      </div>
      {footer && <div style={{ marginTop: 12 }}>{footer}</div>}
    </div>
  );
}

function SwapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 1. Get Target Item from URL
  const targetId = searchParams.get("id");
  const targetItem = ALL_SNEAKERS.find(s => s.id === targetId) || ALL_SNEAKERS[0];
  
  // 2. Generate the user's inventory (mocking by taking 3 other sneakers)
  const myVault = useMemo(() => ALL_SNEAKERS.filter(item => item.id !== targetItem.id).slice(0, 3), [targetItem.id]);

  // Handle owner fallbacks if the item wasn't originally from the swap board
  const ownerName = targetItem.swapOwner?.name || "@sneakerhead_ph";
  const ownerAvatarColor = targetItem.swapOwner?.avatarColor || COLORS.primary;

  const [selectedId, setSelectedId] = useState(myVault[0]?.id ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [extraCash, setExtraCash] = useState<string>("");
  const [note, setNote] = useState("");

  const selected = useMemo(() => myVault.find((l) => l.id === selectedId) ?? myVault[0], [selectedId, myVault]);

  const cashValue = Number(extraCash) || 0;
  // Fixed: using .price instead of .estValue
  const valueDiff = (targetItem.price ?? 0) - (selected?.price ?? 0) - cashValue;

  const handleSend = () => {
    alert("Swap offer securely submitted to escrow! The seller will be notified.");
    router.push('/market');
  };

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ width: 26, height: 26, borderRadius: 9999, background: ownerAvatarColor, color: "#fff", fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {ownerName[0]}
        </div>
        <span style={{ fontSize: 13.5, color: COLORS.textMuted }}>Proposing a swap with <strong style={{ color: COLORS.textMain }}>{ownerName}</strong></span>
      </div>

      {/* Two squares: Your Offer VS Their Shoe */}
      <div style={{ display: "flex", gap: 20, alignItems: "stretch", marginTop: 20, marginBottom: 24, position: "relative" }}>
        <ShoeSquare
          label="Your Offer"
          labelColor={COLORS.green}
          name={selected?.name ?? ""}
          brand={selected?.brand ?? ""}
          size={selected?.size ?? ""}
          condition={selected?.condition ?? ""}
          estValue={selected?.price ?? 0} // Fixed: using .price
          image={selected?.image ?? ""}
          footer={
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setPickerOpen((o) => !o)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: COLORS.inputBg, border: "none", borderRadius: 10, padding: "10px 12px",
                  fontSize: 13, fontWeight: 600, color: COLORS.textMain, cursor: "pointer",
                }}
              >
                Change shoe 
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.textFaint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {pickerOpen && (
                <div style={{ position: "absolute", top: "110%", left: 0, right: 0, background: "#fff", borderRadius: 12, boxShadow: "0px 10px 30px rgba(0,0,0,0.12)", zIndex: 10, overflow: "hidden" }}>
                  {myVault.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => { setSelectedId(l.id); setPickerOpen(false); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                        background: l.id === selectedId ? `${COLORS.primary}0D` : "transparent", border: "none",
                        borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer", textAlign: "left",
                      }}
                    >
                      <img src={l.image} alt={l.name} style={{ width: 34, height: 34, borderRadius: 8, objectFit: "cover" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textMain }}>{l.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.textFaint }}>{l.size} · ₱{(l.price ?? 0).toLocaleString()}</div> {/* Fixed: using .price */}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          }
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 9999, background: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(37,99,235,0.2)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 8 16 13"></polyline>
              <line x1="21" y1="8" x2="9" y2="8"></line>
              <polyline points="8 21 3 16 8 11"></polyline>
              <line x1="3" y1="16" x2="15" y2="16"></line>
            </svg>
          </div>
        </div>

        <ShoeSquare
          label="Their Shoe"
          labelColor={COLORS.primary}
          name={targetItem.name}
          brand={targetItem.brand}
          size={targetItem.size}
          condition={targetItem.condition}
          estValue={targetItem.price ?? 0} // Fixed: using .price
          image={targetItem.image}
        />
      </div>

      {/* Value comparison & Cash Injection */}
      <div style={{ background: COLORS.surface, borderRadius: 16, padding: 16, boxShadow: CARD_SHADOW, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 8 }}>
          <span style={{ color: COLORS.textMuted }}>Your offer value</span>
          <span style={{ color: COLORS.textMain, fontWeight: 600 }}>₱{(selected?.price ?? 0).toLocaleString()}</span> {/* Fixed: using .price */}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 8 }}>
          <span style={{ color: COLORS.textMuted }}>Their shoe value</span>
          <span style={{ color: COLORS.textMain, fontWeight: 600 }}>₱{(targetItem.price ?? 0).toLocaleString()}</span> {/* Fixed: using .price */}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, marginBottom: 6 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2"></rect>
            <circle cx="12" cy="12" r="2"></circle>
            <path d="M6 12h.01M18 12h.01"></path>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMain }}>Add extra cash (optional)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: COLORS.inputBg, borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: COLORS.textFaint }}>₱</span>
          <input
            type="number"
            min={0}
            value={extraCash}
            onChange={(e) => setExtraCash(e.target.value)}
            placeholder="0"
            style={{ border: "none", background: "transparent", outline: "none", fontSize: 14, color: COLORS.textMain, width: "100%" }}
          />
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.textMain }}>
            {valueDiff === 0 ? "Even swap" : valueDiff > 0 ? "You'd be under by" : "You'd be over by"}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: valueDiff === 0 ? COLORS.green : COLORS.textMain }}>
            {valueDiff === 0 ? "₱0" : `₱${Math.abs(valueDiff).toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Note */}
      <div style={{ background: COLORS.surface, borderRadius: 16, padding: 16, boxShadow: CARD_SHADOW, marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMain, marginBottom: 8 }}>Add a note (optional)</div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Happy to ship first, just let me know your address..."
          rows={3}
          style={{ width: "100%", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 12, fontSize: 13, color: COLORS.textMain, outline: "none", resize: "vertical", fontFamily: "Inter, sans-serif" }}
        />
      </div>

      <button
        onClick={handleSend}
        style={{
          width: "100%", background: COLORS.primary, color: "#fff", border: "none", borderRadius: 9999,
          padding: "15px 0", fontSize: 15, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
        Send Swap Proposal
      </button>
    </main>
  );
}

export default function ProposeSwapPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: COLORS.background, fontFamily: "Inter, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => router.back()} style={{ width: 34, height: 34, borderRadius: 9999, border: `1px solid ${COLORS.border}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <span style={{ fontWeight: 700, fontSize: 16, color: COLORS.textMain }}>Propose Swap</span>
          <span onClick={() => router.push('/')} style={{ fontWeight: 800, fontSize: 18, color: COLORS.primary, marginLeft: "auto", cursor: "pointer" }}>Resole</span>
        </div>
      </header>

      {/* Suspense Wrapper for NextJS URL parameter fetching */}
      <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted }}>Loading trade parameters...</div>}>
        <SwapContent />
      </Suspense>
    </div>
  );
}