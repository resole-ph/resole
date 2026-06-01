import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import ListingCard, { Listing } from '@/components/molecules/ListingCard';
import { MOCK_LISTINGS } from '@/data/MockListings';

interface BrowseFeedProps {
  onListingPress?: (listing: Listing) => void;
  onSavelisting?: (listing: Listing) => void;
  onViewAll?: () => void;
}

export default function BrowseFeed({
  onListingPress,
  onSaveListing,
  onViewAll,
}: BrowseFeedProps & { onSaveListing?: (listing: Listing) => void }) {
  return (
    <View className="mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 mb-1">
        <View>
          <Text className="text-gray-900 font-bold text-base">Trending now</Text>
          <Text className="text-gray-400 text-xs mt-0.5">Hot listings expiring soon</Text>
        </View>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text className="text-blue-600 text-sm font-medium">View all</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal scroll of cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}
      >
        {MOCK_LISTINGS.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onSave={onSaveListing}
          />
        ))}
      </ScrollView>
    </View>
  );
}
