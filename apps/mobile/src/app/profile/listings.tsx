import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SubScreenHeader from '@/components/organisms/SubScreenHeader';
import { useSellStore } from '@/store/sell';
import { Listing } from '@/components/molecules/ListingCard';
import { ListingService } from '@/features/listing/services/listing.service';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};

type Tab = 'active' | 'pending';

function ActiveCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Listing;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 mx-5 flex-row items-center" style={CARD_SHADOW}>
      <View
        className="w-16 h-16 rounded-xl items-center justify-center mr-3"
        // style={{ backgroundColor: item.colorway }}
      >
        <Ionicons name="footsteps-outline" size={24} color="#9CA3AF" />
      </View>

      <View className="flex-1 mr-2">
        <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
          {item.model}
        </Text>
        <Text className="text-gray-400 text-xs mt-0.5">{item.size}</Text>
        <Text className="text-blue-600 font-bold text-sm mt-1">{item.price}</Text>
        <View className="flex-row items-center mt-1">
          <View className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1" />
          <Text className="text-gray-400 text-xs">{item.daysLeft}d left</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          className="w-9 h-9 rounded-xl bg-gray-50 items-center justify-center"
          activeOpacity={0.7}
          onPress={onEdit}
        >
          <Ionicons name="create-outline" size={18} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-9 h-9 rounded-xl bg-red-50 items-center justify-center"
          activeOpacity={0.7}
          onPress={onDelete}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PendingCard({ item }: { item: Listing }) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 mx-5 flex-row items-center" style={CARD_SHADOW}>
      <View
        className="w-16 h-16 rounded-xl items-center justify-center mr-3"
        // style={{ backgroundColor: item.colorway }}
      >
        <Ionicons name="footsteps-outline" size={24} color="#9CA3AF" />
      </View>

      <View className="flex-1 mr-2">
        <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
          {item.model}
        </Text>
        <Text className="text-gray-400 text-xs mt-0.5">{item.size}</Text>
        <Text className="text-blue-600 font-bold text-sm mt-1">{item.price}</Text>
        <View className="flex-row items-center mt-1">
          <View className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1" />
          <Text className="text-amber-500 text-xs">Pending AI review</Text>
        </View>
      </View>

      <View className="bg-amber-50 rounded-xl px-3 py-1.5">
        <Text className="text-amber-600 font-semibold text-xs">In Review</Text>
      </View>
    </View>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <View className="items-center py-16">
      <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
      <Text className="text-gray-400 text-sm mt-3">{label}</Text>
    </View>
  );
}

export default function ListingsScreen() {
  const router = useRouter();
  const resetSell = useSellStore((s) => s.reset);

  const [tab, setTab] = useState<Tab>('active');
  const [active, setActive] = useState<Listing[]>([]);
  const [pending, setPending] = useState<Listing[]>([]);

  useEffect(() => {
    const fetchUserListings = async () => {
      const now = new Date();
      const data = (await ListingService.getUserListings()) || [];
      const activeItems = data.filter((item) => {
        const itemTime = new Date(item.createdAt).getTime();
        return (now.getTime() - itemTime) / (1000 * 60 * 60 * 24) <= 30;
      });

      setActive(activeItems);
    };

    const fetchPendingListings = async () => {
      const data = localStorage.getItem('pending');
      const pendingItems = data ? JSON.parse(data) : [];

      setPending(pendingItems);
    }

    fetchUserListings();
    fetchPendingListings();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Remove listing?', 'This will take it off the market.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setActive((prev) => prev.filter((l) => l.id !== id)),
      },
    ]);
  };

  const handleEdit = () => {
    resetSell();
    router.push('/profile/edit-listing');
  };

  const counts: Record<Tab, number> = {
    active: active.length,
    pending: pending.length,
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SubScreenHeader title="My Listings" />

      {/* Tab switcher */}
      <View className="flex-row mx-5 bg-gray-100 rounded-2xl p-1 mb-4">
        {(['active', 'pending'] as Tab[]).map((t) => (
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
        {tab === 'active' && active.length === 0 && (
          <EmptyState label="No active listings" />
        )}
        {tab === 'active' &&
          active.map((item) => (
            <ActiveCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={() => handleDelete(item.id)}
            />
          ))}

        {tab === 'pending' && pending.length === 0 && (
          <EmptyState label="No listings pending review" />
        )}
        {tab === 'pending' &&
          pending.map((item) => <PendingCard key={item.id} item={item} />)}
      </ScrollView>
    </View>
  );
}
