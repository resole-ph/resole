import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Stat {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  value: string;
  label: string;
}

const STATS: Stat[] = [
  {
    icon: 'leaf',
    iconColor: '#10B981',
    iconBg: '#D1FAE5',
    value: '12.4k',
    label: 'Pairs saved',
  },
  {
    icon: 'flash',
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
    value: '248',
    label: 'Your coins',
  },
  {
    icon: 'flame',
    iconColor: '#EF4444',
    iconBg: '#FEE2E2',
    value: '7d',
    label: 'Streak',
  },
];

function StatCard({ stat }: { stat: Stat }) {
  return (
    <View
      className="flex-1 bg-white rounded-2xl p-3"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View
        className="w-8 h-8 rounded-xl items-center justify-center mb-2"
        style={{ backgroundColor: stat.iconBg }}
      >
        <Ionicons name={stat.icon} size={16} color={stat.iconColor} />
      </View>
      <Text className="text-gray-900 font-bold text-base">{stat.value}</Text>
      <Text className="text-gray-400 text-xs mt-0.5">{stat.label}</Text>
    </View>
  );
}

export default function StatsRow() {
  return (
    <View className="flex-row mx-5 mb-4 gap-3">
      {STATS.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </View>
  );
}
