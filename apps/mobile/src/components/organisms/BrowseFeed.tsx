import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import ListingCard, { Listing } from '@/components/molecules/ListingCard';

// Mock data 
//can include original price field
const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    name: 'Air Globe Runner',
    brand: 'Nike',
    price: 4800,
    condition: 'Like New',
    imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.-dBgPxjSbhIMZPx2aJjIlgHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    aiScore: 94,
    badgeType: 'Swap',
    seller: { name: 'juandelacruz', rating: 4.8 },
  },
  {
    id: '2',
    name: 'Adidas M4',
    brand: 'Adidas',
    price: 3200,
    condition: 'Good',
    imageUrl: 'https://i.ytimg.com/vi/gixjbuochvE/maxresdefault.jpg',
    aiScore: 87,
    badgeType: 'Swap',
    seller: { name: 'Richmondz', rating: 4.5 },
  },
  {
    id: '3',
    name: 'Hoops Classic Hi',
    brand: 'Nike',
    price: 2900,
    condition: 'New',
    imageUrl: 'https://i.ytimg.com/vi/gixjbuochvE/maxresdefault.jpg',
    aiScore: 91,
    badgeType: 'Sale',
    seller: { name: 'EjaySneakrz', rating: 4.9 },
  },
  {
    id: '4',
    name: 'Pisco Run Lite',
    brand: 'Puma',
    price: 1800,
    condition: 'Fair',
    imageUrl: 'https://i.ytimg.com/vi/gixjbuochvE/maxresdefault.jpg',
    aiScore: 78,
    badgeType: 'Sale',
    seller: { name: 'JanGPT', rating: 4.2 },
  },
];

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
            onPress={onListingPress}
            onSave={onSaveListing}
          />
        ))}
      </ScrollView>
    </View>
  );
}
