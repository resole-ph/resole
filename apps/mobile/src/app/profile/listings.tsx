import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SubScreenHeader from '@/components/organisms/SubScreenHeader';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};

type Tab = 'active' | 'expired' | 'drafts';

type Listing = {
  id: string;
  name: string;
  size: string;
  price: string;
  color: string;
  daysLeft?: number;
  expiredDaysAgo?: number;
  donatedTo?: string | null;
  lastEdited?: string;
};

const ACTIVE_LISTINGS: Listing[] = [
  { id: '1', name: 'Nike Air Max 90', size: 'US 10', price: '₱4,500', color: '#DBEAFE', daysLeft: 12 },
  { id: '2', name: 'Adidas Ultraboost 22', size: 'US 9.5', price: '₱6,200', color: '#EDE9FE', daysLeft: 7 },
  { id: '3', name: 'Jordan 1 Retro High', size: 'US 11', price: '₱18,000', color: '#FCE7F3', daysLeft: 3 },
  { id: '4', name: 'New Balance 550', size: 'US 8', price: '₱3,800', color: '#D1FAE5', daysLeft: 21 },
  { id: '5', name: 'Converse Chuck 70', size: 'US 9', price: '₱2,800', color: '#FEF3C7', daysLeft: 14 },
];

const INITIAL_EXPIRED: Listing[] = [
  { id: '6', name: 'Vans Old Skool', size: 'US 9', price: '₱2,200', color: '#F3F4F6', expiredDaysAgo: 5, donatedTo: null },
  { id: '7', name: 'Puma RS-X', size: 'US 10', price: '₱3,500', color: '#FEE2E2', expiredDaysAgo: 12, donatedTo: 'Caritas Manila' },
  { id: '8', name: 'Reebok Classic', size: 'US 8.5', price: '₱2,900', color: '#E5E7EB', expiredDaysAgo: 20, donatedTo: null },
];

const DRAFT_LISTINGS: Listing[] = [
  { id: '9', name: 'Untitled Listing', size: 'US ?', price: '—', color: '#F9FAFB', lastEdited: '2 hours ago' },
  { id: '10', name: 'Nike SB Dunk Low', size: 'US 10', price: '₱9,000', color: '#DBEAFE', lastEdited: 'Yesterday' },
];

const CHARITIES = ['Caritas Manila', 'Gawad Kalinga', 'DSWD', 'Tahanan ng Pagmamahal'];

function ListingCard({
  item,
  tab,
  onRemove,
  onDonate,
}: {
  item: Listing;
  tab: Tab;
  onRemove?: (id: string) => void;
  onDonate?: (id: string) => void;
}) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 mx-5 flex-row items-center" style={CARD_SHADOW}>
      <View
        className="w-16 h-16 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: item.color }}
      >
        <Ionicons name="footsteps-outline" size={24} color="#9CA3AF" />
      </View>

      <View className="flex-1 mr-2">
        <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-gray-400 text-xs mt-0.5">{item.size}</Text>
        <Text className="text-blue-600 font-bold text-sm mt-1">{item.price}</Text>

        {tab === 'active' && (
          <View className="flex-row items-center mt-1">
            <View className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1" />
            <Text className="text-gray-400 text-xs">{item.daysLeft}d left</Text>
          </View>
        )}
        {tab === 'expired' && item.donatedTo && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="heart" size={10} color="#10B981" />
            <Text className="text-green-600 text-xs ml-1" numberOfLines={1}>
              Donated to {item.donatedTo}
            </Text>
          </View>
        )}
        {tab === 'expired' && !item.donatedTo && (
          <Text className="text-red-400 text-xs mt-1">Expired {item.expiredDaysAgo}d ago</Text>
        )}
        {tab === 'drafts' && (
          <Text className="text-gray-400 text-xs mt-1">Edited {item.lastEdited}</Text>
        )}
      </View>

      {tab === 'active' && (
        <TouchableOpacity
          className="w-9 h-9 rounded-xl bg-gray-50 items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={18} color="#6B7280" />
        </TouchableOpacity>
      )}

      {tab === 'expired' && !item.donatedTo && (
        <View className="gap-2">
          <TouchableOpacity
            className="bg-red-50 rounded-xl px-3 py-1.5 items-center"
            activeOpacity={0.7}
            onPress={() => onRemove?.(item.id)}
          >
            <Text className="text-red-500 font-semibold text-xs">Remove</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-green-50 rounded-xl px-3 py-1.5 items-center"
            activeOpacity={0.7}
            onPress={() => onDonate?.(item.id)}
          >
            <Text className="text-green-600 font-semibold text-xs">Donate</Text>
          </TouchableOpacity>
        </View>
      )}

      {tab === 'drafts' && (
        <TouchableOpacity
          className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="pencil-outline" size={18} color="#2563EB" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ListingsScreen() {
  const [tab, setTab] = useState<Tab>('active');
  const [expired, setExpired] = useState<Listing[]>(INITIAL_EXPIRED);
  const [donateTargetId, setDonateTargetId] = useState<string | null>(null);

  const handleRemove = (id: string) => {
    Alert.alert('Remove listing?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setExpired((prev) => prev.filter((l) => l.id !== id)),
      },
    ]);
  };

  const handleDonate = (charity: string) => {
    setExpired((prev) =>
      prev.map((l) => (l.id === donateTargetId ? { ...l, donatedTo: charity } : l))
    );
    setDonateTargetId(null);
  };

  const counts = {
    active: ACTIVE_LISTINGS.length,
    expired: expired.length,
    drafts: DRAFT_LISTINGS.length,
  };

  const tabs: Tab[] = ['active', 'expired', 'drafts'];

  return (
    <View className="flex-1 bg-gray-50">
      <SubScreenHeader title="My Listings" />

      {/* Tab switcher */}
      <View className="flex-row mx-5 bg-gray-100 rounded-2xl p-1 mb-4">
        {tabs.map((t) => (
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
              {t}{' '}
              <Text className={tab === t ? 'text-blue-600' : 'text-gray-400'}>
                ({counts[t]})
              </Text>
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {tab === 'active' &&
          ACTIVE_LISTINGS.map((item) => <ListingCard key={item.id} item={item} tab="active" />)}
        {tab === 'expired' &&
          expired.map((item) => (
            <ListingCard
              key={item.id}
              item={item}
              tab="expired"
              onRemove={handleRemove}
              onDonate={() => setDonateTargetId(item.id)}
            />
          ))}
        {tab === 'drafts' &&
          DRAFT_LISTINGS.map((item) => <ListingCard key={item.id} item={item} tab="drafts" />)}

        {tab === 'expired' && expired.length === 0 && (
          <View className="items-center py-16">
            <Ionicons name="checkmark-circle-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 text-sm mt-3">No expired listings</Text>
          </View>
        )}
      </ScrollView>

      {/* Donate modal */}
      <Modal visible={donateTargetId !== null} transparent animationType="slide">
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-gray-900 font-bold text-lg mb-1">Donate to charity</Text>
            <Text className="text-gray-500 text-sm mb-5">
              Choose a partner charity. We'll arrange the pickup.
            </Text>
            {CHARITIES.map((c) => (
              <TouchableOpacity
                key={c}
                className="flex-row items-center bg-gray-50 rounded-2xl p-4 mb-2"
                activeOpacity={0.7}
                onPress={() => handleDonate(c)}
              >
                <View className="w-9 h-9 rounded-xl bg-green-50 items-center justify-center mr-3">
                  <Ionicons name="heart-outline" size={18} color="#10B981" />
                </View>
                <Text className="text-gray-900 font-semibold text-sm flex-1">{c}</Text>
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              className="mt-2 py-3 items-center"
              onPress={() => setDonateTargetId(null)}
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
