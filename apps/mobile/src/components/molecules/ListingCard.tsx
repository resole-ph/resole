import { View, Text, Image } from 'react-native';
import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ListingService } from '@/features/listing/services/listing.service';
import { useSellStore } from '@/store/sell';
import { usePreferencesStore } from '@/store/preferences';
import { formatSize } from '@/features/shoe/utils/size-conversion';
import { CONDITION_COLORS } from '@/features/sell/utils/condition';
import type { ConditionLabel } from '@/features/sell/types/sell.types';

export interface Listing {
  id: string;
  model: string;
  brand: string;
  price: number;
  originalPrice?: number;
  condition: ConditionLabel;
  imageUrl?: string;
  imageUrlLeftSide: string;
  imageUrlRightSide: string;
  imageUrlTop: string;
  imageUrlSole: string;
  imageUrlInsoleLeft: string;
  imageUrlInsoleRight: string;
  conditionScore: number;
  listingMode?: 'Swap' | 'Sale' | 'Both' | 'Hot' | 'Flash Deal';
  description?: string;
  size?: string;
  category?: string;
  year?: string | number;
  colorway?: string;
  sold?: string;
  freeShipping?: boolean;
  swapFor?: string;
  createdAt: Date;
  updatedAt: Date;
  daysLeft?: number;
  isAvailable: boolean;
  archivedAt?: string | null;
  seller: {
    id?: string;
    name: string;
    rating?: number;
    image?: string;
    totalSales?: number;
    verified?: boolean;
    avatarColor?: string;
    /** Seller's city (falls back to address). Null when they haven't set one. */
    location?: string | null;
  };
}

interface ListingCardProps {
  listing: Listing;
  onSave?: (listing: Listing) => void;
  isSaved?: boolean;
  currentUserId?: string;
}

const BADGE_STYLES: Record<
  NonNullable<Exclude<Listing['listingMode'], 'Hot'>>,
  { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  Swap: { bg: '#2563EB', text: '#fff', icon: 'swap-horizontal' },
  Sale: { bg: '#10B981', text: '#fff', icon: 'pricetag' },
  Both: { bg: '#8B5CF6', text: '#fff', icon: 'swap-horizontal' },
  'Flash Deal': { bg: '#F59E0B', text: '#fff', icon: 'flash' },
};

export default function ListingCard({ listing, onSave, isSaved, currentUserId }: ListingCardProps) {
  // Only handle Swap and Sale on the browse card, fallback gracefully if Hot is passed
  const badge = listing.listingMode && listing.listingMode !== 'Hot' ? BADGE_STYLES[listing.listingMode] : null;
  const conditionColor = CONDITION_COLORS[listing.condition];
  const isOwnListing = !!currentUserId && listing.seller.id === currentUserId;
  const daysLeft = listing.daysLeft ?? (listing.createdAt ? ListingService.getDaysLeft(listing.createdAt) : undefined);
  const resetSell = useSellStore((s) => s.reset);
  const sizeSystem = usePreferencesStore((s) => s.sizeSystem);
  const sizeLabel = listing.size ? formatSize(Number(listing.size), sizeSystem) : null;

  const handlePress = () => {
    router.push({
      pathname: '/listing/[id]',
      params: { id: listing.id, view: +!isOwnListing },
    });
  };

  const handleEdit = () => {
    resetSell();
    router.push({ pathname: '/profile/edit-listing', params: { id: listing.id } });
  };

  return (
    <GuardedTouchableOpacity
      className="bg-white rounded-2xl overflow-hidden flex-1"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
      activeOpacity={0.92}
      onPress={handlePress}
    >
      {/* Image area */}
      <View className="relative">
        <Image
          source={{ uri: listing.imageUrl }}
          className="w-full"
          style={{ height: 148, backgroundColor: '#F3F4F6' }}
          resizeMode="cover"
        />

        {/* Days left badge */}
        {daysLeft !== undefined && (
          <View
            className="absolute top-2 left-2 flex-row items-center rounded-full px-2 py-1"
            style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
          >
            <View
              className="w-1.5 h-1.5 rounded-full mr-1"
              style={{ backgroundColor: daysLeft <= 3 ? '#EF4444' : '#10B981' }}
            />
            <Text style={{ color: '#374151', fontSize: 9, fontWeight: '700' }}>{daysLeft}d left</Text>
          </View>
        )}

        {/* Type badge */}
        {badge && (
          <View
            className="absolute top-2 right-2 flex-row items-center rounded-full px-2 py-1"
            style={{ backgroundColor: badge.bg }}
          >
            <Ionicons name={badge.icon} size={10} color={badge.text} />
            <Text style={{ color: badge.text }} className="text-xs font-semibold ml-1">
              {listing.listingMode === 'Both' ? 'Swap & Sell' : listing.listingMode}
            </Text>
          </View>
        )}

        {/* Free shipping badge */}
        {listing.freeShipping && (
          <View
            className="absolute bottom-2 left-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: '#D1FAE5' }}
          >
            <Text style={{ color: '#059669', fontSize: 9, fontWeight: '600' }}>Free Ship</Text>
          </View>
        )}

        {/* Size badge */}
        {sizeLabel && (
          <View
            className={`absolute bottom-2 ${listing.freeShipping ? 'left-20' : 'left-2'}`}
            style={{ backgroundColor: 'rgba(17,24,39,0.85)', borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 }}
          >
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>Size {sizeLabel}</Text>
          </View>
        )}

        {/* Save button */}
        {!isOwnListing && (
          <GuardedTouchableOpacity
            className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white items-center justify-center"
            style={{ shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 }}
            onPress={(e) => { e.persist(); e.stopPropagation(); onSave?.(listing); }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={14}
              color={isSaved ? '#EF4444' : '#6B7280'}
            />
          </GuardedTouchableOpacity>
        )}
      </View>

      {/* Info area */}
      <View className="p-3">
        {/*
          Brand. Size is not repeated here — it already has a badge on the image.
        */}
        <Text className="text-xs text-gray-400 font-medium mb-0.5" numberOfLines={1}>
          {listing.brand}
        </Text>

        {/* Name */}
        <Text className="text-gray-900 font-semibold text-sm leading-tight mb-1" numberOfLines={2}>
          {listing.model}
        </Text>

        {/*
          Condition sits under the name rather than beside the brand: it gets a
          full line, so "Like New condition" is never clipped on narrow Android
          screens, and it reads as a fact about the shoe just named. It carries
          its own colour and no marker — the dot was purely decorative.
        */}
        <Text
          className="text-xs font-semibold mb-2"
          style={{ color: conditionColor }}
          numberOfLines={1}
        >
          {listing.condition} Condition
        </Text>

        {/*
          Where the seller is. Sits above the footer split so swap cards — which
          have no seller row at all — carry it too, and so buyers can rule a pair
          out on distance without opening it. Hidden when the seller has no city
          rather than shown as a placeholder.
        */}
        {listing.seller.location && (
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-outline" size={11} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs ml-1 flex-1" numberOfLines={1}>
              {listing.seller.location}
            </Text>
          </View>
        )}

        {listing.listingMode === 'Swap' ? (
          /* ── Swap footer ── */
          <View className="pt-2 border-t border-gray-100">
            <Text className="text-gray-400 text-xs mb-1">Looking to swap for</Text>
            <Text className="text-gray-800 font-semibold text-xs mb-3" numberOfLines={2}>
              {listing.swapFor ?? 'Open to offers'}
            </Text>
            {isOwnListing ? (
              <GuardedTouchableOpacity
                className="flex-row items-center justify-center rounded-xl py-2"
                style={{ backgroundColor: '#F3F4F6' }}
                activeOpacity={0.75}
                onPress={handleEdit}
              >
                <Ionicons name="create-outline" size={13} color="#6B7280" />
                <Text style={{ color: '#6B7280', fontSize: 12, fontWeight: '700', marginLeft: 5 }}>
                  Edit Listing
                </Text>
              </GuardedTouchableOpacity>
            ) : (
              <GuardedTouchableOpacity
                className="flex-row items-center justify-center rounded-xl py-2"
                style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }}
                activeOpacity={0.75}
                onPress={(e) => {
                  e.persist();
                  e.stopPropagation();
                  router.push({ pathname: '/listing/[id]', params: { id: listing.id, action: 'swap' } });
                }}
              >
                <Ionicons name="swap-horizontal" size={13} color="#2563EB" />
                <Text style={{ color: '#2563EB', fontSize: 12, fontWeight: '700', marginLeft: 5 }}>
                  Propose Swap
                </Text>
              </GuardedTouchableOpacity>
            )}
          </View>
        ) : (
          /* ── Sale/Flash footer ── */
          <>
            <View className="flex-row items-center mb-2">
              <Text className="text-blue-600 font-bold text-base">
                ₱{listing.price.toLocaleString()}
              </Text>
              {/*
                Retail price of a NEW pair, from the scraped catalog — not a former
                asking price, so it is labelled rather than struck through.
              */}
              {listing.originalPrice && (
                <Text className="text-gray-400 text-xs ml-2">
                  Retail ₱{listing.originalPrice.toLocaleString()}
                </Text>
              )}
            </View>

            <GuardedTouchableOpacity
              className="flex-row items-center mb-3"
              activeOpacity={isOwnListing || !listing.seller.id ? 1 : 0.7}
              disabled={isOwnListing || !listing.seller.id}
              onPress={(e) => {
                e.persist();
                e.stopPropagation();
                router.push(`/profile/${listing.seller.id}` as any);
              }}
            >
              <View className="w-5 h-5 rounded-full bg-blue-100 items-center justify-center mr-1.5">
                <Text className="text-blue-600 text-xs font-bold">
                  {listing.seller.name[0].toUpperCase()}
                </Text>
              </View>
              <Text className="text-gray-500 text-xs flex-1" numberOfLines={1}>
                {listing.seller.name}
              </Text>
              <View className="flex-row items-center">
                {listing.sold ? (
                  <Text className="text-gray-400 text-xs">Sold {listing.sold}</Text>
                ) : (
                  /* Omitted for sellers with no ratings — a bare 0 reads as a bad score. */
                  listing.seller.rating != null && (
                    <>
                      <Ionicons name="star" size={10} color="#F59E0B" />
                      <Text className="text-gray-500 text-xs ml-0.5">
                        {listing.seller.rating.toFixed(1)}
                      </Text>
                    </>
                  )
                )}
              </View>
            </GuardedTouchableOpacity>

            {isOwnListing ? (
              <GuardedTouchableOpacity
                className="flex-row items-center justify-center rounded-xl py-2 border-t border-gray-100 pt-2"
                style={{ backgroundColor: '#F3F4F6' }}
                activeOpacity={0.75}
                onPress={handleEdit}
              >
                <Ionicons name="create-outline" size={13} color="#6B7280" />
                <Text style={{ color: '#6B7280', fontSize: 12, fontWeight: '700', marginLeft: 5 }}>
                  Edit Listing
                </Text>
              </GuardedTouchableOpacity>
            ) : (
              <GuardedTouchableOpacity
                className="flex-row items-center justify-center rounded-xl py-2 border-t border-gray-100 pt-2"
                style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }}
                activeOpacity={0.75}
                onPress={(e) => {
                  e.persist();
                  e.stopPropagation();
                  router.push({ pathname: '/listing/[id]', params: { id: listing.id, action: 'offer' } });
                }}
              >
                <Ionicons name="pricetag-outline" size={13} color="#2563EB" />
                <Text style={{ color: '#2563EB', fontSize: 12, fontWeight: '700', marginLeft: 5 }}>
                  Make Offer
                </Text>
              </GuardedTouchableOpacity>
            )}
          </>
        )}
      </View>
    </GuardedTouchableOpacity>
  );
}
