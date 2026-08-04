import { View, Text, ScrollView } from 'react-native';
import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
import { Ionicons } from '@expo/vector-icons';
import SubScreenHeader from '@/components/organisms/SubScreenHeader';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};

type StepStatus = 'done' | 'active' | 'upcoming';

type TrackStep = {
  label: string;
  status: StepStatus;
  time?: string;
};

type Order = {
  id: string;
  item: string;
  type: 'sale' | 'swap' | 'donation';
  color: string;
  eta: string;
  carrier: string;
  trackingNum: string;
  steps: TrackStep[];
};

const ORDERS: Order[] = [
  {
    id: 'ORD-001',
    item: 'Nike Air Max 90',
    type: 'sale',
    color: '#DBEAFE',
    eta: 'Jun 2, 2026',
    carrier: 'J&T Express',
    trackingNum: 'JT8273910284',
    steps: [
      { label: 'Order confirmed', status: 'done', time: 'May 29, 09:12 AM' },
      { label: 'Item picked up', status: 'done', time: 'May 30, 02:45 PM' },
      { label: 'In transit', status: 'active', time: 'May 31, 08:00 AM' },
      { label: 'Out for delivery', status: 'upcoming' },
      { label: 'Delivered', status: 'upcoming' },
    ],
  },
  {
    id: 'DON-002',
    item: 'Converse Chuck 70',
    type: 'donation',
    color: '#D1FAE5',
    eta: 'Jun 3, 2026',
    carrier: 'Resole Logistics',
    trackingNum: 'RSL0039201',
    steps: [
      { label: 'Donation confirmed', status: 'done', time: 'May 28, 10:00 AM' },
      { label: 'Pickup scheduled', status: 'done', time: 'May 30, 11:30 AM' },
      { label: 'Collected by driver', status: 'active', time: 'May 31, 09:15 AM' },
      { label: 'Delivered to charity', status: 'upcoming' },
    ],
  },
  {
    id: 'ORD-003',
    item: 'Jordan 1 Retro High',
    type: 'sale',
    color: '#FCE7F3',
    eta: 'Delivered',
    carrier: 'LBC Express',
    trackingNum: 'LBC19283746',
    steps: [
      { label: 'Order confirmed', status: 'done', time: 'May 22, 03:20 PM' },
      { label: 'Item picked up', status: 'done', time: 'May 23, 01:00 PM' },
      { label: 'In transit', status: 'done', time: 'May 24, 07:40 AM' },
      { label: 'Out for delivery', status: 'done', time: 'May 25, 10:15 AM' },
      { label: 'Delivered', status: 'done', time: 'May 25, 03:30 PM' },
    ],
  },
];

const TYPE_CONFIG = {
  sale:     { label: 'Sale',     bg: 'bg-blue-50',  text: 'text-blue-600',  icon: 'bag-outline' as const },
  swap:     { label: 'Swap',     bg: 'bg-purple-50', text: 'text-purple-600', icon: 'swap-horizontal-outline' as const },
  donation: { label: 'Donation', bg: 'bg-green-50',  text: 'text-green-600', icon: 'heart-outline' as const },
};

const STEP_COLORS: Record<StepStatus, string> = {
  done: '#2563EB',
  active: '#2563EB',
  upcoming: '#E5E7EB',
};

function TrackingCard({ order }: { order: Order }) {
  const tc = TYPE_CONFIG[order.type];
  const isDelivered = order.steps.every((s) => s.status === 'done');

  return (
    <View className="bg-white rounded-2xl mx-5 mb-4 p-4" style={CARD_SHADOW}>
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: order.color }}
        >
          <Ionicons name="footsteps-outline" size={20} color="#9CA3AF" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
            {order.item}
          </Text>
          <Text className="text-gray-400 text-xs mt-0.5">
            {order.carrier} · {order.trackingNum}
          </Text>
        </View>
        <View className={`${tc.bg} rounded-full px-2.5 py-1`}>
          <Text className={`${tc.text} text-xs font-semibold`}>{tc.label}</Text>
        </View>
      </View>

      {/* ETA */}
      <View className="bg-gray-50 rounded-xl px-3 py-2 mb-4 flex-row items-center">
        <Ionicons
          name={isDelivered ? 'checkmark-circle' : 'time-outline'}
          size={16}
          color={isDelivered ? '#10B981' : '#2563EB'}
        />
        <Text className="text-gray-700 text-xs font-semibold ml-2">
          {isDelivered ? 'Delivered' : `Estimated delivery: ${order.eta}`}
        </Text>
      </View>

      {/* Timeline */}
      {order.steps.map((step, idx) => {
        const isLast = idx === order.steps.length - 1;
        return (
          <View key={step.label} className="flex-row">
            {/* Dot + line */}
            <View className="items-center mr-3">
              <View
                className="w-3 h-3 rounded-full mt-0.5"
                style={{ backgroundColor: STEP_COLORS[step.status] }}
              />
              {!isLast && (
                <View
                  className="w-0.5 flex-1 my-0.5"
                  style={{
                    backgroundColor: step.status === 'done' ? '#2563EB' : '#E5E7EB',
                    minHeight: 20,
                  }}
                />
              )}
            </View>
            {/* Text */}
            <View className="flex-1 pb-3">
              <Text
                className={`text-sm font-semibold ${
                  step.status === 'upcoming' ? 'text-gray-300' : 'text-gray-800'
                }`}
              >
                {step.label}
              </Text>
              {step.time && (
                <Text className="text-gray-400 text-xs mt-0.5">{step.time}</Text>
              )}
            </View>
          </View>
        );
      })}

      {/* Contact support */}
      <GuardedTouchableOpacity
        className="flex-row items-center justify-center bg-gray-50 rounded-xl py-2.5 mt-2"
        activeOpacity={0.7}
      >
        <Ionicons name="chatbubble-outline" size={14} color="#6B7280" />
        <Text className="text-gray-600 font-semibold text-xs ml-1.5">Contact support</Text>
      </GuardedTouchableOpacity>
    </View>
  );
}

export default function TrackingScreen() {
  const active = ORDERS.filter((o) => !o.steps.every((s) => s.status === 'done'));
  const delivered = ORDERS.filter((o) => o.steps.every((s) => s.status === 'done'));

  return (
    <View className="flex-1 bg-gray-50">
      <SubScreenHeader title="Order Tracking" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {active.length > 0 && (
          <>
            <Text className="text-gray-400 text-xs font-semibold px-5 mb-3 uppercase tracking-wide">
              In progress
            </Text>
            {active.map((o) => (
              <TrackingCard key={o.id} order={o} />
            ))}
          </>
        )}

        {delivered.length > 0 && (
          <>
            <Text className="text-gray-400 text-xs font-semibold px-5 mb-3 mt-2 uppercase tracking-wide">
              Delivered
            </Text>
            {delivered.map((o) => (
              <TrackingCard key={o.id} order={o} />
            ))}
          </>
        )}

        {ORDERS.length === 0 && (
          <View className="items-center py-20">
            <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 text-sm mt-3">No active orders</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
