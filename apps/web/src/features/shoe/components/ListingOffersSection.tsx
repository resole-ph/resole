'use client';

import { useRouter } from 'next/navigation';

/** Mirrors the mobile type — both clients read `GET /api/listings/:id/offers`. */
export type ReceivedListingOffer = {
  transactionId: number;
  /** The seller's thread with this buyer, or null if they have never messaged. */
  conversationId: number | null;
  type: 'sale' | 'swap' | 'donate';
  /** null while pending, true accepted, false declined. */
  isAccepted: boolean | null;
  isCompleted: boolean;
  createdAt: string;
  /** Sale offers only; a swap's value is the items put up instead. */
  price: number | null;
  swapItemCount: number;
  buyer: {
    id: string;
    name: string;
    location: string | null;
    rating: number | null;
  };
};

// Mirrors the palette in app/listings/[id]/page.tsx.
const COLORS = {
  primary: '#2563EB',
  surface: '#FFFFFF',
  amber: '#F59E0B',
  textMain: '#191C1D',
  textMuted: '#6B7280',
  textFaint: '#9CA3AF',
} as const;

const CARD_SHADOW = '0px 4px 20px rgba(0,0,0,0.05)';

type OfferStatus = 'pending' | 'accepted' | 'declined';

/** Same tri-state read as the inbox offer cards, from `isAccepted`. */
function getStatus(offer: ReceivedListingOffer): OfferStatus {
  if (offer.isAccepted === true) return 'accepted';
  if (offer.isAccepted === false) return 'declined';
  return 'pending';
}

const STATUS_STYLES: Record<OfferStatus, { label: string; color: string; background: string }> = {
  pending: { label: 'Pending', color: '#D97706', background: '#FEF3C7' },
  accepted: { label: 'Accepted', color: '#16A34A', background: '#DCFCE7' },
  declined: { label: 'Declined', color: '#6B7280', background: '#F3F4F6' },
};

function formatOfferDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Swaps are listed without what was put up — those specifics live in the thread. */
function formatOfferValue(offer: ReceivedListingOffer) {
  if (offer.type === 'swap') return 'Swap offer';
  return offer.price != null ? `₱${offer.price.toLocaleString()}` : 'No amount';
}

function OfferRow({ offer }: { offer: ReceivedListingOffer }) {
  const router = useRouter();
  const status = STATUS_STYLES[getStatus(offer)];
  const initial = offer.buyer.name.charAt(0).toUpperCase() || '?';

  return (
    <button
      type="button"
      // The inbox list, not the thread: web's thread picker is local state with
      // no URL deep-link to target.
      onClick={() => router.push('/inbox')}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        gap: 12,
        background: COLORS.surface,
        border: 'none',
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        boxShadow: CARD_SHADOW,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 9999,
          background: '#EFF6FF',
          color: '#1D4ED8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 15,
          flexShrink: 0,
        }}
      >
        {initial}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            @{offer.buyer.name}
          </span>
          <span
            style={{ background: status.background, color: status.color, fontSize: 10.5, fontWeight: 700, borderRadius: 9999, padding: '2px 8px', flexShrink: 0 }}
          >
            {status.label}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: COLORS.textFaint, marginTop: 2 }}>
          {offer.buyer.rating != null && (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill={COLORS.amber} stroke={COLORS.amber} strokeWidth="1">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              {offer.buyer.rating.toFixed(1)}
              <span>·</span>
            </>
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {offer.buyer.location || 'No location set'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: COLORS.primary }}>
            {offer.type === 'swap' ? 'swap_horiz' : 'sell'}
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.primary }}>
            {formatOfferValue(offer)}
          </span>
          <span style={{ fontSize: 12, color: COLORS.textFaint }}>{formatOfferDate(offer.createdAt)}</span>
        </div>
      </div>

      <span className="material-symbols-outlined" style={{ fontSize: 20, color: COLORS.textFaint }}>
        chat_bubble
      </span>
    </button>
  );
}

/**
 * Offers received on the seller's own listing. Rendered only for the listing's
 * owner — see the 403 on `GET /api/listings/:id/offers`.
 */
export default function ListingOffersSection({
  offers,
  isLoading,
}: {
  offers: ReceivedListingOffer[];
  isLoading: boolean;
}) {
  // Declined offers stay listed: hiding them would make an offer look like it vanished.
  return (
    <section style={{ marginBottom: 56 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 16px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: 0 }}>Offers Received</h2>
        {!isLoading && offers.length > 0 && (
          <span
            style={{ background: COLORS.primary, color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 9999, padding: '2px 9px' }}
          >
            {offers.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 0' }}>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : offers.length === 0 ? (
        <div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: COLORS.surface, borderRadius: 16, padding: '36px 20px', boxShadow: CARD_SHADOW }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#D1D5DB' }}>
            sell
          </span>
          <p style={{ fontSize: 14, color: COLORS.textFaint, margin: '8px 0 0' }}>No offers yet</p>
          <p style={{ fontSize: 12.5, color: '#D1D5DB', margin: '4px 0 0' }}>
            Buyers who offer will show up here
          </p>
        </div>
      ) : (
        <div>
          {offers.map((offer) => (
            <OfferRow key={offer.transactionId} offer={offer} />
          ))}
        </div>
      )}
    </section>
  );
}
