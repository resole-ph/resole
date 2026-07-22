import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SubScreenHeader from '@/components/organisms/SubScreenHeader';
import { useSellStore } from '@/store/sell';
import { Listing } from '@/components/molecules/ListingCard';
import { ListingService } from '@/features/listing/services/listing.service';
import { CharityService } from '@/features/charity/services/charity.service';
import { Charity } from '@/features/charity/types/charity.types';
import { usePreferencesStore } from '@/store/preferences';
import { formatSize } from '@/features/shoe/utils/size-conversion';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};

type Tab = 'active' | 'pending';

const TAB_LABELS: Record<Tab, string> = {
  active: 'Active',
  pending: 'Removed',
};

/**
 * Listing photos are shot with a lot of plain background around the shoe, so a
 * plain "cover" fill still leaves the shoe looking small in a tight thumbnail.
 * Scaling the image up (clipped by the parent's overflow-hidden) crops that
 * margin away and zooms in on the shoe itself.
 */
function ListingThumbnail({ imageUrl }: { imageUrl?: string }) {
  return (
    <View className="w-16 h-16 rounded-xl items-center justify-center mr-3 bg-gray-100 overflow-hidden">
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%', transform: [{ scale: 1.5 }] }}
          resizeMode="cover"
        />
      ) : (
        <Ionicons name="footsteps-outline" size={24} color="#9CA3AF" />
      )}
    </View>
  );
}

function ActiveCard({
  item,
  onPress,
  onEdit,
  onDelete,
}: {
  item: Listing;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const sizeSystem = usePreferencesStore((s) => s.sizeSystem);
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 mx-5 flex-row items-center"
      style={CARD_SHADOW}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <ListingThumbnail imageUrl={item.imageUrl} />

      <View className="flex-1 mr-2">
        <Text className="text-gray-400 text-xs font-medium" numberOfLines={1}>
          {item.brand}
        </Text>
        <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
          {item.model}
        </Text>
        <Text className="text-gray-400 text-xs mt-0.5">
          Size: {item.size ? formatSize(Number(item.size), sizeSystem) : '—'}
        </Text>
        <Text className="text-blue-600 font-bold text-sm mt-1">Price: ₱{item.price.toLocaleString()}</Text>
        <View className="flex-row items-center mt-1">
          <View className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1" />
          <Text className="text-gray-400 text-xs">{item.daysLeft}d left</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          className="w-9 h-9 rounded-xl bg-gray-50 items-center justify-center"
          activeOpacity={0.7}
          onPress={(e) => { e.stopPropagation(); onEdit(); }}
        >
          <Ionicons name="create-outline" size={18} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-9 h-9 rounded-xl bg-red-50 items-center justify-center"
          activeOpacity={0.7}
          onPress={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function PendingCard({
  item,
  onRelist,
  onDonate,
}: {
  item: Listing;
  onRelist: () => void;
  onDonate: () => void;
}) {
  const sizeSystem = usePreferencesStore((s) => s.sizeSystem);
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 mx-5" style={CARD_SHADOW}>
      <View className="flex-row items-center mb-3">
        <ListingThumbnail imageUrl={item.imageUrl} />

        <View className="flex-1 mr-2">
          <Text className="text-gray-400 text-xs font-medium" numberOfLines={1}>
            {item.brand}
          </Text>
          <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
            {item.model}
          </Text>
          <Text className="text-gray-400 text-xs mt-0.5">
            Size: {item.size ? formatSize(Number(item.size), sizeSystem) : '—'}
          </Text>
          <Text className="text-blue-600 font-bold text-sm mt-1">Price: ₱{item.price.toLocaleString()}</Text>
          <View className="flex-row items-center mt-1">
            <View className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-1" />
            <Text className="text-gray-400 text-xs">Removed from market</Text>
          </View>
        </View>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center rounded-xl py-2.5"
          style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }}
          activeOpacity={0.8}
          onPress={onRelist}
        >
          <Ionicons name="refresh" size={14} color="#2563EB" />
          <Text style={{ color: '#2563EB', fontSize: 12.5, fontWeight: '700', marginLeft: 5 }}>
            Re-list
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center rounded-xl py-2.5"
          style={{ backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' }}
          activeOpacity={0.8}
          onPress={onDonate}
        >
          <Ionicons name="heart" size={14} color="#16A34A" />
          <Text style={{ color: '#16A34A', fontSize: 12.5, fontWeight: '700', marginLeft: 5 }}>
            Donate
          </Text>
        </TouchableOpacity>
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

  const [donateTargetId, setDonateTargetId] = useState<string | null>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [charitiesLoading, setCharitiesLoading] = useState(false);
  const [donating, setDonating] = useState(false);

  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        const data = (await ListingService.getUserListings()) || [];
        const itemsWithDays = await Promise.all(
          data.map(async (item) => {
            item.daysLeft = await ListingService.getDaysLeft(item.createdAt);
            return item;
          })
        );

        const activeItems = itemsWithDays.filter(
          (item) => item.isAvailable !== false && item.daysLeft !== undefined && item.daysLeft > 0
        );
        const removedItems = itemsWithDays.filter((item) => item.isAvailable === false);

        setActive(activeItems);
        setPending(removedItems);
      } catch (error) {
        console.error('Failed to load user listings:', error);
      }
    };

    fetchUserListings();
  }, []);

  const handleDelete = async (id: string) => {
    const item = active.find((l) => l.id === id);

    Alert.alert('Remove listing?', 'This will take it off the market. You can re-list or donate it later.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          // Only move it once the server confirms the delete — an optimistic
          // removal here previously made a failed delete look like it succeeded,
          // when the listing was still live server-side.
          try {
            await ListingService.deleteListing(Number(id));
            setActive((prev) => prev.filter((l) => l.id !== id));
            if (item) {
              setPending((prev) => [...prev, { ...item, isAvailable: false }]);
            }
          } catch (error) {
            console.error('Failed to delete listing:', error);
            Alert.alert('Could not remove listing', 'Please try again.');
          }
        }
      },
    ]);
  };

  const handleRelist = async (id: string) => {
    try {
      await ListingService.relistListing(Number(id));
      const item = pending.find((l) => l.id === id);
      setPending((prev) => prev.filter((l) => l.id !== id));
      if (item) {
        const daysLeft = await ListingService.getDaysLeft(item.createdAt);
        setActive((prev) => [...prev, { ...item, isAvailable: true, daysLeft }]);
      }
    } catch (error) {
      console.error('Failed to re-list listing:', error);
      Alert.alert('Could not re-list listing', 'Please try again.');
    }
  };

  const openDonateModal = async (id: string) => {
    setDonateTargetId(id);
    if (charities.length === 0) {
      setCharitiesLoading(true);
      try {
        const data = await CharityService.getCharities();
        setCharities(data);
      } catch (error) {
        console.error('Failed to load charities:', error);
        Alert.alert('Could not load charities', 'Please try again.');
        setDonateTargetId(null);
      } finally {
        setCharitiesLoading(false);
      }
    }
  };

  const handleConfirmDonate = async (charityId: number) => {
    if (!donateTargetId) return;
    setDonating(true);
    try {
      await ListingService.donateListing(Number(donateTargetId), charityId);
      setPending((prev) => prev.filter((l) => l.id !== donateTargetId));
      setDonateTargetId(null);
      Alert.alert('Thank you!', 'Your shoe has been donated.');
    } catch (error) {
      console.error('Failed to donate listing:', error);
      Alert.alert('Could not donate listing', 'Please try again.');
    } finally {
      setDonating(false);
    }
  };

  const handleEdit = (id: string) => {
    resetSell();
    router.push({ pathname: '/profile/edit-listing', params: { id } });
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
              className={`text-xs font-semibold ${
                tab === t ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {TAB_LABELS[t]}{' '}
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
              onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })}
              onEdit={() => handleEdit(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}

        {tab === 'pending' && pending.length === 0 && (
          <EmptyState label="No removed listings" />
        )}
        {tab === 'pending' &&
          pending.map((item) => (
            <PendingCard
              key={item.id}
              item={item}
              onRelist={() => handleRelist(item.id)}
              onDonate={() => openDonateModal(item.id)}
            />
          ))}
      </ScrollView>

      <Modal
        visible={donateTargetId !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setDonateTargetId(null)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View className="bg-white rounded-t-3xl p-5" style={{ maxHeight: '70%' }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 font-bold text-base">Choose a charity</Text>
              <TouchableOpacity onPress={() => setDonateTargetId(null)} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {charitiesLoading ? (
              <ActivityIndicator color="#2563EB" style={{ paddingVertical: 24 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {charities.map((charity) => (
                  <TouchableOpacity
                    key={charity.id}
                    className="flex-row items-center justify-between rounded-xl px-4 py-3 mb-2 bg-gray-50"
                    activeOpacity={0.7}
                    disabled={donating}
                    onPress={() => handleConfirmDonate(charity.id)}
                  >
                    <View className="flex-1 mr-2">
                      <Text className="text-gray-900 font-semibold text-sm">{charity.name}</Text>
                      <Text className="text-gray-400 text-xs mt-0.5">{charity.cause}</Text>
                    </View>
                    {donating ? (
                      <ActivityIndicator color="#16A34A" size="small" />
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
