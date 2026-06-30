import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Listing } from '@/components/molecules/ListingCard';
import { MOCK_LISTINGS, MARKET_LISTINGS, SWAP_LISTINGS } from '@/data/MockListings';

const ALL_LISTINGS = [...MOCK_LISTINGS, ...MARKET_LISTINGS, ...SWAP_LISTINGS];

export const CONDITION_COLORS: Record<Listing['condition'], string> = {
  'Like New':  '#10B981',
  'Excellent': '#3B82F6',
  'Good':      '#F59E0B',
  'Fair':      '#9CA3AF',
  'Poor':      '#EF4444',
};

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const listing = ALL_LISTINGS.find((l) => l.id === id);

  if (!listing) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
        <Text className="text-gray-400 mt-3">Listing not found</Text>
        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-blue-600 font-medium">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isSwappable = listing.badgeType === 'Swap';
  const conditionColor = CONDITION_COLORS[listing.condition];

  const similarItems = ALL_LISTINGS.filter(
    (l) => l.id !== listing.id && (l.brand === listing.brand || l.badgeType === listing.badgeType)
  ).slice(0, 6);

  const handleSwap = () => {
    router.push({
      pathname: '/listing/swap-offer',
      params: {
        listingId: listing.id,
        listingName: listing.name,
        listingPrice: listing.price,
        listingImage: listing.imageUrl,
      },
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Back button — floats over image */}
      <TouchableOpacity
        className="absolute z-10 w-10 h-10 rounded-full bg-white items-center justify-center"
        style={{
          top: insets.top + 12,
          left: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
        }}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color="#111827" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Shoe image */}
        <Image
          source={{ uri: listing.imageUrl }}
          style={{ width: '100%', height: 300, backgroundColor: '#F3F4F6' }}
          resizeMode="cover"
        />

        <View className="px-5 pt-5">
          {/* Brand + condition row */}
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-gray-400 text-sm font-medium">{listing.brand}</Text>
            <View
              className="flex-row items-center rounded-full px-2.5 py-1"
              style={{ backgroundColor: conditionColor + '18' }}
            >
              <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: conditionColor }} />
              <Text className="text-xs font-semibold" style={{ color: conditionColor }}>
                {listing.condition}
              </Text>
            </View>
          </View>

          {/* Name */}
          <Text className="text-gray-900 text-2xl font-bold mb-1">{listing.name}</Text>

          {/* Size */}
          {listing.size && (
            <Text className="text-gray-400 text-sm mb-4">Size: {listing.size}</Text>
          )}

          {/* Price */}
          <View className="flex-row items-center mb-6">
            <Text className="text-blue-600 text-3xl font-bold">
              ₱{listing.price.toLocaleString()}
            </Text>
            {listing.originalPrice && (
              <Text className="text-gray-400 text-base line-through ml-3">
                ₱{listing.originalPrice.toLocaleString()}
              </Text>
            )}
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-100 mb-5" />

          {/* Seller */}
          <Text className="text-gray-900 font-bold text-base mb-3">Seller</Text>
          <TouchableOpacity
            className="flex-row items-center bg-white rounded-2xl p-4 mb-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
            activeOpacity={0.8}
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: (listing.seller.avatarColor ?? '#2563EB') + '20' }}
            >
              <Text className="text-lg font-bold" style={{ color: listing.seller.avatarColor ?? '#2563EB' }}>
                {listing.seller.name[0].toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-gray-900 font-semibold text-sm mr-1">@{listing.seller.name}</Text>
                {listing.seller.verified && (
                  <View className="w-4 h-4 rounded-full bg-blue-600 items-center justify-center">
                    <Ionicons name="checkmark" size={9} color="#fff" />
                  </View>
                )}
              </View>
              <View className="flex-row items-center mt-0.5">
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text className="text-gray-500 text-xs ml-1">
                  {listing.seller.rating.toFixed(1)} · {listing.seller.totalSales ?? 0} sales
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Description */}
          <Text className="text-gray-900 font-bold text-base mb-3">Description</Text>
          <Text className="text-gray-600 text-sm leading-relaxed mb-6">
            {listing.description ?? 'No description provided.'}
          </Text>

          {/* Similar items */}
          {similarItems.length > 0 && (
            <>
              <View className="h-px bg-gray-100 mb-5" />
              <Text className="text-gray-900 font-bold text-base mb-3">Similar Items</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {similarItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    style={{ width: 140 }}
                    onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{ width: 140, height: 110, borderRadius: 14, backgroundColor: '#F3F4F6' }}
                      resizeMode="cover"
                    />
                    <Text className="text-gray-400 text-xs mt-2">{item.brand}</Text>
                    <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>{item.name}</Text>
                    <Text className="text-blue-600 font-bold text-sm">₱{item.price.toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>

      {/* Action buttons — fixed at bottom */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4"
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        {isSwappable ? (
          <View className="flex-row gap-3">
            {/* Buy Now — emerald green */}
            <TouchableOpacity
              className="flex-1 rounded-2xl py-4 items-center justify-center flex-row"
              activeOpacity={0.85}
              style={{
                backgroundColor: '#059669',
                shadowColor: '#059669',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons name="bag-handle-outline" size={18} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">Buy Now</Text>
            </TouchableOpacity>
            {/* Swap Offer — violet */}
            <TouchableOpacity
              className="flex-1 rounded-2xl py-4 items-center flex-row justify-center"
              activeOpacity={0.85}
              onPress={handleSwap}
              style={{
                backgroundColor: '#7C3AED',
                shadowColor: '#7C3AED',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons name="swap-horizontal" size={18} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">Swap Offer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row gap-3">
            {/* Make Offer — amber */}
            <TouchableOpacity
              className="flex-1 rounded-2xl py-4 items-center justify-center flex-row"
              activeOpacity={0.85}
              style={{
                backgroundColor: '#D97706',
                shadowColor: '#D97706',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons name="pricetag-outline" size={18} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">Make Offer</Text>
            </TouchableOpacity>
            {/* Buy Now — emerald green */}
            <TouchableOpacity
              className="flex-1 rounded-2xl py-4 items-center justify-center flex-row"
              activeOpacity={0.85}
              style={{
                backgroundColor: '#059669',
                shadowColor: '#059669',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons name="bag-handle-outline" size={18} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">Buy Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
