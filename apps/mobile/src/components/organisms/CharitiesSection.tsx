import { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Charity } from '@/features/charity/types/charity.types';

const CHARITIES: Charity[] = [
  { id: 1, name: 'Gawad Kalinga', cause: 'Community building' },
  { id: 2, name: 'Philippine Red Cross', cause: 'Disaster relief' },
  { id: 3, name: 'WWF Philippines', cause: 'Environment & wildlife' },
  { id: 4, name: 'UNICEF Philippines', cause: "Children's welfare" },
  { id: 5, name: 'Caritas Philippines', cause: 'Poverty alleviation' },
  { id: 6, name: 'Save the Children', cause: 'Child education' },
];

const CHARITY_IMAGES = [
  require('../../../assets/charity-gawad-kalinga.jpg'),
  require('../../../assets/charity-red-cross.png'),
  require('../../../assets/charity-wwf.jpg'),
  require('../../../assets/charity-unicef.png'),
  require('../../../assets/charity-caritas.png'),
  require('../../../assets/charity-save-children.png'),
];

export default function CharitiesSection() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <View className="mb-6">
      {/* Header */}
      <View className="px-5 mb-3">
        <Text className="text-gray-900 font-bold text-base">Support a Cause</Text>
        <Text className="text-gray-400 text-xs mt-0.5">
          Pick a charity — donation proceeds go straight to them.
        </Text>
      </View>

      {/* Charity cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
      >
        {CHARITIES.map((charity, index) => {
          const selected = selectedId === charity.id;
          return (
            <TouchableOpacity
              key={charity.id}
              onPress={() => setSelectedId(selected ? null : charity.id)}
              activeOpacity={0.8}
              style={{
                width: 140,
                backgroundColor: selected ? '#EFF6FF' : '#ffffff',
                borderRadius: 16,
                padding: 12,
                borderWidth: 1.5,
                borderColor: selected ? '#2563EB' : '#F3F4F6',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              {/* Logo */}
              <Image
                source={CHARITY_IMAGES[index % CHARITY_IMAGES.length]}
                style={{ width: '100%', height: 80, borderRadius: 12, marginBottom: 10, backgroundColor: '#F9FAFB' }}
                resizeMode="contain"
              />

              {/* Name + cause */}
              <Text
                style={{ fontSize: 13, fontWeight: '700', color: selected ? '#1D4ED8' : '#111827', marginBottom: 2 }}
                numberOfLines={2}
              >
                {charity.name}
              </Text>
              <Text style={{ fontSize: 11, color: '#9CA3AF' }} numberOfLines={1}>
                {charity.cause}
              </Text>

              {/* Selected checkmark */}
              {selected && (
                <View
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: '#2563EB',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="checkmark" size={11} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
