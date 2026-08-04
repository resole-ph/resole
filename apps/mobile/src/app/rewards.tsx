import { View, Text, ScrollView } from 'react-native';
import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '@/components/organisms/BottomNav';
import { RedeemOption, CoinTx } from '@/features/transaction/types/transaction.types';
import { TransactionService } from '@/features/transaction/services/transaction.service';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};

function ComingSoon({ label }: { label: string }) {
  return (
    <View className="items-center justify-center py-8">
      <Ionicons name="time-outline" size={22} color="#D1D5DB" />
      <Text className="text-gray-400 text-sm font-medium mt-2">{label} coming soon</Text>
    </View>
  );
}

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
        <Text className={`font-bold text-sm ${isPositive ? 'text-green-500' : 'text-amber-500'}`}>
          {isPositive ? '+' : ''}{tx.amount}
        </Text>
        <Text className="text-gray-300 text-xs">{tx.date}</Text>
      </View>
    </View>
  );
}

function RedeemCard({ option, balance }: { option: RedeemOption; balance: number }) {
  const canAfford = balance >= option.cost;
  const isHighlight = option.highlight;
  return (
    <View
      className="rounded-2xl p-4 mb-3"
      style={[CARD_SHADOW, { backgroundColor: isHighlight ? '#059669' : '#fff' }]}
    >
      <View className="flex-row items-start">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3 mt-0.5"
          style={{ backgroundColor: isHighlight ? 'rgba(255,255,255,0.2)' : '#D1FAE5' }}
        >
          <Ionicons
            name={option.icon}
            size={20}
            color={isHighlight ? '#fff' : '#059669'}
          />
        </View>
        <View className="flex-1">
          <Text style={{ fontWeight: '600', fontSize: 14, color: isHighlight ? '#fff' : '#111827' }}>
            {option.title}
          </Text>
          <Text style={{ fontSize: 12, marginTop: 2, color: isHighlight ? '#A7F3D0' : '#9CA3AF' }}>
            {option.description}
          </Text>
          {/* Point cost */}
          <Text style={{ fontSize: 13, fontWeight: '700', marginTop: 6, color: isHighlight ? '#fff' : '#059669' }}>
            {option.cost} pts
          </Text>
        </View>
        <GuardedTouchableOpacity
          style={{
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 8,
            marginLeft: 8,
            alignSelf: 'center',
            backgroundColor: canAfford
              ? isHighlight ? '#fff' : '#059669'
              : '#E5E7EB',
          }}
          activeOpacity={canAfford ? 0.7 : 1}
        >
          <Text
            style={{
              fontWeight: '700',
              fontSize: 13,
              color: canAfford
                ? isHighlight ? '#059669' : '#fff'
                : '#9CA3AF',
            }}
          >
            Redeem
          </Text>
        </GuardedTouchableOpacity>
      </View>
    </View>
  );
}

export default function RewardsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [balance, setBalance] = useState<number>(0);
  const [balanceSummary, setBalanceSummary] = useState<any>({});
  const [walletHistory, setWalletHistory] = useState<CoinTx[]>([]);
  const [vouchers, setVouchers] = useState<RedeemOption[]>([]);

  useEffect(() => {
    const getBalance = async () => {
      const data = await TransactionService.getUserCoinBalance();
      setBalance(data.coinBalance);
      setBalanceSummary(data.summary);
    };

    const getWalletHistory = async () => {
      const data = await TransactionService.getUserWalletTransactions();
      setWalletHistory(data);
    }

    const getVouchers = async () => {
      const data = await TransactionService.getVouchers();
      setVouchers(data);
    };

    getBalance();
    getWalletHistory();
    getVouchers();
  }, []);

  return (
    <View className="flex-1 bg-gray-50">
      <View style={{ paddingTop: insets.top + 8 }} className="px-5 pb-4">
        <Text className="text-2xl font-bold text-gray-900">Rewards</Text>
        <Text className="text-sm text-gray-400 mt-0.5">Your Recycle Coins balance</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        {/* Balance hero */}
        <View
          className="mx-5 mb-5 rounded-3xl p-6 overflow-hidden items-center"
          style={{
            backgroundColor: '#059669',
            shadowColor: '#059669',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <View className="flex-row items-center mb-1">
            <Ionicons name="leaf-outline" size={14} color="#86EFAC" />
            <Text className="text-green-200 text-xs font-semibold ml-1 uppercase tracking-wide">
              Recycle Coins Balance
            </Text>
          </View>

          <View className="items-center py-6">
            <Ionicons name="time-outline" size={26} color="#A7F3D0" />
            <Text className="text-white font-bold text-base mt-2">Coming Soon</Text>
            <Text className="text-green-200 text-xs text-center mt-1">
              Balance, earned, redeemed, and vouchers owned are on their way.
            </Text>
          </View>
        </View>

        {/* Redeem options */}
        <Text className="text-gray-900 font-semibold text-base px-5 mb-3">Redeem</Text>
        <View className="px-5">
          {vouchers.length > 0 ? (
            vouchers.map((opt) => (
              <RedeemCard key={opt.id} option={opt} balance={balance} />
            ))
          ) : (
            <View className="bg-white rounded-2xl" style={CARD_SHADOW}>
              <ComingSoon label="Vouchers" />
            </View>
          )}
        </View>

        {/* Coin history */}
        <Text className="text-gray-900 font-semibold text-base px-5 mt-4 mb-1">History</Text>
        <View className="bg-white rounded-2xl mx-5 px-4" style={CARD_SHADOW}>
          {walletHistory.length > 0 ? (
            walletHistory.map((tx) => (
              <HistoryRow key={tx.id} tx={tx} />
            ))
          ) : (
            <ComingSoon label="History" />
          )}
        </View>
      </ScrollView>

      <BottomNav activeTab="rewards" onFabPress={() => router.push('/sell' as any)} />
    </View>
  );
}
