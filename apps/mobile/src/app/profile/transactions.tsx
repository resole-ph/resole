import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
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
  status: 'completed' | 'pending' | 'disputed';
  color: string;
};

const SALES: Transaction[] = [
  { id: 's1', item: 'Jordan 1 Retro High', counterpart: 'Buyer: @jmendoza', date: 'May 28, 2026', amount: '₱18,000', status: 'completed', color: '#DBEAFE' },
  { id: 's2', item: 'Nike SB Dunk Low', counterpart: 'Buyer: @kevinr', date: 'May 15, 2026', amount: '₱9,500', status: 'completed', color: '#EDE9FE' },
  { id: 's3', item: 'Adidas Samba OG', counterpart: 'Buyer: @amirag', date: 'May 3, 2026', amount: '₱7,800', status: 'pending', color: '#D1FAE5' },
];

const SWAPS: Transaction[] = [
  { id: 'w1', item: 'Yeezy 350 v2 → Air Max 97', counterpart: 'Swapped with: @pdc', date: 'May 20, 2026', amount: 'Even swap', status: 'completed', color: '#FCE7F3' },
  { id: 'w2', item: 'NB 550 → Panda Dunk', counterpart: 'Swapped with: @lramos', date: 'Apr 30, 2026', amount: '+₱2,000', status: 'completed', color: '#FEF3C7' },
];

const DONATIONS: Transaction[] = [
  { id: 'd1', item: 'Vans Old Skool', counterpart: 'Caritas Manila', date: 'May 22, 2026', amount: '+120 coins', status: 'completed', color: '#D1FAE5' },
  { id: 'd2', item: 'Converse Chuck 70', counterpart: 'Gawad Kalinga', date: 'Apr 18, 2026', amount: '+80 coins', status: 'completed', color: '#FEF3C7' },
];

const STATUS_STYLES: Record<Transaction['status'], { bg: string; text: string; label: string }> = {
  completed: { bg: 'bg-green-50', text: 'text-green-600', label: 'Completed' },
  pending:   { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Pending' },
  disputed:  { bg: 'bg-red-50',   text: 'text-red-500',   label: 'Disputed' },
};

type ModalType = 'dispute' | 'refund' | null;

function TxCard({ tx, onDispute, onRefund }: {
  tx: Transaction;
  onDispute: (tx: Transaction) => void;
  onRefund: (tx: Transaction) => void;
}) {
  const s = STATUS_STYLES[tx.status];
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 mx-5" style={CARD_SHADOW}>
      <View className="flex-row items-center mb-3">
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
          <View className={`${s.bg} rounded-full px-2 py-0.5 mt-1`}>
            <Text className={`${s.text} text-xs font-semibold`}>{s.label}</Text>
          </View>
        </View>
      </View>

      {tx.status === 'completed' && (
        <View className="flex-row gap-2 pt-3 border-t border-gray-50">
          <TouchableOpacity
            className="flex-1 bg-gray-50 rounded-xl py-2 items-center"
            activeOpacity={0.7}
            onPress={() => onDispute(tx)}
          >
            <Text className="text-gray-600 font-semibold text-xs">Dispute</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-blue-50 rounded-xl py-2 items-center"
            activeOpacity={0.7}
            onPress={() => onRefund(tx)}
          >
            <Text className="text-blue-600 font-semibold text-xs">Request Refund</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function TransactionsScreen() {
  const [tab, setTab] = useState<TxTab>('sales');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const DATA: Record<TxTab, Transaction[]> = { sales: SALES, swaps: SWAPS, donations: DONATIONS };
  const currentData = DATA[tab];

  const openModal = (type: ModalType, tx: Transaction) => {
    setSelectedTx(tx);
    setModalType(type);
  };

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
          <TxCard
            key={tx.id}
            tx={tx}
            onDispute={(t) => openModal('dispute', t)}
            onRefund={(t) => openModal('refund', t)}
          />
        ))}
      </ScrollView>

      {/* Dispute / Refund modal */}
      <Modal visible={modalType !== null} transparent animationType="slide">
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-gray-900 font-bold text-lg mb-1">
              {modalType === 'dispute' ? 'Open a dispute' : 'Request a refund'}
            </Text>
            <Text className="text-gray-500 text-sm mb-2">
              {selectedTx?.item}
            </Text>
            <Text className="text-gray-400 text-sm mb-5 leading-relaxed">
              {modalType === 'dispute'
                ? 'Describe the issue with this transaction. Our team will review it within 2 business days.'
                : 'Refund requests are reviewed within 3 business days. The seller will be notified.'}
            </Text>

            {/* Reason options */}
            {(modalType === 'dispute'
              ? ['Item not as described', 'Never received', 'Counterfeit item', 'Wrong size sent']
              : ['Item damaged', 'Wrong item received', 'Changed my mind', 'Duplicate order']
            ).map((reason) => (
              <TouchableOpacity
                key={reason}
                className="flex-row items-center bg-gray-50 rounded-2xl p-4 mb-2"
                activeOpacity={0.7}
                onPress={() => setModalType(null)}
              >
                <View className="w-5 h-5 rounded-full border-2 border-gray-300 mr-3" />
                <Text className="text-gray-700 font-medium text-sm flex-1">{reason}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="bg-blue-600 rounded-2xl py-3.5 items-center mt-3"
              activeOpacity={0.8}
              onPress={() => setModalType(null)}
            >
              <Text className="text-white font-semibold text-sm">Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-3 items-center"
              onPress={() => setModalType(null)}
              activeOpacity={0.7}
            >
              <Text className="text-gray-400 font-semibold text-sm">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
