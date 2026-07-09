'use client';

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ALL_SNEAKERS } from "../../data/sneakers";

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

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  // Safely extract the ID from the URL parameter
  const productId = params?.id as string;
  
  // Find the matching sneaker, or fallback to the first one if not found
  const product = ALL_SNEAKERS.find((item) => item.id === productId) || ALL_SNEAKERS[0];
  
  const [activeImg, setActiveImg] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [buyConfirmed, setBuyConfirmed] = useState(false);
  const [offerSent, setOfferSent] = useState(false);

  // Faking a gallery array using the product image so the UI layout remains intact
  const galleryImages = [product.image, product.image, product.image, product.image];

  const discount = 20; // 20% mock discount
  const originalPrice = Math.round(product.price / (1 - discount / 100));

  // Get up to 4 related items excluding current one
  const relatedItems = ALL_SNEAKERS.filter((item) => item.id !== product.id).slice(0, 4);

  const isSwappable = product.isSwapBoard;

  function handleConfirmPurchase() {
    setBuyConfirmed(true);
    setTimeout(() => {
      setBuyConfirmed(false);
      setShowBuyModal(false);
      router.push('/inbox');
    }, 1200);
  }

  function handleSendOffer() {
    if (!offerPrice) return;
    setOfferSent(true);
    setTimeout(() => {
      setOfferSent(false);
      setShowOfferModal(false);
      setOfferPrice("");
      setOfferNote("");
      router.push('/inbox');
    }, 1200);
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.background, fontFamily: "Inter, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 32 }}>
          <span 
            onClick={() => router.push('/')} 
            style={{ fontWeight: 800, fontSize: 20, color: COLORS.primary, letterSpacing: "-0.02em", cursor: "pointer" }}
          >
            Resole
          </span>
          <nav style={{ display: "flex", gap: 24, flex: 1 }}>
            {["Home", "Market", "Sell", "Rewards"].map((item) => (
              <span 
                key={item} 
                onClick={() => router.push(item === "Home" ? "/" : `/${item.toLowerCase()}`)}
                style={{ fontSize: 14.5, fontWeight: item === "Market" ? 700 : 500, color: item === "Market" ? COLORS.primary : COLORS.textMuted, cursor: "pointer" }}
              >
                {item}
              </span>
            ))}
          </nav>
          <div style={{ flex: 1, maxWidth: 380, background: COLORS.inputBg, borderRadius: 9999, padding: "9px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={COLORS.textFaint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search marketplace..." 
              onClick={() => router.push('/market')}
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 13.5, color: COLORS.textMain, width: "100%", cursor: "pointer" }}
            />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40, marginBottom: 56 }}>
          {/* Gallery */}
          <div>
            <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", background: "#EDEEEF", aspectRatio: "1/1", boxShadow: CARD_SHADOW }}>
              <img src={galleryImages[activeImg]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                onClick={() => setSaved((s) => !s)}
                style={{ position: "absolute", top: 16, right: 16, width: 38, height: 38, borderRadius: 9999, background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                {/* Inline Heart SVG */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? COLORS.red : "none"} stroke={saved ? COLORS.red : "#6B7280"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: 76, height: 76, borderRadius: 12, overflow: "hidden", padding: 0, cursor: "pointer",
                    border: activeImg === i ? `2px solid ${COLORS.primary}` : `2px solid transparent`,
                    opacity: activeImg === i ? 1 : 0.7,
                  }}
                >
                  <img src={img} alt={`thumb ${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ background: `${COLORS.green}1A`, color: COLORS.green, fontSize: 11.5, fontWeight: 700, borderRadius: 9999, padding: "3px 10px" }}>{product.condition}</span>
            </div>
            <div style={{ fontSize: 12.5, color: COLORS.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{product.brand}</div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: COLORS.textMain, margin: "4px 0 6px" }}>{product.name}</h1>
            <p style={{ fontSize: 13.5, color: COLORS.textMuted, margin: "0 0 20px" }}>Size {product.size}</p>

            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: COLORS.textMain }}>₱{product.price.toLocaleString()}</span>
              {product.was ? (
                <span style={{ fontSize: 15, color: COLORS.textFaint, textDecoration: "line-through" }}>₱{product.was.toLocaleString()}</span>
              ) : (
                <span style={{ fontSize: 15, color: COLORS.textFaint, textDecoration: "line-through" }}>₱{originalPrice.toLocaleString()}</span>
              )}
              <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.green }}>{discount}% OFF</span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMain, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Description</h3>
              <p style={{ fontSize: 13.5, color: COLORS.textMuted, lineHeight: 1.6, margin: 0 }}>
                Authentic {product.name}. Verified by Resole AI Authenticity check. Ships in 1-2 business days.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: `${COLORS.green}0D`, borderRadius: 14, padding: 14, marginBottom: 20 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9999, background: `${COLORS.green}26`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {/* Inline Leaf SVG */}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58-1 9.5A7 7 0 0 1 11 20z"></path>
                  <path d="M19 2L11 10"></path>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMain }}>Eco-Conscious Choice</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>Buying used saves 12kg of CO2 emissions.</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.surface, borderRadius: 14, padding: 14, boxShadow: CARD_SHADOW, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9999, background: COLORS.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>S</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.textMain }}>@sneakerhead_ph</span>
                    {/* Inline BadgeCheck SVG */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12 6.477 22 12 22z"></path>
                      <path d="M9 12l2 2 4-4"></path>
                    </svg>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: COLORS.textFaint }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill={COLORS.amber} stroke={COLORS.amber} strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg> 
                    4.8 (142 sales)
                  </div>
                </div>
              </div>
              <button 
                onClick={() => router.push('/chat')}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: `1.5px solid ${COLORS.primary}`, color: COLORS.primary, borderRadius: 9999, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                {/* Inline MessageCircle SVG */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg> 
                Chat
              </button>
            </div>

            {/* Buy / Swap / Offer actions */}
            {isSwappable ? (
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setShowBuyModal(true)}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#059669", color: "#fff", border: "none", borderRadius: 9999, padding: "14px 0", fontSize: 14.5, fontWeight: 700, cursor: "pointer", boxShadow: "0px 4px 14px rgba(5,150,105,0.3)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>shopping_bag</span>
                  Buy Now
                </button>
                <button
                  onClick={() => router.push(`/swap?id=${product.id}`)}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#7C3AED", color: "#fff", border: "none", borderRadius: 9999, padding: "14px 0", fontSize: 14.5, fontWeight: 700, cursor: "pointer", boxShadow: "0px 4px 14px rgba(124,58,237,0.3)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>swap_horiz</span>
                  Swap Offer
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => { setOfferPrice(String(product.price)); setShowOfferModal(true); }}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#D97706", color: "#fff", border: "none", borderRadius: 9999, padding: "14px 0", fontSize: 14.5, fontWeight: 700, cursor: "pointer", boxShadow: "0px 4px 14px rgba(217,119,6,0.3)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>sell</span>
                  Make Offer
                </button>
                <button
                  onClick={() => setShowBuyModal(true)}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#059669", color: "#fff", border: "none", borderRadius: 9999, padding: "14px 0", fontSize: 14.5, fontWeight: 700, cursor: "pointer", boxShadow: "0px 4px 14px rgba(5,150,105,0.3)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>shopping_bag</span>
                  Buy Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Related sneakers */}
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: "0 0 16px" }}>Related Sneakers</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {relatedItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => router.push(`/listings/${item.id}`)}
                style={{ background: COLORS.surface, borderRadius: 16, overflow: "hidden", boxShadow: CARD_SHADOW, cursor: "pointer" }}
              >
                <div style={{ position: "relative", aspectRatio: "1/1", background: "#F3F4F6" }}>
                  <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={{ fontSize: 10.5, color: COLORS.textFaint, fontWeight: 600, textTransform: "uppercase" }}>{item.brand}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMain, margin: "2px 0 6px" }}>{item.name}</div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: COLORS.textMain }}>₱{item.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Buy Now modal */}
      {showBuyModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div
            onClick={() => setShowBuyModal(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }}
          />
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 460,
              background: "#fff",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              paddingBottom: 32,
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#E5E7EB", margin: "0 auto 20px" }} />

            <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: "0 0 16px" }}>Order Summary</h3>

            <div style={{ display: "flex", alignItems: "center", background: "#F9FAFB", borderRadius: 16, padding: 12, marginBottom: 20 }}>
              <img src={product.image} alt={product.name} style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", background: "#F3F4F6" }} />
              <div style={{ flex: 1, marginLeft: 12 }}>
                <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 2 }}>{product.brand}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.textMain }}>{product.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textFaint, marginTop: 2 }}>Size {product.size}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: COLORS.textMuted }}>Item price</span>
                <span style={{ fontSize: 14, color: COLORS.textMain, fontWeight: 500 }}>₱{product.price.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: COLORS.textMuted }}>Meet-up / shipping</span>
                <span style={{ fontSize: 14, color: COLORS.textMuted }}>To be arranged</span>
              </div>
              <div style={{ height: 1, background: "#F3F4F6" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.textMain }}>Total</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#059669" }}>₱{product.price.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmPurchase}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#059669", color: "#fff", border: "none", borderRadius: 18, padding: "16px 0", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0px 4px 14px rgba(5,150,105,0.3)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {buyConfirmed ? "check_circle" : "shopping_bag"}
              </span>
              {buyConfirmed ? "Order Placed!" : "Confirm Purchase"}
            </button>
          </div>
        </div>
      )}

      {/* Make Offer modal */}
      {showOfferModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div
            onClick={() => setShowOfferModal(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }}
          />
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 460,
              background: "#fff",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              paddingBottom: 32,
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#E5E7EB", margin: "0 auto 20px" }} />

            <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: "0 0 4px" }}>Make an Offer</h3>
            <p style={{ fontSize: 13, color: COLORS.textFaint, margin: "0 0 20px" }}>Listed at ₱{product.price.toLocaleString()}</p>

            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8, display: "block" }}>
              Your offer price
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#F9FAFB",
                borderRadius: 14,
                padding: "0 14px",
                border: `1.5px solid ${offerPrice ? "#D97706" : COLORS.border}`,
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 16, color: COLORS.textMuted, marginRight: 4 }}>₱</span>
              <input
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder={String(product.price)}
                inputMode="numeric"
                style={{ flex: 1, padding: "14px 0", fontSize: 18, fontWeight: 700, color: COLORS.textMain, background: "transparent", border: "none", outline: "none" }}
              />
            </div>

            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8, display: "block" }}>
              Message to seller (optional)
            </label>
            <textarea
              value={offerNote}
              onChange={(e) => setOfferNote(e.target.value)}
              placeholder="e.g. Can we meet in BGC this weekend?"
              rows={3}
              style={{ width: "100%", background: "#F9FAFB", borderRadius: 14, padding: 14, fontSize: 14, color: COLORS.textMain, border: `1.5px solid ${COLORS.border}`, marginBottom: 20, resize: "none", outline: "none", fontFamily: "Inter, sans-serif" }}
            />

            <button
              onClick={offerPrice ? handleSendOffer : undefined}
              disabled={!offerPrice}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: offerPrice ? "#D97706" : COLORS.border,
                color: offerPrice ? "#fff" : COLORS.textFaint,
                border: "none",
                borderRadius: 18,
                padding: "16px 0",
                fontSize: 16,
                fontWeight: 700,
                cursor: offerPrice ? "pointer" : "default",
                boxShadow: offerPrice ? "0px 4px 14px rgba(217,119,6,0.3)" : "none",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {offerSent ? "check_circle" : "sell"}
              </span>
              {offerSent ? "Offer Sent!" : "Send Offer"}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: "#F3F4F5", borderTop: `1px solid ${COLORS.border}`, padding: "32px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <span onClick={() => router.push('/')} style={{ fontWeight: 800, fontSize: 17, color: COLORS.primary, cursor: "pointer" }}>Resole</span>
            <p style={{ fontSize: 12, color: COLORS.textFaint, margin: "6px 0 0", maxWidth: 280 }}>
              © 2026 Resole Sneaker Marketplace. Circular commerce for a better planet. Authenticating the world's most desired kicks.
            </p>
          </div>
          <div style={{ display: "flex", gap: 48, fontSize: 13 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: "0.04em" }}>Platform</span>
              <span onClick={() => router.push('/sustainability')} style={{ color: COLORS.textMuted, cursor: "pointer" }}>Sustainability Mission</span>
              <span onClick={() => router.push('/ai-valuation')} style={{ color: COLORS.textMuted, cursor: "pointer" }}>AI Valuation Info</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: "0.04em" }}>Support</span>
              <span onClick={() => router.push('/terms')} style={{ color: COLORS.primary, cursor: "pointer" }}>Seller Terms</span>
              <span onClick={() => router.push('/privacy')} style={{ color: COLORS.primary, cursor: "pointer" }}>Privacy Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}