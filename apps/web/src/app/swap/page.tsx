'use client';

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useAuthGate } from '@/providers/AuthGateProvider';

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

const fetcher = (url: string) => fetch(url).then(res => res.json());

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ fontSize: 11.5, color: COLORS.textFaint, fontWeight: 600, textTransform: "uppercase" }}>{brand}</div>
      <div style={{ fontSize: 15.5, fontWeight: 700, color: COLORS.textMain, margin: "2px 0 8px" }} className="truncate">{name}</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11.5, color: COLORS.textMuted, background: COLORS.inputBg, borderRadius: 9999, padding: "3px 10px" }}>Size {size}</span>
        <span style={{ fontSize: 11.5, color: COLORS.textMuted, background: COLORS.inputBg, borderRadius: 9999, padding: "3px 10px" }}>{condition}</span>
      </div>
      <div style={{ fontSize: 13, color: COLORS.textFaint }}>
        Est. value <span style={{ color: COLORS.textMain, fontWeight: 700 }}>₱{Number(estValue).toLocaleString()}</span>
      </div>
      {footer && <div style={{ marginTop: 12 }}>{footer}</div>}
    </div>
  );
}

function SwapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { requireAuth } = useAuthGate();
  
  // 1. Get Target Item from URL
  const targetId = searchParams.get("id");
  
  const { data: targetData, error: targetError } = useSWR(targetId ? `/api/listings/${targetId}` : null, fetcher);
  const targetItem = targetData?.shoeListing;
  
  // 2. Generate the user's inventory
  const { data: vaultData, error: vaultError } = useSWR('/api/users/me/listings', fetcher);
  const myVault = vaultData?.shoeListings?.filter((item: any) => String(item.id) !== String(targetId)) || [];

  const [selectedId, setSelectedId] = useState<string>("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [extraCash, setExtraCash] = useState<string>("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default selected listing once vault loads
  if (myVault.length > 0 && !selectedId) {
    setSelectedId(myVault[0].id);
  }

  const selected = useMemo(() => myVault.find((l: any) => String(l.id) === String(selectedId)) ?? myVault[0], [selectedId, myVault]);

  const cashValue = Number(extraCash) || 0;
  const valueDiff = targetItem && selected ? (Number(targetItem.price) ?? 0) - (Number(selected.price) ?? 0) - cashValue : 0;

  const handleSend = async () => {
    requireAuth(async () => {
      if (!selectedId || !targetId) return;
      
      setIsSubmitting(true);
      try {
        const swapRes = await fetch(`/api/listings/${targetId}/swap-offers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'swap', listings: [Number(selectedId)] })
        });
        const swapData = await swapRes.json();
        
        if (!swapRes.ok) throw new Error(swapData.error || 'Failed to submit swap offer');
        
        const transactionId = swapData.transactionDetails.id;
        const listerId = swapData.transactionDetails.listing.userId;
        
        let finalNote = note.trim();
        const cashVal = Number(extraCash);
        
        // Proper formatting for the swap note including the cash top-up
        if (cashVal > 0) {
          finalNote = `[Swap Offer Details]\nOffered to add ₱${cashVal.toLocaleString()} cash.\n\n${finalNote}`;
        } else if (!finalNote) {
          finalNote = `Hello! I would like to offer a swap for your ${targetItem.model}.`;
        }
        
        const msgRes = await fetch(`/api/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listerId: listerId,
            transactionId: transactionId,
            content: finalNote
          })
        });
        
        if (!msgRes.ok) throw new Error('Failed to send offer message');
        
        alert("Swap offer securely submitted to escrow! The seller will be notified.");
        router.push('/inbox');
      } catch (err: any) {
        console.error(err);
        alert(err.message || 'Something went wrong while submitting the swap.');
      } finally {
        setIsSubmitting(false);
      }
    }, 'Log in to propose a swap.');
  };

  if (!targetData || !vaultData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant text-[14px] mt-4 font-medium">Loading swap details...</p>
      </div>
    );
  }

  if (targetError || !targetItem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
        <span className="material-symbols-outlined text-error text-[48px] mb-3">error</span>
        <p className="text-error font-semibold text-[16px]">Listing not found or unavailable.</p>
        <button onClick={() => router.push('/market')} className="mt-4 px-5 py-2.5 bg-primary text-white rounded-full text-[14px] font-semibold">
          Back to Market
        </button>
      </div>
    );
  }

  const ownerName = targetItem.seller?.name || "sneakerhead";

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ width: 26, height: 26, borderRadius: 9999, background: COLORS.primary, color: "#fff", fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {ownerName.charAt(0).toUpperCase()}
        </div>
        <span style={{ fontSize: 13.5, color: COLORS.textMuted }}>Proposing a swap with <strong style={{ color: COLORS.textMain }}>@{ownerName}</strong></span>
      </div>

      {/* Two squares: Your Offer VS Their Shoe */}
      <div style={{ display: "flex", gap: 20, alignItems: "stretch", marginTop: 20, marginBottom: 24, position: "relative" }} className="flex-col md:flex-row">
        {myVault.length > 0 && selected ? (
          <ShoeSquare
            label="Your Offer"
            labelColor={COLORS.green}
            name={selected.model}
            brand={selected.brand}
            size={String(selected.size)}
            condition={selected.condition}
            estValue={Number(selected.price)}
            image={selected.imageUrl || selected.imageUrlTop}
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
                  <div style={{ position: "absolute", top: "110%", left: 0, right: 0, background: "#fff", borderRadius: 12, boxShadow: "0px 10px 30px rgba(0,0,0,0.12)", zIndex: 10, overflow: "hidden", maxHeight: 200, overflowY: "auto" }}>
                    {myVault.map((l: any) => (
                      <button
                        key={l.id}
                        onClick={() => { setSelectedId(l.id); setPickerOpen(false); }}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                          background: l.id === selectedId ? `${COLORS.primary}0D` : "transparent", border: "none",
                          borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer", textAlign: "left",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={l.imageUrl || l.imageUrlTop} alt={l.model} style={{ width: 34, height: 34, borderRadius: 8, objectFit: "cover" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textMain }} className="truncate">{l.model}</div>
                          <div style={{ fontSize: 11, color: COLORS.textFaint }}>US {l.size} · ₱{Number(l.price).toLocaleString()}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            }
          />
        ) : (
          <div style={{ background: COLORS.surface, borderRadius: 20, padding: 16, boxShadow: CARD_SHADOW, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <span className="material-symbols-outlined text-gray-300 mb-3" style={{ fontSize: 40 }}>inventory_2</span>
            <h3 className="font-bold text-gray-900 mb-2">No Listings Available</h3>
            <p className="text-sm text-gray-500 mb-4 px-4">You need at least one active listing in your vault to propose a swap.</p>
            <button onClick={() => router.push('/sell')} className="px-5 py-2 bg-primary text-white rounded-full text-sm font-bold">List a Sneaker</button>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, flexShrink: 0 }} className="hidden md:flex">
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
          name={targetItem.model}
          brand={targetItem.brand}
          size={String(targetItem.size)}
          condition={targetItem.condition}
          estValue={Number(targetItem.price)}
          image={targetItem.imageUrl || targetItem.imageUrlTop}
        />
      </div>

      {myVault.length > 0 && selected && (
        <>
          {/* Value comparison & Cash Injection */}
          <div style={{ background: COLORS.surface, borderRadius: 16, padding: 16, boxShadow: CARD_SHADOW, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 8 }}>
              <span style={{ color: COLORS.textMuted }}>Your offer value</span>
              <span style={{ color: COLORS.textMain, fontWeight: 600 }}>₱{Number(selected.price).toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 8 }}>
              <span style={{ color: COLORS.textMuted }}>Their shoe value</span>
              <span style={{ color: COLORS.textMain, fontWeight: 600 }}>₱{Number(targetItem.price).toLocaleString()}</span>
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
                onChange={(e) => setExtraCash(e.target.value.replace(/[^0-9]/g, ''))}
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
              style={{ width: "100%", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 12, fontSize: 13, color: COLORS.textMain, outline: "none", resize: "none", fontFamily: "Inter, sans-serif" }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={isSubmitting}
            style={{
              width: "100%", background: isSubmitting ? COLORS.textFaint : COLORS.primary, color: "#fff", border: "none", borderRadius: 9999,
              padding: "15px 0", fontSize: 15, fontWeight: 700, cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: isSubmitting ? "none" : "0px 6px 16px rgba(37,99,235,0.25)"
            }}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                Send Swap Proposal
              </>
            )}
          </button>
        </>
      )}
    </main>
  );
}

export default function SwapPage() {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.background, fontFamily: "Inter, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; }`}</style>
      <Suspense fallback={<div className="p-10 text-center text-gray-500 font-medium">Loading swap engine...</div>}>
        <SwapContent />
      </Suspense>
    </div>
  );
}