import { View, Text, TouchableOpacity } from 'react-native';
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
      <View className="flex-row items-center justify-between px-5 mb-3">
        <View>
          <Text className="text-gray-900 font-bold text-base">Trending now</Text>
          <Text className="text-gray-400 text-xs mt-0.5">Hot listings expiring soon</Text>
        </View>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text className="text-blue-600 text-sm font-medium">View all</Text>
        </TouchableOpacity>
      </View>

      {/* 2-column vertical grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14 }}>
        {MOCK_LISTINGS.map((listing) => (
          <View key={listing.id} style={{ width: '50%', padding: 5 }}>
            <ListingCard listing={listing} onSave={onSaveListing} />
          </View>
        ))}
      </View>
    </View>
  );
}
