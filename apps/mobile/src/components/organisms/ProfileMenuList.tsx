import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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

/* ── My Listings ── */
function MyListingsCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mx-5 mb-3 p-4"
      style={CARD_SHADOW}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <CardHeader icon="cube-outline" title="My listings" onPress={onPress} />

      <View className="flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-green-400 mr-1.5" />
        <Text className="text-gray-500 text-xs">0 active</Text>
        <Text className="text-gray-300 mx-2">·</Text>
        <Text className="text-amber-500 text-xs">0 pending review</Text>
      </View>
    </TouchableOpacity>
  );
}

/* ── Saved Items ── */
function SavedItemsCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mx-5 mb-3 p-4"
      style={CARD_SHADOW}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <CardHeader icon="heart-outline" title="Favourites" onPress={onPress} />

      <Text className="text-gray-400 text-xs">
        <Text className="text-gray-700 font-semibold">0 sneakers</Text> saved across all brands
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
    { label: 'Profile views', value: '0' },
    { label: 'Watchers',      value: '0' },
    { label: 'Saves',         value: '0' },
  ];

  return (
    <View className="bg-white rounded-2xl mx-5 mb-3 p-4" style={CARD_SHADOW}>
      <CardHeader icon="bar-chart-outline" title="Seller analytics" />

      <View className="flex-row gap-2">
        {metrics.map((m) => (
          <View key={m.label} className="flex-1 bg-gray-50 rounded-xl p-3">
            <Text className="text-gray-900 font-bold text-base">{m.value}</Text>
            <Text className="text-gray-400 text-xs mt-0.5">{m.label}</Text>
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
