import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ListingService } from '@/features/listing/services/listing.service';

export interface Listing {
  id: string;
  model: string;
  brand: string;
  price: number;
  originalPrice?: number;
  condition: 'Like New' | 'Excellent' | 'Good' | 'Fair' | 'Poor';
  imageUrl?: string;
  imageUrlTop: string;
  imageUrlSide: string;
  imageUrlSole: string;
  imageUrlInsole: string;
  conditionScore: number;
  listingMode?: 'Swap' | 'Sale' | 'Both' | 'Hot' | 'Flash Deal';
  description?: string;
  size?: string;
  colorway?: string;
  sold?: string;
  freeShipping?: boolean;
  swapFor?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  daysLeft?: number;
  isAvailable?: boolean;
  seller: {
    id?: string;
    name: string;
    rating?: number;
    image?: string;
    totalSales?: number;
    verified?: boolean;
    avatarColor?: string;
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

const CONDITION_COLORS: Record<Listing['condition'], string> = {
  'Like New': '#10B981',
  'Excellent': '#3B82F6',
  'Good':     '#F59E0B',
  'Fair':     '#9CA3AF',
  'Poor':     '#EF4444',
};

export default function ListingCard({ listing, onSave, isSaved, currentUserId }: ListingCardProps) {
  // Only handle Swap and Sale on the browse card, fallback gracefully if Hot is passed
  const badge = listing.listingMode && listing.listingMode !== 'Hot' ? BADGE_STYLES[listing.listingMode] : null;
  const conditionColor = CONDITION_COLORS[listing.condition];
  const isOwnListing = !!currentUserId && listing.seller.id === currentUserId;
  const daysLeft = listing.daysLeft ?? (listing.createdAt ? ListingService.getDaysLeft(listing.createdAt) : undefined);

  const handlePress = () => {
    router.push({
      pathname: '/listing/[id]',
      params: { id: listing.id },
    });
  };

  return (
    <TouchableOpacity
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
              {listing.listingMode}
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

        {/* Save button */}
        {!isOwnListing && (
          <TouchableOpacity
            className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white items-center justify-center"
            style={{ shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 }}
            onPress={(e) => { e.stopPropagation(); onSave?.(listing); }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={14}
              color={isSaved ? '#EF4444' : '#6B7280'}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Info area */}
      <View className="p-3">
        {/* Brand + condition */}
        <View className="flex-row items-center justify-between mb-0.5">
          <Text className="text-xs text-gray-400 font-medium">{listing.brand}</Text>
          <View className="flex-row items-center">
            <View
              className="w-1.5 h-1.5 rounded-full mr-1"
              style={{ backgroundColor: conditionColor }}
            />
            <Text className="text-xs" style={{ color: conditionColor }}>
              {listing.condition}
            </Text>
          </View>
        </View>

        {/* Name */}
        <Text className="text-gray-900 font-semibold text-sm leading-tight mb-2" numberOfLines={2}>
          {listing.model}
        </Text>

        {listing.listingMode === 'Swap' ? (
          /* ── Swap footer ── */
          <View className="pt-2 border-t border-gray-100">
            <Text className="text-gray-400 text-xs mb-1">Looking to swap for</Text>
            <Text className="text-gray-800 font-semibold text-xs mb-3" numberOfLines={2}>
              {listing.swapFor ?? 'Open to offers'}
            </Text>
            {isOwnListing ? (
              <View
                className="flex-row items-center justify-center rounded-xl py-2"
                style={{ backgroundColor: '#F3F4F6' }}
              >
                <Ionicons name="person-outline" size={13} color="#6B7280" />
                <Text style={{ color: '#6B7280', fontSize: 12, fontWeight: '700', marginLeft: 5 }}>
                  This is your listing
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                className="flex-row items-center justify-center rounded-xl py-2"
                style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }}
                activeOpacity={0.75}
                onPress={(e) => { e.stopPropagation(); }}
              >
                <Ionicons name="swap-horizontal" size={13} color="#2563EB" />
                <Text style={{ color: '#2563EB', fontSize: 12, fontWeight: '700', marginLeft: 5 }}>
                  Propose Swap
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* ── Sale/Flash footer ── */
          <>
            <View className="flex-row items-center mb-2">
              <Text className="text-blue-600 font-bold text-base">
                ₱{listing.price.toLocaleString()}
              </Text>
              {listing.originalPrice && (
                <Text className="text-gray-400 text-xs line-through ml-2">
                  ₱{listing.originalPrice.toLocaleString()}
                </Text>
              )}
            </View>

            <View className="flex-row items-center mb-3">
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
                  <>
                    <Ionicons name="star" size={10} color="#F59E0B" />
                    <Text className="text-gray-500 text-xs ml-0.5">
                      {listing.seller.rating?.toFixed(1) || 0}
                    </Text>
                  </>
                )}
              </View>
            </View>

            {isOwnListing ? (
              <View
                className="flex-row items-center justify-center rounded-xl py-2 border-t border-gray-100 pt-2"
                style={{ backgroundColor: '#F3F4F6' }}
              >
                <Ionicons name="person-outline" size={13} color="#6B7280" />
                <Text style={{ color: '#6B7280', fontSize: 12, fontWeight: '700', marginLeft: 5 }}>
                  This is your listing
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                className="flex-row items-center justify-center rounded-xl py-2 border-t border-gray-100 pt-2"
                style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }}
                activeOpacity={0.75}
                onPress={(e) => { e.stopPropagation(); }}
              >
                <Ionicons name="bag-handle-outline" size={13} color="#2563EB" />
                <Text style={{ color: '#2563EB', fontSize: 12, fontWeight: '700', marginLeft: 5 }}>
                  Buy Now
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}