'use client';

import { useState, Suspense } from "react";
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

type PaymentMethodId = "gcash" | "card" | "bank";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Fetch exact item from URL parameters
  const productId = searchParams.get("id");
  const product = ALL_SNEAKERS.find((item) => item.id === productId) || ALL_SNEAKERS[0];

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("gcash");
  const [promoCode, setPromoCode] = useState("");

  // 2. Pricing Breakdowns (Standardized to PHP ₱)
  const subtotal = product.price;
  const shippingFee = 250;
  const verificationFee = 150;
  const total = subtotal + shippingFee + verificationFee;

  const handlePay = () => {
    alert("Payment authorized successfully! Your funds are now secured in Resole Escrow.");
    router.push("/market");
  };

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 64px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 32 }}>
      
      {/* Left Column: Checkout Details */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Delivery Address Section */}
        <section style={{ background: COLORS.surface, borderRadius: 16, padding: 20, boxShadow: CARD_SHADOW }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: COLORS.textMain, margin: "0 0 14px" }}>Delivery Address</h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textMain }}>Juan Dela Cruz</div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4, lineHeight: 1.5 }}>
                321 Rizal Avenue, Barangay 12<br />
                Calamba,开放 District, 4027 Laguna<br />
                Philippines
              </div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>+63 917 123 4567</div>
            </div>
            <button style={{ background: "none", border: "none", color: COLORS.primary, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Edit
            </button>
          </div>
        </section>

        {/* Payment Method Section */}
        <section style={{ background: COLORS.surface, borderRadius: 16, padding: 20, boxShadow: CARD_SHADOW }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: COLORS.textMain, margin: "0 0 14px" }}>Payment Method</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            
            {/* GCash option */}
            <label
              onClick={() => setPaymentMethod("gcash")}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 12,
                border: `1.5px solid ${paymentMethod === "gcash" ? COLORS.primary : COLORS.border}`,
                background: paymentMethod === "gcash" ? `${COLORS.primary}05` : "transparent", cursor: "pointer",
              }}
            >
              <input type="radio" checked={paymentMethod === "gcash"} readOnly style={{ accentColor: COLORS.primary }} />
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${COLORS.primary}1A`, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.primary }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4z"></path>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.textMain }}>GCash / e-Wallet</div>
                <div style={{ fontSize: 11.5, color: COLORS.textFaint }}>Instant deployment via secure portal</div>
              </div>
            </label>

            {/* Card option */}
            <label
              onClick={() => setPaymentMethod("card")}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 12,
                border: `1.5px solid ${paymentMethod === "card" ? COLORS.primary : COLORS.border}`,
                background: paymentMethod === "card" ? `${COLORS.primary}05` : "transparent", cursor: "pointer",
              }}
            >
              <input type="radio" checked={paymentMethod === "card"} readOnly style={{ accentColor: COLORS.primary }} />
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${COLORS.amber}1A`, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.amber }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.textMain }}>Credit / Debit Card</div>
                <div style={{ fontSize: 11.5, color: COLORS.textFaint }}>Visa, Mastercard, or JCB</div>
              </div>
            </label>

            {/* Bank Transfer option */}
            <label
              onClick={() => setPaymentMethod("bank")}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 12,
                border: `1.5px solid ${paymentMethod === "bank" ? COLORS.primary : COLORS.border}`,
                background: paymentMethod === "bank" ? `${COLORS.primary}05` : "transparent", cursor: "pointer",
              }}
            >
              <input type="radio" checked={paymentMethod === "bank"} readOnly style={{ accentColor: COLORS.primary }} />
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${COLORS.green}1A`, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.green }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="22" x2="21" y2="22"></line>
                  <line x1="6" y1="18" x2="6" y2="11"></line>
                  <line x1="10" y1="18" x2="10" y2="11"></line>
                  <line x1="14" y1="18" x2="14" y2="11"></line>
                  <line x1="18" y1="18" x2="18" y2="11"></line>
                  <polygon points="12 2 2 7 22 7 12 2"></polygon>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.textMain }}>Direct Bank Transfer</div>
                <div style={{ fontSize: 11.5, color: COLORS.textFaint }}>BPI, BDO, or UnionBank online bills payment</div>
              </div>
            </label>

          </div>
        </section>
      </div>

      {/* Right Column: Order Summary Side Box */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <section style={{ background: COLORS.surface, borderRadius: 16, padding: 20, boxShadow: CARD_SHADOW }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: COLORS.textMain, margin: "0 0 16px" }}>Order Summary</h2>
          
          {/* Main Item Specs */}
          <div style={{ display: "flex", gap: 12, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}`, marginBottom: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 10, overflow: "hidden", background: "#F3F4F6", flexShrink: 0 }}>
              <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textFaint, textTransform: "uppercase" }}>{product.brand}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.textMain, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: "1px 0" }}>{product.name}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>Size: {product.size}</div>
            </div>
          </div>

          {/* Promo code bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, background: COLORS.inputBg, borderRadius: 10, padding: "8px 12px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.textFaint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
              <input
                type="text"
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: COLORS.textMain, width: "100%" }}
              />
            </div>
            <button style={{ background: COLORS.inputBg, border: "none", color: COLORS.textMain, padding: "0 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
              Apply
            </button>
          </div>

          {/* Value Row breakdowns */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
              <span style={{ color: COLORS.textMuted }}>Subtotal</span>
              <span style={{ color: COLORS.textMain, fontWeight: 500 }}>₱{subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
              <span style={{ color: COLORS.textMuted }}>Shipping Fee</span>
              <span style={{ color: COLORS.textMain, fontWeight: 500 }}>₱{shippingFee.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
              <span style={{ color: COLORS.textMuted }}>Authentication Escrow Fee</span>
              <span style={{ color: COLORS.textMain, fontWeight: 500 }}>₱{verificationFee.toLocaleString()}</span>
            </div>
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: COLORS.textMain }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.textMain }}>₱{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Secure transaction notice */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: `${COLORS.green}0D`, borderRadius: 14, padding: 14, marginBottom: 16 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.5 }}>
              Funds are held securely in escrow and released to the seller only after Resole verifies physical authenticity and you confirm receipt.
            </div>
          </div>

          <button
            onClick={handlePay}
            style={{
              width: "100%", background: COLORS.primary, color: "#fff", border: "none", borderRadius: 9999,
              padding: "15px 0", fontSize: 15, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            Confirm & Pay ₱{total.toLocaleString()}
          </button>
        </section>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: COLORS.background, fontFamily: "Inter, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => router.back()} style={{ width: 34, height: 34, borderRadius: 9999, border: `1px solid ${COLORS.border}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <span style={{ fontWeight: 700, fontSize: 16, color: COLORS.textMain }}>Secure Checkout</span>
          <span onClick={() => router.push('/')} style={{ fontWeight: 800, fontSize: 18, color: COLORS.primary, marginLeft: "auto", cursor: "pointer" }}>Resole</span>
        </div>
      </header>

      {/* Suspense context wrapper required for client-side search parameter parsing in Next.js */}
      <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted }}>Initializing secure session...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}