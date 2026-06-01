import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Listing } from '@/components/molecules/ListingCard';
import { MOCK_LISTINGS } from '@/data/MockListings';


export const CONDITION_COLORS: Record<Listing['condition'], string> = {
  'New':      '#10B981',
  'Like New': '#3B82F6',
  'Good':     '#F59E0B',
  'Fair':     '#9CA3AF',
};

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  // Find listing by id — swap with API call later
  const listing = MOCK_LISTINGS.find((l) => l.id === id);

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
          {/* Brand + badges row */}
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-gray-400 text-sm font-medium">{listing.brand}</Text>
            <View className="flex-row items-center gap-2">
              {/* AI Score */}
              <View
                className="flex-row items-center rounded-full px-2.5 py-1"
                style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}
              >
                <Ionicons name="sparkles" size={11} color="#F59E0B" />
                <Text className="text-gray-700 text-xs font-semibold ml-1">
                  {listing.aiScore}%
                </Text>
              </View>
              {/* Condition */}
              <View
                className="flex-row items-center rounded-full px-2.5 py-1"
                style={{ backgroundColor: conditionColor + '18' }}
              >
                <View
                  className="w-1.5 h-1.5 rounded-full mr-1.5"
                  style={{ backgroundColor: conditionColor }}
                />
                <Text className="text-xs font-semibold" style={{ color: conditionColor }}>
                  {listing.condition}
                </Text>
              </View>
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
            {/* Avatar */}
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: (listing.seller.avatarColor ?? '#2563EB') + '20' }}
            >
              <Text
                className="text-lg font-bold"
                style={{ color: listing.seller.avatarColor ?? '#2563EB' }}
              >
                {listing.seller.name[0].toUpperCase()}
              </Text>
            </View>

            {/* Info */}
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-gray-900 font-semibold text-sm mr-1">
                  @{listing.seller.name}
                </Text>
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
          <Text className="text-gray-600 text-sm leading-relaxed">
            {listing.description ?? 'No description provided.'}
          </Text>
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
          // Swap listing — show Buy Now + Swap Offer
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-gray-100 rounded-2xl py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 font-bold text-base">Buy Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-600 rounded-2xl py-4 items-center flex-row justify-center"
              activeOpacity={0.85}
              onPress={handleSwap}
              style={{
                shadowColor: '#2563EB',
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
          // Non-swap listing — show Buy Now + Make Offer
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-gray-100 rounded-2xl py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 font-bold text-base">Make Offer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-600 rounded-2xl py-4 items-center"
              activeOpacity={0.85}
              style={{
                shadowColor: '#2563EB',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text className="text-white font-bold text-base">Buy Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
