import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { UserService } from '@/features/user/services/user.service';
import { ListingService } from '@/features/listing/services/listing.service';
import { ListingSummary, FavouritesSummary } from '@/features/user/types/user.types';
import { Listing } from '@/components/molecules/ListingCard';
import { FavItem } from '@/features/listing/types/listing.types';

const PREVIEW_COUNT = 3;

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};

function CardHeader({
  icon,
  title,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity className="flex-row items-center mb-3" activeOpacity={0.6} onPress={onPress}>
      <View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center mr-3">
        <Ionicons name={icon} size={18} color="#2563EB" />
      </View>
      <Text className="flex-1 text-gray-900 font-semibold text-sm">{title}</Text>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

function PreviewThumb({ uri }: { uri?: string }) {
  return (
    <View className="flex-1 h-20 rounded-xl items-center justify-center bg-gray-100 overflow-hidden">
      {uri ? (
        <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
      ) : (
        <Ionicons name="image-outline" size={20} color="#9CA3AF" />
      )}
    </View>
  );
}

/* ── My Listings ── */
function MyListingsCard({ onPress }: { onPress: () => void }) {
  const [summary, setSummary] = useState<ListingSummary | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    UserService.getListingSummary()
      .then(setSummary)
      .catch((error) => console.error('Failed to load listing summary:', error));

    ListingService.getUserListings()
      .then((data) => setListings(data ?? []))
      .catch((error) => console.error('Failed to load listings:', error));
  }, []);

  const activeListings = listings.filter((item) => item.isAvailable !== false);
  const previews = activeListings.slice(0, PREVIEW_COUNT);
  const remaining = Math.max((summary?.active ?? activeListings.length) - previews.length, 0);

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mx-5 mb-3 p-4"
      style={CARD_SHADOW}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <CardHeader icon="cube-outline" title="My listings" onPress={onPress} />

      <View className="flex-row gap-2 mb-3">
        {previews.map((item) => (
          <PreviewThumb key={item.id} uri={item.imageUrl} />
        ))}
        {remaining > 0 && (
          <View className="w-16 h-20 rounded-xl bg-gray-100 items-center justify-center">
            <Text className="text-gray-500 font-bold text-sm">+{remaining}</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-green-400 mr-1.5" />
        <Text className="text-gray-500 text-xs">{summary?.active ?? 0} active</Text>
        <Text className="text-gray-300 mx-2">·</Text>
        <Text className="text-amber-500 text-xs">{summary?.unavailable ?? 0} unavailable</Text>
      </View>
    </TouchableOpacity>
  );
}

/* ── Saved Items ── */
function SavedItemsCard({ onPress }: { onPress: () => void }) {
  const [favourites, setFavourites] = useState<FavouritesSummary | null>(null);
  const [items, setItems] = useState<FavItem[]>([]);

  useEffect(() => {
    UserService.getFavouritesSummary()
      .then(setFavourites)
      .catch((error) => console.error('Failed to load favourites summary:', error));

    ListingService.getUserFavourites()
      .then((data) => setItems(data ?? []))
      .catch((error) => console.error('Failed to load favourites:', error));
  }, []);

  const previews = items.slice(0, 4);

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mx-5 mb-3 p-4"
      style={CARD_SHADOW}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <CardHeader icon="heart-outline" title="Favourites" onPress={onPress} />

      <View className="flex-row gap-2 mb-3">
        {previews.map((item) => (
          <PreviewThumb key={item.id} uri={item.imageUrl} />
        ))}
      </View>

      <Text className="text-gray-400 text-xs">
        <Text className="text-gray-700 font-semibold">{favourites?.totalCount ?? 0} sneakers</Text> saved across all brands
      </Text>
    </TouchableOpacity>
  );
}

/* ── Quick Links ── */
function QuickLink({
  icon,
  label,
  sub,
  badge,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center py-3.5 border-b border-gray-50"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center mr-3">
        <Ionicons name={icon} size={18} color="#2563EB" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-sm">{label}</Text>
        <Text className="text-gray-400 text-xs mt-0.5">{sub}</Text>
      </View>
      {badge && (
        <View className="bg-blue-600 rounded-full px-2 py-0.5 mr-2">
          <Text className="text-white text-xs font-bold">{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

function QuickLinksCard({ onTransactions }: { onTransactions: () => void }) {
  return (
    <View className="bg-white rounded-2xl mx-5 mb-3 px-4" style={CARD_SHADOW}>
      <QuickLink
        icon="receipt-outline"
        label="Transactions"
        sub="Sales, swaps, donations"
        onPress={onTransactions}
      />
    </View>
  );
}

/* ── Seller Analytics ── */
function SellerAnalyticsCard() {
  const metrics = [
    { label: 'Profile views', value: '1,240', delta: '+18%', up: true },
    { label: 'Watchers',      value: '84',    delta: '+5%',  up: true },
    { label: 'Saves',         value: '31',    delta: '-2%',  up: false },
  ];

  return (
    <View className="bg-white rounded-2xl mx-5 mb-3 p-4" style={CARD_SHADOW}>
      <CardHeader icon="bar-chart-outline" title="Seller analytics" />

      <View className="flex-row gap-2">
        {metrics.map((m) => (
          <View key={m.label} className="flex-1 bg-gray-50 rounded-xl p-3">
            <Text className="text-gray-900 font-bold text-base">{m.value}</Text>
            <Text className="text-gray-400 text-xs mt-0.5 mb-1.5">{m.label}</Text>
            <View className="flex-row items-center">
              <Ionicons
                name={m.up ? 'trending-up' : 'trending-down'}
                size={12}
                color={m.up ? '#10B981' : '#EF4444'}
              />
              <Text
                className={`text-xs font-semibold ml-0.5 ${
                  m.up ? 'text-green-500' : 'text-red-400'
                }`}
              >
                {m.delta}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text className="text-gray-400 text-xs mt-3">Compared to last 7 days</Text>
    </View>
  );
}

/* ── Composed list ── */
export default function ProfileMenuList() {
  const router = useRouter();

  return (
    <View>
      <MyListingsCard onPress={() => router.push('/profile/listings')} />
      <SavedItemsCard onPress={() => router.push('/profile/favourites')} />
      <QuickLinksCard
        onTransactions={() => router.push('/profile/transactions')}
      />
      <SellerAnalyticsCard />
    </View>
  );
}
