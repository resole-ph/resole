import { useState } from 'react';
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

type TxTab = 'sales' | 'swaps' | 'donations';

type Transaction = {
  id: string;
  item: string;
  counterpart: string;
  date: string;
  amount: string;
  status: 'completed' | 'pending' | 'donated';
  color: string;
};

const SALES: Transaction[] = [
  { id: 's1', item: 'Jordan 1 Retro High',  counterpart: 'Buyer: @jmendoza', date: 'May 28, 2026', amount: '₱18,000', status: 'completed', color: '#DBEAFE' },
  { id: 's2', item: 'Nike SB Dunk Low',     counterpart: 'Buyer: @kevinr',   date: 'May 15, 2026', amount: '₱9,500',  status: 'completed', color: '#EDE9FE' },
  { id: 's3', item: 'Adidas Samba OG',      counterpart: 'Buyer: @amirag',   date: 'May 3, 2026',  amount: '₱7,800',  status: 'pending',   color: '#D1FAE5' },
];

const SWAPS: Transaction[] = [
  { id: 'w1', item: 'Yeezy 350 v2 → Air Max 97', counterpart: 'Swapped with: @pdc',    date: 'May 20, 2026', amount: 'Even swap', status: 'completed', color: '#FCE7F3' },
  { id: 'w2', item: 'NB 550 → Panda Dunk',       counterpart: 'Swapped with: @lramos', date: 'Apr 30, 2026', amount: '+₱2,000',   status: 'completed', color: '#FEF3C7' },
];

const DONATIONS: Transaction[] = [
  { id: 'd1', item: 'Vans Old Skool',     counterpart: 'Caritas Manila', date: 'May 22, 2026', amount: '+120 coins', status: 'donated', color: '#D1FAE5' },
  { id: 'd2', item: 'Converse Chuck 70',  counterpart: 'Gawad Kalinga',  date: 'Apr 18, 2026', amount: '+80 coins',  status: 'donated', color: '#FEF3C7' },
];

const STATUS_STYLES: Record<Transaction['status'], { bg: string; text: string; label: string }> = {
  completed: { bg: '#F0FDF4', text: '#16A34A', label: 'Completed' },
  pending:   { bg: '#FFFBEB', text: '#D97706', label: 'Pending' },
  donated:   { bg: '#ECFDF5', text: '#059669', label: 'Donated' },
};

function TxCard({ tx }: { tx: Transaction }) {
  const s = STATUS_STYLES[tx.status];
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 mx-5" style={CARD_SHADOW}>
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: tx.color }}
        >
          <Ionicons name="footsteps-outline" size={20} color="#9CA3AF" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
            {tx.item}
          </Text>
          <Text className="text-gray-400 text-xs mt-0.5">{tx.counterpart}</Text>
          <Text className="text-gray-300 text-xs mt-0.5">{tx.date}</Text>
        </View>
        <View className="items-end">
          <Text className="text-gray-900 font-bold text-sm">{tx.amount}</Text>
          <View
            className="rounded-full px-2.5 py-0.5 mt-1"
            style={{ backgroundColor: s.bg }}
          >
            <Text style={{ color: s.text, fontSize: 11, fontWeight: '600' }}>{s.label}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function TransactionsScreen() {
  const [tab, setTab] = useState<TxTab>('sales');

  const DATA: Record<TxTab, Transaction[]> = { sales: SALES, swaps: SWAPS, donations: DONATIONS };
  const currentData = DATA[tab];

  return (
    <View className="flex-1 bg-gray-50">
      <SubScreenHeader title="Transactions" />

      {/* Tab switcher */}
      <View className="flex-row mx-5 bg-gray-100 rounded-2xl p-1 mb-4">
        {(['sales', 'swaps', 'donations'] as TxTab[]).map((t) => (
          <TouchableOpacity
            key={t}
            className={`flex-1 py-2 rounded-xl items-center ${tab === t ? 'bg-white' : ''}`}
            activeOpacity={0.7}
            onPress={() => setTab(t)}
            style={tab === t ? CARD_SHADOW : undefined}
          >
            <Text
              className={`text-xs font-semibold capitalize ${
                tab === t ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {currentData.length === 0 && (
          <View className="items-center py-20">
            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 text-sm mt-3">No {tab} yet</Text>
          </View>
        )}
        {currentData.map((tx) => (
          <TxCard key={tx.id} tx={tx} />
        ))}
      </ScrollView>
    </View>
  );
}
