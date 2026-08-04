import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, Image, ScrollView } from 'react-native';
import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
import { Ionicons } from '@expo/vector-icons';
import { Charity } from '@/features/charity/types/charity.types';
import { CharityService } from '@/features/charity/services/charity.service';
import DonateSheet from './DonateSheet';

export default function CharitiesSection() {
  const [donateCharity, setDonateCharity] = useState<Charity | null>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    CharityService.getCharities()
      .then(setCharities)
      .catch(() => setUnavailable(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View className="mb-6">
      {/* Header */}
      <View className="px-5 mb-3">
        <Text className="text-gray-900 font-bold text-base">Support a Cause</Text>
        <Text className="text-gray-400 text-xs mt-0.5">
          Pick a charity — donation proceeds go straight to them.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#2563EB" style={{ paddingVertical: 28 }} />
      ) : unavailable || charities.length === 0 ? (
        <View className="mx-5 rounded-2xl bg-blue-50 px-4 py-5 items-center">
          <Ionicons name="heart-outline" size={24} color="#2563EB" />
          <Text className="text-blue-700 font-bold text-xs mt-2">COMING SOON</Text>
          <Text className="text-gray-500 text-xs mt-1 text-center">Charity partners will appear here soon.</Text>
        </View>
      ) : (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
      >
        {charities.map((charity) => (
          <GuardedTouchableOpacity
            key={charity.id}
            onPress={() => setDonateCharity(charity)}
            activeOpacity={0.8}
            style={{
              width: 140,
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: 12,
              borderWidth: 1.5,
              borderColor: '#F3F4F6',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {charity.image ? (
              <Image
                source={{ uri: charity.image }}
                style={{ width: '100%', height: 80, borderRadius: 12, marginBottom: 10, backgroundColor: '#F9FAFB' }}
                resizeMode="contain"
                accessibilityLabel={`${charity.name} logo`}
              />
            ) : (
              <View className="w-full h-20 rounded-xl mb-2.5 bg-gray-50 items-center justify-center">
                <Ionicons name="heart-outline" size={26} color="#9CA3AF" />
              </View>
            )}

            {/* Name + cause */}
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 }} numberOfLines={2}>
              {charity.name}
            </Text>
            <Text style={{ fontSize: 11, color: '#9CA3AF' }} numberOfLines={1}>
              {charity.cause}
            </Text>
          </GuardedTouchableOpacity>
        ))}
      </ScrollView>
      )}

      <DonateSheet
        visible={donateCharity != null}
        charity={donateCharity}
        onClose={() => setDonateCharity(null)}
      />
    </View>
  );
}
