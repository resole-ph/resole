import { View, Text, ActivityIndicator } from 'react-native';
import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReceivedListingOffer } from '@/features/offer/services/offer.service';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};

type OfferStatus = 'pending' | 'accepted' | 'declined';

/** Same tri-state read as the inbox offer cards, from `isAccepted`. */
function getStatus(offer: ReceivedListingOffer): OfferStatus {
  if (offer.isAccepted === true) return 'accepted';
  if (offer.isAccepted === false) return 'declined';
  return 'pending';
}

const STATUS_STYLES: Record<OfferStatus, { label: string; color: string; background: string }> = {
  pending:  { label: 'Pending',  color: '#D97706', background: '#FEF3C7' },
  accepted: { label: 'Accepted', color: '#16A34A', background: '#DCFCE7' },
  declined: { label: 'Declined', color: '#6B7280', background: '#F3F4F6' },
};

function formatOfferDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** "₱4,500" for a sale, "2 items" for a swap — whatever the buyer actually put up. */
function formatOfferValue(offer: ReceivedListingOffer) {
  if (offer.type === 'swap') {
    return offer.swapItemCount === 1 ? '1 item offered' : `${offer.swapItemCount} items offered`;
  }
  return offer.price != null ? `₱${offer.price.toLocaleString()}` : 'No amount';
}

function OfferRow({ offer }: { offer: ReceivedListingOffer }) {
  const status = STATUS_STYLES[getStatus(offer)];
  const initial = offer.buyer.name.charAt(0).toUpperCase() || '?';

  /**
   * Straight into the thread this offer was made in. The inbox prefixes
   * conversation ids with "o", and the header details are passed along so the
   * thread can paint before its own fetch lands — the same params the inbox
   * list sends.
   */
  const openConversation = () => {
    router.push({
      pathname: '/inbox/[id]',
      params: {
        id: `o${offer.conversationId}`,
        sender: offer.buyer.name,
        otherUserId: offer.buyer.id,
        avatarInitial: initial,
        avatarColor: '',
        isSystem: '0',
      },
    } as any);
  };

  return (
    <GuardedTouchableOpacity
      className="flex-row items-center bg-white rounded-2xl p-4 mb-3"
      style={CARD_SHADOW}
      activeOpacity={0.85}
      onPress={openConversation}
    >
      <View className="w-11 h-11 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#EFF6FF' }}>
        <Text className="text-blue-700 font-bold text-base">{initial}</Text>
      </View>

      <View className="flex-1 mr-2">
        <View className="flex-row items-center">
          <Text className="text-gray-900 font-semibold text-sm mr-2" numberOfLines={1}>
            @{offer.buyer.name}
          </Text>
          <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: status.background }}>
            <Text className="text-[10px] font-bold" style={{ color: status.color }}>{status.label}</Text>
          </View>
        </View>

        <View className="flex-row items-center mt-0.5">
          {offer.buyer.rating != null && (
            <>
              <Ionicons name="star" size={11} color="#F59E0B" />
              <Text className="text-gray-500 text-xs ml-1">{offer.buyer.rating.toFixed(1)} · </Text>
            </>
          )}
          {offer.buyer.location ? (
            <>
              <Ionicons name="location-outline" size={11} color="#9CA3AF" />
              <Text className="text-gray-500 text-xs ml-1 flex-1" numberOfLines={1}>{offer.buyer.location}</Text>
            </>
          ) : (
            <Text className="text-gray-400 text-xs">No location set</Text>
          )}
        </View>

        <View className="flex-row items-center mt-1">
          <Ionicons
            name={offer.type === 'swap' ? 'swap-horizontal-outline' : 'pricetag-outline'}
            size={12}
            color="#2563EB"
          />
          <Text className="text-blue-600 font-bold text-sm ml-1">{formatOfferValue(offer)}</Text>
          <Text className="text-gray-400 text-xs ml-2">{formatOfferDate(offer.createdAt)}</Text>
        </View>
      </View>

      <Ionicons name="chatbubble-ellipses-outline" size={18} color="#9CA3AF" />
    </GuardedTouchableOpacity>
  );
}

/**
 * Offers received on the seller's own listing, each opening the thread it was
 * made in. Rendered only for the listing's owner — see the 403 on
 * `GET /api/listings/:id/offers`.
 */
export default function ListingOffersSection({
  offers,
  isLoading,
}: {
  offers: ReceivedListingOffer[];
  isLoading: boolean;
}) {
  // Declined offers stay listed: the thread is still the seller's record of the
  // conversation, and hiding them would make an offer look like it vanished.
  return (
    <>
      <View className="h-px bg-gray-100 mb-5" />
      <View className="flex-row items-center mb-3">
        <Text className="text-gray-900 font-bold text-base">Offers Received</Text>
        {!isLoading && offers.length > 0 && (
          <View className="bg-blue-600 rounded-full px-2 py-0.5 ml-2">
            <Text className="text-white text-[10px] font-bold">{offers.length}</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View className="items-center py-6">
          <ActivityIndicator color="#2563EB" />
        </View>
      ) : offers.length === 0 ? (
        <View className="items-center bg-white rounded-2xl py-8 mb-6" style={CARD_SHADOW}>
          <Ionicons name="pricetags-outline" size={32} color="#D1D5DB" />
          <Text className="text-gray-400 text-sm mt-2">No offers yet</Text>
          <Text className="text-gray-300 text-xs mt-1">Buyers who offer will show up here</Text>
        </View>
      ) : (
        <View className="mb-6">
          {offers.map((offer) => (
            // Keyed on the conversation, not the transaction: one offer showing
            // up in two threads would collide on a transaction-id key.
            <OfferRow key={offer.conversationId} offer={offer} />
          ))}
        </View>
      )}
    </>
  );
}
