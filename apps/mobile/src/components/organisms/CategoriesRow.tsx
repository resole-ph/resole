import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Category {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

const CATEGORIES: Category[] = [
  { id: 'running',    label: 'Running',    icon: 'walk',         iconColor: '#F59E0B' },
  { id: 'basketball', label: 'Basketball', icon: 'basketball',   iconColor: '#EF4444' },
  { id: 'lifestyle',  label: 'Lifestyle',  icon: 'sunny',        iconColor: '#8B5CF6' },
  { id: 'skate',      label: 'Skate',      icon: 'trending-up',  iconColor: '#10B981' },
  { id: 'training',   label: 'Training',   icon: 'barbell',      iconColor: '#3B82F6' },
  { id: 'casual',     label: 'Casual',     icon: 'shirt',        iconColor: '#EC4899' },
];

interface CategoriesRowProps {
  onCategoryPress?: (categoryId: string) => void;
  onSeeAll?: () => void;
}

export default function CategoriesRow({ onCategoryPress, onSeeAll }: CategoriesRowProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handlePress = (id: string) => {
    setActiveId(prev => (prev === id ? null : id));
    onCategoryPress?.(id);
  };

  return (
    <View className="mb-5">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 mb-3">
        <Text className="text-gray-900 font-bold text-base">Categories</Text>
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <Text className="text-blue-600 text-sm font-medium">See all</Text>
        </TouchableOpacity>
      </View>

      {/* Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeId === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              className={`flex-row items-center rounded-full px-4 py-2 border ${
                isActive
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white border-gray-200'
              }`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isActive ? 0.15 : 0.05,
                shadowRadius: 4,
                elevation: isActive ? 3 : 1,
              }}
              activeOpacity={0.75}
              onPress={() => handlePress(cat.id)}
            >
              <Ionicons
                name={cat.icon}
                size={14}
                color={isActive ? '#fff' : cat.iconColor}
              />
              <Text
                className={`ml-1.5 text-sm font-medium ${
                  isActive ? 'text-white' : 'text-gray-700'
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
