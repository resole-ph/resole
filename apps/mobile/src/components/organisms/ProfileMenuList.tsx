import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    <View className="flex-row items-center mb-3">
      <View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center mr-3">
        <Ionicons name={icon} size={18} color="#2563EB" />
      </View>
      <Text className="flex-1 text-gray-900 font-semibold text-sm">{title}</Text>
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
      </TouchableOpacity>
    </View>
  );
}

/* ── My Listings ── */
function MyListingsCard() {
  const previews = ['#DBEAFE', '#EDE9FE', '#FCE7F3'];
  return (
    <View className="bg-white rounded-2xl mx-5 mb-3 p-4" style={CARD_SHADOW}>
      <CardHeader icon="cube-outline" title="My listings" />

      {/* Thumbnail previews */}
      <View className="flex-row gap-2 mb-3">
        {previews.map((bg, i) => (
          <View
            key={i}
            className="flex-1 h-20 rounded-xl items-center justify-center"
            style={{ backgroundColor: bg }}
          >
            <Ionicons name="image-outline" size={20} color="#9CA3AF" />
          </View>
        ))}
        {/* Overflow badge */}
        <View className="w-16 h-20 rounded-xl bg-gray-100 items-center justify-center">
          <Text className="text-gray-500 font-bold text-sm">+11</Text>
        </View>
      </View>

      {/* Footer stats */}
      <View className="flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-green-400 mr-1.5" />
        <Text className="text-gray-500 text-xs">14 active</Text>
        <Text className="text-gray-300 mx-2">·</Text>
        <Text className="text-amber-500 text-xs">2 pending review</Text>
      </View>
    </View>
  );
}

/* ── Saved Items ── */
function SavedItemsCard() {
  const colors = ['#FEF3C7', '#D1FAE5', '#DBEAFE', '#FCE7F3'];
  return (
    <View className="bg-white rounded-2xl mx-5 mb-3 p-4" style={CARD_SHADOW}>
      <CardHeader icon="heart-outline" title="Saved items" />

      <View className="flex-row gap-2 mb-3">
        {colors.map((bg, i) => (
          <View
            key={i}
            className="flex-1 h-20 rounded-xl items-center justify-center"
            style={{ backgroundColor: bg }}
          >
            <Ionicons name="footsteps-outline" size={18} color="#9CA3AF" />
          </View>
        ))}
      </View>

      <Text className="text-gray-400 text-xs">
        <Text className="text-gray-700 font-semibold">23 sneakers</Text> saved across all brands
      </Text>
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

/* ── Recycle & Donate ── */
function RecycleDonateCard() {
  return (
    <View className="bg-white rounded-2xl mx-5 mb-3 p-4" style={CARD_SHADOW}>
      <CardHeader icon="sync-outline" title="Recycle & donate" />

      <Text className="text-gray-500 text-sm leading-relaxed mb-4">
        Give your worn kicks a second life. We partner with local drop-off points
        and charities to keep sneakers out of landfill.
      </Text>

      <View className="flex-row gap-2">
        <TouchableOpacity
          className="flex-1 bg-blue-600 rounded-xl py-2.5 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-sm">Schedule pickup</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-gray-100 rounded-xl py-2.5 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-gray-600 font-semibold text-sm">Find drop-off</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ── Composed list ── */
export default function ProfileMenuList() {
  return (
    <View>
      <MyListingsCard />
      <SavedItemsCard />
      <SellerAnalyticsCard />
      <RecycleDonateCard />
    </View>
  );
}
