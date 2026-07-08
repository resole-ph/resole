import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Charity } from '@/features/charity/types/charity.types';
import { CharityService } from '@/features/charity/services/charity.service';

interface CharityDisplayProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
}

type CharityDetails = Charity & CharityDisplayProps;

export const CHARITY_TYPES = {
  'Community building': {
    icon: 'home-outline',
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
  },
  'Disaster relief': {
    icon: 'medkit-outline',
    iconColor: '#EF4444',
    iconBg: '#FEE2E2',
  },
  'Environment & wildlife': {
    icon: 'leaf-outline',
    iconColor: '#10B981',
    iconBg: '#D1FAE5',
  },
  "Children's welfare": {
    icon: 'happy-outline',
    iconColor: '#3B82F6',
    iconBg: '#DBEAFE',
  },
  'Poverty alleviation': {
    icon: 'heart-outline',
    iconColor: '#8B5CF6',
    iconBg: '#EDE9FE',
  },
  'Child education': {
    icon: 'school-outline',
    iconColor: '#EC4899',
    iconBg: '#FCE7F3',
  },
  'Other': {
    icon: 'ellipsis-horizontal-outline',
    iconColor: "#929292",
    iconBg: '#FFFFFF'
  }
} as const;

export default function CharitiesSection() {
  const [charities, setCharities] = useState<CharityDetails[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const getCharities = async () => {
      const data = await CharityService.getCharities();
      const charityList = data.map((item: Charity) => {
        return {
          ...item,
          ...(CHARITY_TYPES[item.cause as keyof typeof CHARITY_TYPES] ?? CHARITY_TYPES.Other),
        };
      });

      setCharities(charityList);
    };

    getCharities();
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

      {/* Charity cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
      >
        {charities.map((charity) => {
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
              {/* Icon */}
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: charity.iconBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <Ionicons name={charity.icon} size={20} color={charity.iconColor} />
              </View>

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
