import { View, Text, Image, ActivityIndicator } from 'react-native';
import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
import { Ionicons } from '@expo/vector-icons';
import { Listing } from '@/components/molecules/ListingCard';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};

export type OfferStatus = 'pending' | 'accepted' | 'declined';

export function getOfferStatus(offer: any): OfferStatus {
  if (offer.isAccepted === true) return 'accepted';
  if (offer.isAccepted === false) return 'declined';
  return 'pending';
}

type OfferCardProps = {
  type: 'sale' | 'swap';
  listing: Listing | null;
  swapItem: Listing | null;
  price: string | null;
  status: OfferStatus;
  canRespond: boolean;
  onAccept: () => void;
  onDecline: () => void;
  time: string;
  isMe: boolean;
  isAccepting: boolean;
  isDeclining: boolean;
};

export default function OfferCard({
  type, listing, swapItem, price, status, canRespond, onAccept, onDecline, time, isMe, isAccepting, isDeclining
}: OfferCardProps) {
  const isSwap = type === 'swap';
  const disabled = isAccepting || isDeclining;

  return (
    <View className="px-4 mb-1">
      <View className="bg-white rounded-2xl p-5 w-full" style={CARD_SHADOW}>
        <View className="flex-row items-center mb-3">
          <View className="bg-blue-50 rounded-xl px-2.5 py-1 flex-row items-center">
            <Ionicons name={isSwap ? 'swap-horizontal-outline' : 'pricetag-outline'} size={12} color="#2563EB" />
            <Text className="text-blue-600 text-xs font-semibold ml-1">{isSwap ? 'Swap Offer' : 'Buy Offer'}</Text>
          </View>
        </View>

        <View
          className="w-full h-48 rounded-xl items-center justify-center mb-3 overflow-hidden"
          style={{ backgroundColor: '#EFF6FF' }}
        >
          {listing?.imageUrl ? (
            <Image source={{ uri: listing.imageUrl }} className="w-full h-full"  />
          ) : (
            <Ionicons name="footsteps-outline" size={28} color="#9CA3AF" />
          )}
        </View>

        {isSwap ? (
          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-gray-900 font-semibold text-sm flex-1" numberOfLines={1}>
                {swapItem?.model ?? 'Their listing'}
              </Text>
              <Ionicons name="swap-horizontal" size={16} color="#9CA3AF" />
              <Text className="text-gray-900 font-semibold text-sm flex-1 text-right" numberOfLines={1}>
                {listing?.model ?? 'Your listing'}
              </Text>
            </View>
            <Text className="text-gray-400 text-xs mb-3">Size {listing?.size ?? '—'} · Item swap</Text>
          </View>
        ) : (
          <View className="mb-3">
            <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>{listing?.model ?? 'Listing'}</Text>
            {listing?.size && <Text className="text-gray-400 text-xs">Size {listing.size}</Text>}
            <Text className="text-blue-600 font-bold text-lg mt-1">
              ₱{parseInt(price ?? '0', 10).toLocaleString()}
            </Text>
          </View>
        )}

        {status === 'pending' ? (
          canRespond ? (
            <View className="flex-row gap-3">
              <GuardedTouchableOpacity
                className="flex-1 flex-row items-center justify-center bg-gray-100 rounded-2xl py-3.5 gap-1.5"
                activeOpacity={disabled ? 0.6 : 0.8}
                onPress={onDecline}
                disabled={disabled}
              >
                {isDeclining ? (
                  <ActivityIndicator size="small" color="#6B7280" />
                ) : (
                  <>
                    <Ionicons name="close" size={16} color="#6B7280" />
                    <Text className="text-gray-600 font-bold text-sm">Decline</Text>
                  </>
                )}
              </GuardedTouchableOpacity>
              <GuardedTouchableOpacity
                className="flex-1 flex-row items-center justify-center bg-blue-600 rounded-2xl py-3.5 gap-1.5"
                activeOpacity={disabled ? 0.6 : 0.85}
                onPress={onAccept}
                disabled={disabled}
                style={
                  !disabled
                    ? { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 }
                    : undefined
                }
              >
                {isAccepting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text className="text-white font-bold text-sm">Accept</Text>
                  </>
                )}
              </GuardedTouchableOpacity>
            </View>
          ) : (
            <View className="rounded-2xl py-3.5 items-center bg-amber-50 flex-row justify-center gap-1.5">
              <Ionicons name="time-outline" size={16} color="#D97706" />
              <Text className="text-amber-600 font-semibold text-sm">Waiting for seller's response</Text>
            </View>
          )
        ) : (
          <View className={`rounded-2xl py-3.5 items-center flex-row justify-center gap-1.5 ${status === 'accepted' ? 'bg-green-50' : 'bg-gray-100'}`}>
            <Ionicons name={status === 'accepted' ? 'checkmark-circle' : 'close-circle'} size={16} color={status === 'accepted' ? '#10B981' : '#9CA3AF'} />
            <Text className={`font-bold text-sm ${status === 'accepted' ? 'text-green-600' : 'text-gray-400'}`}>
              {status === 'accepted' ? 'Offer accepted' : 'Offer declined'}
            </Text>
          </View>
        )}
      </View>
      <Text className={`text-gray-300 text-xs mt-1 ${isMe ? 'mr-1' : 'ml-1'}`}>{time}</Text>
    </View>
  );
}
