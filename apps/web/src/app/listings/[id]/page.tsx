'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthGate } from '@/providers/AuthGateProvider';

const COLORS = {
  primary: '#2563EB',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  textMain: '#191C1D',
  textMuted: '#6B7280',
  textFaint: '#9CA3AF',
  border: '#E5E7EB',
  inputBg: '#F3F4F6',
} as const;

const CARD_SHADOW = '0px 4px 20px rgba(0,0,0,0.05)';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { requireAuth } = useAuthGate();

  // Safely extract the ID from the URL parameter
  const productId = params?.id as string;

  // Dynamic States
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);

  // Modals & offers
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [buyConfirmed, setBuyConfirmed] = useState(false);
  const [buySubmitting, setBuySubmitting] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [offerSent, setOfferSent] = useState(false);
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    async function loadListingDetails() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/listings/${productId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load listing details');

        if (data.shoeListing) {
          setListing(data.shoeListing);
        } else {
          setError('Listing not found');
        }

        // Check if saved
        const resFav = await fetch('/api/users/me/favourites');
        const dataFav = await resFav.json();
        if (resFav.ok && dataFav.favourites) {
          const isFaved = dataFav.favourites.some(
            (f: any) => String(f.listingId || f.listing?.id) === String(productId)
          );
          setSaved(isFaved);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    loadListingDetails();
  }, [productId]);

  // Fetch related items by brand
  useEffect(() => {
    if (!listing) return;
    async function loadRelated() {
      try {
        const res = await fetch(`/api/listings?brand=${encodeURIComponent(listing.brand)}`);
        const data = await res.json();
        if (res.ok && data.shoeListings) {
          const filtered = data.shoeListings.filter((item: any) => String(item.id) !== String(productId)).slice(0, 4);
          setRelatedItems(filtered);
        }
      } catch (e) {
        console.error('Failed to load related items:', e);
      }
    }
    loadRelated();
  }, [listing, productId]);

  const handleToggleSave = async () => {
    if (!listing) return;
    const isSaved = saved;
    setSaved(!isSaved);

    try {
      await fetch(`/api/listings/${productId}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
      });
    } catch (e) {
      console.error('Failed to toggle save:', e);
      setSaved(isSaved); // revert on error
    }
  };

  // Gallery images array populated from Top, Side, Sole, Insole photos
  const galleryImages = useMemo(() => {
    if (!listing) return [];
    return [
      listing.imageUrlTop,
      listing.imageUrlLeftSide || listing.imageUrlSide,
      listing.imageUrlRightSide || listing.imageUrlSide,
      listing.imageUrlSole,
      listing.imageUrlInsoleRight || listing.imageUrlInsole,
      listing.imageUrlInsoleLeft || listing.imageUrlInsole,
    ].filter(Boolean);
  }, [listing]);

  const isSwappable = listing?.listingMode === 'Swap' || listing?.listingMode === 'Both';
  const showBuyButton = listing?.listingMode === 'Sale' || listing?.listingMode === 'Both';
  const showSwapButton = listing?.listingMode === 'Swap' || listing?.listingMode === 'Both';
  const showOfferButton = listing?.listingMode === 'Sale' || listing?.listingMode === 'Both';

  async function handleConfirmPurchase() {
    if (buySubmitting) return;
    setBuySubmitting(true);
    setBuyError(null);

    try {
      // Staging a buy-now cart row first is what /api/checkout consumes; it
      // clears any previous buy-now row, so pressing this twice buys once.
      const cartResponse = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: Number(productId), quantity: 1, isBuyNow: true }),
      });
      const cartData = await cartResponse.json().catch(() => ({}));
      if (!cartResponse.ok) throw new Error(cartData.error || 'Could not start your purchase');

      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBuyNow: true }),
      });
      const checkoutData = await checkoutResponse.json().catch(() => ({}));
      if (!checkoutResponse.ok) throw new Error(checkoutData.error || 'Checkout failed');

      setBuyConfirmed(true);
      setTimeout(() => {
        setBuyConfirmed(false);
        setShowBuyModal(false);
        router.push('/inbox');
      }, 1200);
    } catch (err) {
      console.error('Failed to complete purchase:', err);
      setBuyError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBuySubmitting(false);
    }
  }

  // `offerNote` stays UI-only — the sale table has no column for a message to
  // the seller, so there is nowhere to put it yet.
  async function handleSendOffer() {
    if (!offerPrice || offerSubmitting) return;
    setOfferSubmitting(true);
    setOfferError(null);

    try {
      const response = await fetch(`/api/listings/${productId}/sale-offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sale', price: Number(offerPrice) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to send your offer');

      setOfferSent(true);
      setTimeout(() => {
        setOfferSent(false);
        setShowOfferModal(false);
        setOfferPrice('');
        setOfferNote('');
        router.push('/inbox');
      }, 1200);
    } catch (err) {
      console.error('Failed to send offer:', err);
      setOfferError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setOfferSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant text-[14px] mt-4 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
        <span className="material-symbols-outlined text-error text-[48px] mb-3">error</span>
        <p className="text-error font-semibold text-[16px]">{error || 'Product not found'}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-5 py-2.5 bg-primary text-white rounded-full text-[14px] font-semibold hover:opacity-90"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background, fontFamily: 'Inter, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; }`}</style>



      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 40, marginBottom: 56 }} className="flex flex-col md:grid">
          {/* Gallery */}
          <div>
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#EDEEEF', aspectRatio: '1/1', boxShadow: CARD_SHADOW }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={galleryImages[activeImg] || listing.imageUrl} alt={listing.model} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.3)' }} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  requireAuth(handleToggleSave, 'Log in to save listings to your favourites.');
                }}
                style={{ position: 'absolute', top: 16, right: 16, width: 38, height: 38, borderRadius: 9999, background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
              >
                {/* Inline Heart SVG */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? COLORS.red : 'none'} stroke={saved ? COLORS.red : '#6B7280'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: 76, height: 76, borderRadius: 12, overflow: 'hidden', padding: 0, cursor: 'pointer',
                    border: activeImg === i ? `2px solid ${COLORS.primary}` : `2px solid transparent`,
                    opacity: activeImg === i ? 1 : 0.7,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`thumb ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ background: `${COLORS.green}1A`, color: COLORS.green, fontSize: 11.5, fontWeight: 700, borderRadius: 9999, padding: '3px 10px' }}>
                {listing.condition || 'Good Condition'}
              </span>
              <span style={{ background: `${COLORS.amber}1A`, color: COLORS.amber, fontSize: 11.5, fontWeight: 700, borderRadius: 9999, padding: '3px 10px' }}>
                Score: {listing.conditionScore}/10
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: COLORS.textFaint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{listing.brand}</div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: COLORS.textMain, margin: '4px 0 6px' }}>{listing.model}</h1>
            <p style={{ fontSize: 13.5, color: COLORS.textMuted, margin: '0 0 20px' }}>
              Size: US {listing.size} {listing.colorway ? `| Colorway: ${listing.colorway}` : ''}
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: COLORS.textMain }}>₱{Number(listing.price || 0).toLocaleString()}</span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMain, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Description</h3>
              <p style={{ fontSize: 13.5, color: COLORS.textMuted, lineHeight: 1.6, margin: 0 }}>
                {listing.description || 'No description provided.'}
              </p>
            </div>

            {/* Eco-Conscious badge */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: `${COLORS.green}0D`, borderRadius: 14, padding: 14, marginBottom: 20 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9999, background: `${COLORS.green}26`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="m-2">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58-1 9.5A7 7 0 0 1 11 20z"></path>
                  <path d="M19 2L11 10"></path>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMain }}>Eco-Conscious Choice</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                  Buying circular sneaker saves {listing.co2Footprint != null ? `${listing.co2Footprint}kg` : '12kg'} of CO2 emissions.
                </div>
              </div>
            </div>

            {/* Seller profile card */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: COLORS.surface, borderRadius: 14, padding: 14, boxShadow: CARD_SHADOW, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9999, background: COLORS.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                  <span className="m-2">{listing.seller?.name ? listing.seller.name.substring(0, 1).toUpperCase() : 'S'}</span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.textMain }}>@{listing.seller?.name || 'Seller'}</span>
                  </div>
                  {listing.seller?.rating != null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: COLORS.textFaint }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill={COLORS.amber} stroke={COLORS.amber} strokeWidth="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      {Number(listing.seller.rating).toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => router.push('/inbox')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: `1.5px solid ${COLORS.primary}`, color: COLORS.primary, borderRadius: 9999, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                Chat
              </button>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              {showOfferButton && (
                <button
                  onClick={() => requireAuth(() => {
                    setOfferPrice(String(listing.price));
                    setOfferError(null);
                    setShowOfferModal(true);
                  }, 'Log in to make an offer.')}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#D97706', color: '#fff', border: 'none', borderRadius: 9999, padding: '14px 0', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0px 4px 14px rgba(217,119,6,0.3)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>sell</span>
                  Make Offer
                </button>
              )}
              {showBuyButton && (
                <button
                  onClick={() => requireAuth(() => {
                    setBuyError(null);
                    setShowBuyModal(true);
                  }, 'Log in to buy this pair.')}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#059669', color: '#fff', border: 'none', borderRadius: 9999, padding: '14px 0', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0px 4px 14px rgba(5,150,105,0.3)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>shopping_bag</span>
                  Buy Now
                </button>
              )}
              {showSwapButton && (
                <button
                  onClick={() => requireAuth(() => router.push(`/swap?id=${listing.id}`), 'Log in to propose a swap.')}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 9999, padding: '14px 0', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0px 4px 14px rgba(124,58,237,0.3)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>swap_horiz</span>
                  Swap Offer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Related sneakers */}
        {relatedItems.length > 0 && (
          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: '0 0 16px' }}>Related Sneakers</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="grid grid-cols-2 md:grid-cols-4">
              {relatedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/listings/${item.id}`)}
                  style={{ background: COLORS.surface, borderRadius: 16, overflow: 'hidden', boxShadow: CARD_SHADOW, cursor: 'pointer' }}
                  className="hover:shadow-md transition-shadow"
                >
                  <div style={{ position: 'relative', aspectRatio: '1/1', background: '#F3F4F6', overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl || item.imageUrlTop} alt={item.model} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.3)' }} />
                  </div>
                  <div style={{ padding: '10px 12px 12px' }}>
                    <div style={{ fontSize: 10.5, color: COLORS.textFaint, fontWeight: 600, textTransform: 'uppercase' }}>{item.brand}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMain, margin: '2px 0 6px' }} className="truncate">{item.model}</div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: COLORS.textMain }}>₱{Number(item.price || 0).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Buy Now modal */}
      {showBuyModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div
            onClick={() => setShowBuyModal(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          />
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 460,
              background: '#fff',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              paddingBottom: 32,
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E5E7EB', margin: '0 auto 20px' }} />

            <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: '0 0 16px' }}>Order Summary</h3>

            <div style={{ display: 'flex', alignItems: 'center', background: '#F9FAFB', borderRadius: 16, padding: 12, marginBottom: 20 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={listing.imageUrl || listing.imageUrlTop} alt={listing.model} style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', background: '#F3F4F6' }} />
              <div style={{ flex: 1, marginLeft: 12 }}>
                <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 2 }}>{listing.brand}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.textMain }}>{listing.model}</div>
                <div style={{ fontSize: 12, color: COLORS.textFaint, marginTop: 2 }}>Size US {listing.size}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, color: COLORS.textMuted }}>Item price</span>
                <span style={{ fontSize: 14, color: COLORS.textMain, fontWeight: 500 }}>₱{Number(listing.price || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, color: COLORS.textMuted }}>Meet-up / shipping</span>
                <span style={{ fontSize: 14, color: COLORS.textMuted }}>To be arranged</span>
              </div>
              <div style={{ height: 1, background: '#F3F4F6' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.textMain }}>Total</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#059669' }}>₱{Number(listing.price || 0).toLocaleString()}</span>
              </div>
            </div>

            {buyError && (
              <p style={{ fontSize: 13, color: COLORS.red, margin: '0 0 12px' }}>{buyError}</p>
            )}

            <button
              onClick={handleConfirmPurchase}
              disabled={buySubmitting}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#059669', color: '#fff', border: 'none', borderRadius: 18, padding: '16px 0', fontSize: 16, fontWeight: 700, cursor: buySubmitting ? 'default' : 'pointer', opacity: buySubmitting ? 0.7 : 1, boxShadow: '0px 4px 14px rgba(5,150,105,0.3)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {buyConfirmed ? 'check_circle' : 'shopping_bag'}
              </span>
              {buyConfirmed ? 'Order Placed!' : buySubmitting ? 'Placing order…' : 'Confirm Purchase'}
            </button>
          </div>
        </div>
      )}

      {/* Make Offer modal */}
      {showOfferModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div
            onClick={() => setShowOfferModal(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          />
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 460,
              background: '#fff',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              paddingBottom: 32,
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E5E7EB', margin: '0 auto 20px' }} />

            <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain, margin: '0 0 4px' }}>Make an Offer</h3>
            <p style={{ fontSize: 13, color: COLORS.textFaint, margin: '0 0 20px' }}>Listed at ₱{Number(listing.price || 0).toLocaleString()}</p>

            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8, display: 'block' }}>
              Your offer price
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#F9FAFB',
                borderRadius: 14,
                padding: '0 14px',
                border: `1.5px solid ${offerPrice ? '#D97706' : COLORS.border}`,
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 16, color: COLORS.textMuted, marginRight: 4 }}>₱</span>
              <input
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder={String(listing.price || 0)}
                inputMode="numeric"
                style={{ flex: 1, padding: '14px 0', fontSize: 18, fontWeight: 700, color: COLORS.textMain, background: 'transparent', border: 'none', outline: 'none' }}
              />
            </div>

            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8, display: 'block' }}>
              Message to seller (optional)
            </label>
            <textarea
              value={offerNote}
              onChange={(e) => setOfferNote(e.target.value)}
              placeholder="e.g. Can we meet in BGC this weekend?"
              rows={3}
              style={{ width: '100%', background: '#F9FAFB', borderRadius: 14, padding: 14, fontSize: 14, color: COLORS.textMain, border: `1.5px solid ${COLORS.border}`, marginBottom: 20, resize: 'none', outline: 'none', fontFamily: 'Inter, sans-serif' }}
            />

            {offerError && (
              <p style={{ fontSize: 13, color: COLORS.red, margin: '0 0 12px' }}>{offerError}</p>
            )}

            <button
              onClick={offerPrice ? handleSendOffer : undefined}
              disabled={!offerPrice || offerSubmitting}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: offerPrice ? '#D97706' : COLORS.border,
                color: offerPrice ? '#fff' : COLORS.textFaint,
                border: 'none',
                borderRadius: 18,
                padding: '16px 0',
                fontSize: 16,
                fontWeight: 700,
                cursor: offerPrice && !offerSubmitting ? 'pointer' : 'default',
                opacity: offerSubmitting ? 0.7 : 1,
                boxShadow: offerPrice ? '0px 4px 14px rgba(217,119,6,0.3)' : 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {offerSent ? 'check_circle' : 'sell'}
              </span>
              {offerSent ? 'Offer Sent!' : offerSubmitting ? 'Sending…' : 'Send Offer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}