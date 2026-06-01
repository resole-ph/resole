import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SubScreenHeader from '@/components/organisms/SubScreenHeader';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};

const BALANCE = 1_240;

type CoinTx = {
  id: string;
  label: string;
  sub: string;
  amount: number;
  date: string;
  icon: 'heart-outline' | 'sync-outline' | 'star-outline' | 'gift-outline';
};

const COIN_HISTORY: CoinTx[] = [
  { id: '1', label: 'Donated Converse Chuck 70', sub: 'Gawad Kalinga', amount: +80, date: 'May 22', icon: 'heart-outline' },
  { id: '2', label: 'Recycled Vans Old Skool', sub: 'Drop-off verified', amount: +120, date: 'May 18', icon: 'sync-outline' },
  { id: '3', label: 'Listing milestone', sub: '10th listing bonus', amount: +50, date: 'May 10', icon: 'star-outline' },
  { id: '4', label: 'Redeemed discount', sub: '₱200 off on purchase', amount: -200, date: 'May 5', icon: 'gift-outline' },
  { id: '5', label: 'Donated Puma RS-X', sub: 'Caritas Manila', amount: +100, date: 'Apr 30', icon: 'heart-outline' },
];

type RedeemOption = {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: 'ticket-outline' | 'heart-circle-outline' | 'pricetag-outline' | 'leaf-outline';
  highlight?: boolean;
};

const REDEEM_OPTIONS: RedeemOption[] = [
  { id: 'r1', title: '₱200 off next purchase', description: 'Apply as discount on any listing', cost: 200, icon: 'pricetag-outline', highlight: true },
  { id: 'r2', title: 'Donate 100 coins', description: 'We plant a tree in your name', cost: 100, icon: 'leaf-outline' },
  { id: 'r3', title: 'Priority listing boost', description: 'Push your listing to the top for 7 days', cost: 300, icon: 'ticket-outline' },
  { id: 'r4', title: 'Charity bundle', description: 'Funds ₱500 worth of charity goods', cost: 500, icon: 'heart-circle-outline' },
];

function HistoryRow({ tx }: { tx: CoinTx }) {
  const isPositive = tx.amount > 0;
  return (
    <View className="flex-row items-center py-3 border-b border-gray-50">
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: isPositive ? '#D1FAE5' : '#FEF3C7' }}
      >
        <Ionicons name={tx.icon} size={17} color={isPositive ? '#10B981' : '#F59E0B'} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-800 font-semibold text-sm" numberOfLines={1}>{tx.label}</Text>
        <Text className="text-gray-400 text-xs">{tx.sub}</Text>
      </View>
      <View className="items-end">
        <Text
          className={`font-bold text-sm ${isPositive ? 'text-green-500' : 'text-amber-500'}`}
        >
          {isPositive ? '+' : ''}{tx.amount}
        </Text>
        <Text className="text-gray-300 text-xs">{tx.date}</Text>
      </View>
    </View>
  );
}

function RedeemCard({ option }: { option: RedeemOption }) {
  const canAfford = BALANCE >= option.cost;
  return (
    <View
      className={`rounded-2xl p-4 mb-3 ${option.highlight ? 'bg-blue-600' : 'bg-white'}`}
      style={CARD_SHADOW}
    >
      <View className="flex-row items-center">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: option.highlight ? 'rgba(255,255,255,0.2)' : '#EFF6FF' }}
        >
          <Ionicons
            name={option.icon}
            size={20}
            color={option.highlight ? '#fff' : '#2563EB'}
          />
        </View>
        <View className="flex-1">
          <Text
            className={`font-semibold text-sm ${option.highlight ? 'text-white' : 'text-gray-900'}`}
          >
            {option.title}
          </Text>
          <Text
            className={`text-xs mt-0.5 ${option.highlight ? 'text-blue-200' : 'text-gray-400'}`}
          >
            {option.description}
          </Text>
        </View>
        <TouchableOpacity
          className={`rounded-xl px-3 py-1.5 items-center ${
            canAfford
              ? option.highlight
                ? 'bg-white'
                : 'bg-blue-600'
              : 'bg-gray-100'
          }`}
          activeOpacity={canAfford ? 0.7 : 1}
        >
          <Text
            className={`font-bold text-xs ${
              canAfford
                ? option.highlight
                  ? 'text-blue-600'
                  : 'text-white'
                : 'text-gray-400'
            }`}
          >
            {option.cost} pts
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function WalletScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <SubScreenHeader title="Recycle Coins" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Balance hero */}
        <View
          className="mx-5 mb-5 rounded-3xl p-6 overflow-hidden"
          style={{
            backgroundColor: '#1D4ED8',
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <View className="flex-row items-center mb-1">
            <Ionicons name="leaf-outline" size={14} color="#93C5FD" />
            <Text className="text-blue-300 text-xs font-semibold ml-1 uppercase tracking-wide">
              Recycle Coins Balance
            </Text>
          </View>
          <Text className="text-white text-5xl font-bold mt-1 mb-1">
            {BALANCE.toLocaleString()}
          </Text>
          <Text className="text-blue-300 text-sm">
            Earn more by donating or recycling your kicks
          </Text>

          {/* Earn breakdown */}
          <View className="flex-row mt-5 gap-2">
            {[
              { label: 'Donations', value: '800' },
              { label: 'Recycling', value: '390' },
              { label: 'Bonuses', value: '50' },
            ].map((b) => (
              <View key={b.label} className="flex-1 rounded-2xl py-2.5 px-2 items-center" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                <Text className="text-white font-bold text-base">{b.value}</Text>
                <Text className="text-blue-300 text-xs mt-0.5">{b.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Redeem options */}
        <Text className="text-gray-900 font-semibold text-base px-5 mb-3">Redeem</Text>
        <View className="px-5">
          {REDEEM_OPTIONS.map((opt) => (
            <RedeemCard key={opt.id} option={opt} />
          ))}
        </View>

        {/* Coin history */}
        <Text className="text-gray-900 font-semibold text-base px-5 mt-4 mb-1">History</Text>
        <View className="bg-white rounded-2xl mx-5 px-4" style={CARD_SHADOW}>
          {COIN_HISTORY.map((tx) => (
            <HistoryRow key={tx.id} tx={tx} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
