'use client';

import { useRouter } from "next/navigation";
import type { SerializedShoeListing } from "@/features/shoe/utils/listing-dto";
import { formatSizeShort } from "@/features/shoe/utils/size-conversion";

const COLORS = {
  primary: "#2563EB",
  surface: "#FFFFFF",
  green: "#10B981",
  amber: "#F59E0B",
  blue: "#3B82F6",
  gray: "#9CA3AF",
  red: "#EF4444",
  purple: "#8B5CF6",
  textMain: "#111827",
  textMuted: "#4B5563",
  textFaint: "#9CA3AF",
  border: "#E5E7EB",
} as const;

const CONDITION_COLORS: Record<string, string> = {
  'Brand New': '#10B981',
  'Like New': '#10B981',
  'Excellent': '#3B82F6',
  'Good': '#F59E0B',
  'Fair': '#9CA3AF',
  'Poor': '#EF4444',
};

const BADGE_STYLES: Record<string, { bg: string; text: string; icon: string; label?: string }> = {
  Swap: { bg: '#2563EB', text: '#fff', icon: 'swap_horiz' },
  Sale: { bg: '#10B981', text: '#fff', icon: 'sell' },
  Both: { bg: '#8B5CF6', text: '#fff', icon: 'published_with_changes', label: 'Swap & Sell' },
  'Flash Deal': { bg: '#F59E0B', text: '#fff', icon: 'bolt' },
};

export interface ListingCardProps {
  item: SerializedShoeListing & {
    originalPrice?: number;
    daysLeft?: number;
    freeShipping?: boolean;
    swapFor?: string;
  };
  isSaved?: boolean;
  onFavorite?: (id: string) => void;
  onRequireApp?: () => void;
}

/** Calculates remaining days dynamically from createdAt if daysLeft is missing */
function getDaysLeft(createdAt?: string | Date, rawDaysLeft?: number): number {
  if (rawDaysLeft !== undefined) return rawDaysLeft;
  if (!createdAt) return 14;

  const created = new Date(createdAt);
  const diffDays = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
  const remaining = 30 - diffDays; // Assumes 30-day listing lifespan
  return remaining > 0 ? remaining : 1;
}

export default function ListingCard({
  item,
  isSaved = false,
  onFavorite,
  onRequireApp,
}: ListingCardProps) {
  const router = useRouter();

  const title = item.colorway ? `${item.model} '${item.colorway}'` : item.model;
  const isSwap = item.listingMode === "Swap";
  const badge = item.listingMode && BADGE_STYLES[item.listingMode];
  const conditionColor = CONDITION_COLORS[item.condition] || COLORS.green;

  const daysLeft = getDaysLeft(item.createdAt, item.daysLeft);
  // Sizes are stored as US Men's; the DTO stringifies unconditionally, so a
  // missing size arrives as "null"/"undefined" and formatSizeShort rejects it.
  const sizeLabel = formatSizeShort(
    item.size === 'null' || item.size === 'undefined' ? null : item.size
  );
  // Null when the seller has no ratings yet — the chip is hidden rather than defaulted.
  const sellerRating = item.seller?.rating ?? null;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRequireApp) {
      onRequireApp();
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(String(item.id));
    } else if (onRequireApp) {
      onRequireApp();
    }
  };

  return (
    <div
      onClick={() => router.push(`/listings/${item.id}`)}
      style={{
        background: COLORS.surface,
        borderRadius: 20,
        border: `1px solid ${COLORS.border}`,
        overflow: "hidden",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.04)",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        flexDirection: "column",
        height: "100%", // Ensures uniform height across grid cells
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0px 14px 30px rgba(0,0,0,0.10)";
        e.currentTarget.style.borderColor = "#BFDBFE";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0px 2px 8px rgba(0,0,0,0.04)";
        e.currentTarget.style.borderColor = COLORS.border;
      }}
    >
      {/* IMAGE CONTAINER WITH ASPECT RATIO */}
      <div style={{ position: "relative", aspectRatio: "4/3", background: "#F8FAFC", overflow: "hidden" }}>
        <img
          src={item.imageUrl || "/placeholder-shoe.png"}
          alt={title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
        />

        {/* Days Left Badge */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(4px)",
            borderRadius: 9999,
            padding: "4px 10px",
            display: "flex",
            alignItems: "center",
            gap: 5,
            boxShadow: "0px 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: daysLeft <= 3 ? COLORS.red : COLORS.green,
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>
            {daysLeft}d left
          </span>
        </div>

        {/* Listing Mode Badge */}
        {badge && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: badge.bg,
              color: badge.text,
              borderRadius: 9999,
              padding: "4px 10px",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 700,
              boxShadow: "0px 2px 6px rgba(0,0,0,0.12)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
              {badge.icon}
            </span>
            {badge.label ?? item.listingMode}
          </div>
        )}

        {/* Free Shipping + Size Badges — laid out in a row so they never overlap */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {item.freeShipping && (
            <div
              style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(4px)",
                border: "1px solid #A7F3D0",
                color: "#047857",
                borderRadius: 9999,
                padding: "3px 10px",
                fontSize: 10.5,
                fontWeight: 700,
              }}
            >
              Free Ship
            </div>
          )}

          {sizeLabel && (
            <div
              style={{
                background: "rgba(17,24,39,0.85)",
                backdropFilter: "blur(4px)",
                color: "#FFFFFF",
                borderRadius: 9999,
                padding: "3px 10px",
                fontSize: 10.5,
                fontWeight: 700,
              }}
            >
              {sizeLabel}
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label="Save listing"
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            width: 32,
            height: 32,
            borderRadius: 9999,
            background: "#FFFFFF",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0px 2px 10px rgba(0,0,0,0.15)",
            transition: "transform 0.15s ease",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 16,
              color: isSaved ? COLORS.red : COLORS.textMuted,
              fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            favorite
          </span>
        </button>
      </div>

      {/* CARD BODY */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
        <div>
          {/* Brand & Condition */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11.5, color: COLORS.textFaint, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.brand}
              {sizeLabel ? ` · ${sizeLabel}` : ""}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: conditionColor }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: conditionColor }}>
                {item.condition}
              </span>
            </div>
          </div>

          {/* Model Name - Fixed 2 Line Min-Height so all cards align evenly */}
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: COLORS.textMain,
              margin: "0 0 12px",
              lineHeight: "1.35",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "40.5px", // Enforces strict alignment regardless of 1 or 2 lines
            }}
            title={title}
          >
            {title}
          </div>
        </div>

        {/* FOOTER ACTIONS - Fixed to bottom */}
        <div style={{ marginTop: "auto" }}>
          {isSwap ? (
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
              <div style={{ fontSize: 11.5, color: COLORS.textFaint, fontWeight: 500 }}>Looking to swap for</div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: COLORS.textMain,
                  margin: "2px 0 12px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.swapFor || "Open to offers"}
              </div>
              <button
                onClick={handleActionClick}
                style={{
                  width: "100%",
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  color: COLORS.primary,
                  borderRadius: 12,
                  padding: "10px 0",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "background 0.15s ease",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>swap_horiz</span>
                Propose Swap
              </button>
            </div>
          ) : (
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
              {/* Price Row */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: COLORS.primary }}>
                  ₱{Number(item.price || 0).toLocaleString()}
                </span>
                {/*
                  Retail price of a NEW pair, from the scraped catalog — not a former
                  asking price, so it is labelled rather than struck through.
                */}
                {item.originalPrice && (
                  <span style={{ fontSize: 11.5, color: COLORS.textFaint, fontWeight: 600 }}>
                    Retail ₱{Number(item.originalPrice).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Seller Info + Star Rating */}
              {item.seller && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "#DBEAFE",
                        color: COLORS.primary,
                        fontSize: 11,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.seller.name?.[0]?.toUpperCase() ?? "R"}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.seller.name}
                    </span>
                  </div>

                  {/* Rating Stars — omitted entirely for sellers with no ratings */}
                  {sellerRating !== null && (
                    <div style={{ display: "flex", alignItems: "center", gap: 3, background: "#FEF3C7", padding: "2px 6px", borderRadius: 6 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 13, color: COLORS.amber }}>star</span>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: "#92400E" }}>
                        {Number(sellerRating).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleActionClick}
                style={{
                  width: "100%",
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  color: COLORS.primary,
                  borderRadius: 12,
                  padding: "10px 0",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "background 0.15s ease",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>sell</span>
                Make Offer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}