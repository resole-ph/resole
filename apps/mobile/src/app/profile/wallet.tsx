import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SubScreenHeader from '@/components/organisms/SubScreenHeader';
import { RedeemOption, CoinTx } from '@/features/transaction/types/transaction.types';
import {
  useCoinBalance,
  useVouchers,
  useWalletTransactions,
} from '@/features/user/queries/user.queries';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};

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

function RedeemCard({ option, balance }: { option: RedeemOption; balance: number }) {
  const canAfford = balance >= option.cost;
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
  // Three independent queries, each cached separately. Vouchers in particular
  // change far less often than the balance, so re-entering the wallet usually
  // needs no request for them at all.
  const { data: coinData } = useCoinBalance();
  const { data: walletHistoryData } = useWalletTransactions();
  const { data: vouchersData } = useVouchers();

  const balance: number = coinData?.coinBalance ?? 0;
  const balanceSummary: any = coinData?.summary ?? {};
  const walletHistory: CoinTx[] = walletHistoryData ?? [];
  const vouchers: RedeemOption[] = vouchersData ?? [];

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
            {balance.toLocaleString()}
          </Text>
          <Text className="text-blue-300 text-sm">
            Earn more by donating or recycling your kicks
          </Text>

          {/* Earn breakdown */}
          <View className="flex-row mt-5 gap-2">
            {[
              { label: 'Earned', value: balanceSummary.totalCoinsEarned || 0 },
              { label: 'Redeemed', value: balanceSummary.totalCoinsRedeemed || 0 },
              { label: 'Vouchers Owned', value: balanceSummary.voucherCount || 0 },
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
          {vouchers.map((opt) => (
            <RedeemCard key={opt.id} option={opt} balance={balance} />
          ))}
        </View>

        {/* Coin history */}
        <Text className="text-gray-900 font-semibold text-base px-5 mt-4 mb-1">History</Text>
        <View className="bg-white rounded-2xl mx-5 px-4" style={CARD_SHADOW}>
          {walletHistory.map((tx) => (
            <HistoryRow key={tx.id} tx={tx} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
