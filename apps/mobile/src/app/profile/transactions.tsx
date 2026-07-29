import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SubScreenHeader from '@/components/organisms/SubScreenHeader';
import { Transaction, TxTab } from '@/features/transaction/types/transaction.types';
import { TransactionService } from '@/features/transaction/services/transaction.service';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};

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
          <Text className="text-gray-900 font-bold text-sm">{tx.amount ?? ""}</Text>
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
  const [data, setData] = useState<Record<TxTab, Transaction[]>>({
    sales: [],
    swaps: [],
    donations: [],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await TransactionService.getUserTransactions();

        const groupedData = data.reduce(
          (acc, item) => {
            const formattedItem = {
              ...item,
              color: STATUS_STYLES[item.status].bg,
            };

            if (item.type === 'sale') acc.sales.push(formattedItem);
            else if (item.type === 'swap') acc.swaps.push(formattedItem);
            else if (item.type === 'donate') acc.donations.push(formattedItem);

            return acc;
          },

          { sales: [] as Transaction[], swaps: [] as Transaction[], donations: [] as Transaction[] } 
        );

        setData(groupedData);
      } catch (error) {
        console.error('Failed to load user transactions:', error);
      }
    }

    loadData();
  }, [])

  const currentData = data[tab];

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
        {tab === 'donations' ? (
          <View className="items-center py-20">
            <Ionicons name="heart-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 text-sm font-medium mt-3">Donations coming soon</Text>
          </View>
        ) : (
          <>
            {currentData.length === 0 && (
              <View className="items-center py-20">
                <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
                <Text className="text-gray-400 text-sm mt-3">No {tab} yet</Text>
              </View>
            )}
            {currentData.map((tx) => (
              <TxCard key={tx.id} tx={tx} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
