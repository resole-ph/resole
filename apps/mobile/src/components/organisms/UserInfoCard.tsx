import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserStat {
  value: string;
  label: string;
}

const DEFAULT_STATS: UserStat[] = [
  { value: '14', label: 'LISTINGS' },
  { value: '28', label: 'SOLD' },
  { value: '6',  label: 'SWAPS' },
];

interface UserInfoCardProps {
  name?: string;
  initials?: string;
  rating?: number;
  reviewCount?: number;
  location?: string;
  joinYear?: number;
  stats?: UserStat[];
}

function StatBox({ value, label }: UserStat) {
  return (
    <View className="flex-1 bg-gray-100 rounded-2xl py-3 items-center justify-center">
      <Text className="text-gray-900 font-bold text-lg">{value}</Text>
      <Text className="text-gray-400 text-xs font-semibold tracking-widest mt-0.5">
        {label}
      </Text>
    </View>
  );
}

export default function UserInfoCard({
  name = 'Miguel R.',
  initials = 'M',
  rating = 4.9,
  reviewCount = 32,
  location = 'Quezon City',
  joinYear = 2024,
  stats = DEFAULT_STATS,
}: UserInfoCardProps) {
  return (
    <View
      className="mx-5 mb-4 bg-white rounded-3xl p-5"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      {/* ── Avatar + details ── */}
      <View className="flex-row items-center mb-5">
        {/* Avatar */}
        <View className="w-16 h-16 rounded-full bg-blue-700 items-center justify-center">
          <Text className="text-white text-2xl font-bold">{initials}</Text>
        </View>

        {/* Details */}
        <View className="flex-1 ml-4">
          {/* Name */}
          <Text className="text-gray-900 font-semibold text-base mb-1">
            {name}
          </Text>

          {/* Rating */}
          <View className="flex-row items-center mb-1">
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text className="text-gray-700 text-sm ml-1">
              {rating} · {reviewCount} reviews
            </Text>
          </View>

          {/* Location · join date */}
          <Text className="text-gray-400 text-xs">
            {location} · Joined {joinYear}
          </Text>
        </View>
      </View>

      {/* ── Stats row ── */}
      <View className="flex-row gap-2">
        {stats.map((stat) => (
          <StatBox key={stat.label} {...stat} />
        ))}
      </View>
    </View>
  );
}
