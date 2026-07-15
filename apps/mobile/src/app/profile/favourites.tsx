import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SubScreenHeader from '@/components/organisms/SubScreenHeader';
import { ListingService } from '@/features/listing/services/listing.service';
import { FavItem } from '@/features/listing/types/listing.types';
import { usePreferencesStore } from '@/store/preferences';
import { formatSize } from '@/features/shoe/utils/size-conversion';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};

// const INITIAL_FAVOURITES: FavItem[] = [
//   { id: '1', name: 'Jordan 4 Retro', brand: 'Nike', size: 'US 10', price: '₱24,000', color: '#DBEAFE', saved: true },
//   { id: '2', name: 'Yeezy Boost 350', brand: 'Adidas', size: 'US 9', price: '₱15,500', color: '#EDE9FE', saved: true },
//   { id: '3', name: 'Air Force 1 Low', brand: 'Nike', size: 'US 10.5', price: '₱5,200', color: '#FCE7F3', saved: true },
//   { id: '4', name: 'Samba OG', brand: 'Adidas', size: 'US 9.5', price: '₱7,800', color: '#D1FAE5', saved: true },
//   { id: '5', name: 'Panda Dunk Low', brand: 'Nike', size: 'US 9', price: '₱12,000', color: '#FEF3C7', saved: true },
//   { id: '6', name: 'New Balance 327', brand: 'New Balance', size: 'US 10', price: '₱4,500', color: '#FEE2E2', saved: true },
//   { id: '7', name: 'Converse Run Star', brand: 'Converse', size: 'US 8', price: '₱3,200', color: '#E0E7FF', saved: true },
//   { id: '8', name: 'Gel-Kayano 14', brand: 'Asics', size: 'US 9.5', price: '₱8,500', color: '#F0FDF4', saved: true },
// ];

function daysAgo(date: Date | string): number {
  const elapsed = Date.now() - new Date(date).getTime();
  return Math.max(Math.floor(elapsed / (1000 * 60 * 60 * 24)), 0);
}

function FavCard({ item, onToggle }: { item: FavItem; onToggle: (id: number) => void }) {
  const sizeSystem = usePreferencesStore((s) => s.sizeSystem);
  return (
    <View className="bg-white rounded-2xl p-3 mb-3 flex-1" style={CARD_SHADOW}>
      {/* Image area */}
      <View
        className="w-full rounded-xl mb-2 items-center justify-center overflow-hidden"
        style={{ backgroundColor: item.colorway, height: 96 }}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Ionicons name="footsteps-outline" size={28} color="#9CA3AF" />
        )}
      </View>

      {/* Heart button */}
      <TouchableOpacity
        className="absolute top-5 right-5 w-7 h-7 rounded-full bg-white items-center justify-center"
        activeOpacity={0.7}
        onPress={() => onToggle(item.id)}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Ionicons
          name={item.saved ? 'heart' : 'heart-outline'}
          size={14}
          color={item.saved ? '#EF4444' : '#9CA3AF'}
        />
      </TouchableOpacity>

      <Text className="text-gray-400 text-xs font-medium" numberOfLines={1}>
        {item.brand}
      </Text>
      <Text className="text-gray-900 font-semibold text-sm mt-0.5" numberOfLines={1}>
        {item.model}
      </Text>
      <Text className="text-gray-400 text-xs mt-0.5">
        Size: {item.size ? formatSize(Number(item.size), sizeSystem) : '—'}
      </Text>
      <Text className="text-blue-600 font-bold text-sm mt-1">
        Price: ₱{Number(item.price ?? 0).toLocaleString()}
      </Text>
      <View className="flex-row items-center mt-1">
        <View className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1" />
        <Text className="text-gray-400 text-xs">Saved {daysAgo(item.savedAt)}d ago</Text>
      </View>
    </View>
  );
}

export default function FavouritesScreen() {
  const [items, setItems] = useState<FavItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const fetchedListing = await ListingService.getUserFavourites();
      setItems(fetchedListing);
    };

    loadData();
  }, []);

  const saved = items.filter((i) => i.saved);

  const handleToggle = async (id: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, saved: !i.saved } : i)));
    try {
      await ListingService.unfavoriteListing(item.listingId);
    } catch (error) {
      console.error('Failed to unfavorite listing:', error);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, saved: !i.saved } : i)));
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SubScreenHeader title="Favourites" />

      <Text className="text-gray-400 text-xs px-5 mb-4">
        {saved.length} sneaker{saved.length !== 1 ? 's' : ''} saved
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {saved.length === 0 ? (
          <View className="items-center py-20">
            <Ionicons name="heart-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 text-sm mt-3">No saved items yet</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap px-5 gap-3">
            {saved.map((item) => (
              <View key={item.id} style={{ width: '47%' }}>
                <FavCard item={item} onToggle={handleToggle} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
