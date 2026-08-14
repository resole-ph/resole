import { View, Text, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
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
  topUp: string | null | undefined;
  status: OfferStatus;
  canRespond: boolean;
  canEdit: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onEdit: () => void;
  time: string;
  isMe: boolean;
  isAccepting: boolean;
  isDeclining: boolean;
};

export default function OfferCard({
  type, listing, swapItem, price, topUp, status, canRespond, canEdit, onAccept, onDecline, onEdit, time, isMe, isAccepting, isDeclining
}: OfferCardProps) {
  const isSwap = type === 'swap';
  const disabled = isAccepting || isDeclining;
  const cashTopUp = Number(topUp ?? 0);

  return (
    <View className="px-4 mb-1">
      <View className="bg-white rounded-2xl p-5 w-full" style={CARD_SHADOW}>
        <View className="flex-row items-center mb-3">
          <View className="bg-blue-50 rounded-xl px-2.5 py-1 flex-row items-center">
            <Ionicons name={isSwap ? 'swap-horizontal-outline' : 'pricetag-outline'} size={12} color="#2563EB" />
            <Text className="text-blue-600 text-xs font-semibold ml-1">{isSwap ? 'Swap Offer' : 'Buy Offer'}</Text>
          </View>
        </View>

        <View className="flex-row w-full h-48 rounded-xl overflow-hidden mb-3">
          <View 
            className="flex-1 items-center justify-center" 
            style={{ backgroundColor: '#EFF6FF' }}
          >
            {listing?.imageUrl ? (
              <Image source={{ uri: listing.imageUrl }} className="w-full h-full" />
            ) : (
              <Ionicons name="footsteps-outline" size={28} color="#9CA3AF" />
            )}
          </View>

          {swapItem && (
            <View 
              className="flex-1 items-center justify-center border-l-4 border-white" 
              style={{ backgroundColor: '#EFF6FF' }}
            >
              {swapItem.imageUrl ? (
                <Image source={{ uri: swapItem.imageUrl }} className="w-full h-full" />
              ) : (
                <Ionicons name="footsteps-outline" size={28} color="#9CA3AF" />
              )}
            </View>
          )}
        </View>

        {isSwap ? (
          <View>
            {/* 3-Column Layout: Listing <-> Icon <-> Swap Item */}
            <View className="flex-row items-center justify-between mb-3 gap-2">
              
              {/* Left Column: Your Listing */}
              <View className="flex-1 items-start">
                <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
                  {listing?.model ?? 'Your Listing'}
                </Text>
                <Text className="text-gray-400 text-xs">
                  Size {listing?.size ?? '—'}
                </Text>
              </View>

              {/* Middle: Swap Icon Indicator */}
              <View className="px-1">
                <Ionicons name="swap-horizontal" size={20} color="#9CA3AF" />
              </View>

              {/* Right Column: Offered Swap Item */}
              <View className="flex-1 items-end">
                <Text className="text-gray-900 font-semibold text-sm text-right" numberOfLines={1}>
                  {swapItem?.model ?? 'Offered Item'}
                </Text>
                <Text className="text-gray-400 text-xs text-right">
                  Size {swapItem?.size ?? '—'}
                </Text>
              </View>
              
            </View>

            {/* Cash Top-Up Section (Unchanged) */}
            <View className="bg-violet-50 rounded-xl px-3 py-2.5 mb-3 flex-row items-center justify-center w-full border border-violet-100">
              <Ionicons name="cash-outline" size={16} color="#7C3AED" />
              <Text className="text-violet-700 text-xs font-semibold ml-1.5">
                Cash top-up: ₱{cashTopUp.toLocaleString()}
              </Text>
            </View>
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
                haptic="press"
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
                haptic="press"
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

        {canEdit && (
          <GuardedTouchableOpacity
            className="flex-row items-center justify-center py-2 mt-2 gap-1"
            activeOpacity={0.7}
            onPress={onEdit}
            disabled={disabled}
          >
            <Ionicons name="create-outline" size={15} color="#2563EB" />
            <Text className="text-blue-600 font-semibold text-sm">Edit offer</Text>
          </GuardedTouchableOpacity>
        )}
      </View>
      <Text className={`text-gray-300 text-xs mt-1 ${isMe ? 'mr-1' : 'ml-1'}`}>{time}</Text>
    </View>
  );
}
