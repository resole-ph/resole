import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ScrollView } from 'react-native';
import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
import { Category, Brand } from '@/features/shoe/types/shoe.types';
import { ShoeService } from '@/features/shoe/services/shoe.service';

const CATEGORIES: Category[] = [
  { id: 'running',    label: 'Running',    icon: 'walk',         iconColor: '#F59E0B' },
  { id: 'basketball', label: 'Basketball', icon: 'basketball',   iconColor: '#EF4444' },
  { id: 'football',   label: 'Football',   icon: 'football',     iconColor: '#eb924a' },
  { id: 'lifestyle',  label: 'Lifestyle',  icon: 'sunny',        iconColor: '#8B5CF6' },
  { id: 'skate',      label: 'Skate',      icon: 'trending-up',  iconColor: '#10B981' },
  { id: 'training',   label: 'Training',   icon: 'barbell',      iconColor: '#3B82F6' },
  { id: 'casual',     label: 'Casual',     icon: 'shirt',        iconColor: '#EC4899' },
  { id: 'other',      label: 'Other',            iconColor: '#9CA3AF' },
];

interface CategoriesRowProps {
  onCategoryPress?: (categoryId: string | null) => void;
  onBrandPress?: (brandId: string | null) => void;
}

export default function CategoriesRow({ onCategoryPress, onBrandPress }: CategoriesRowProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);

  useEffect(() => {
    const getBrands = async () => {
      try {
        const data = await ShoeService.getShoeBrands();
        setBrands(data);
      } catch (error) {
        console.error('Failed to load shoe brands:', error);
      }
    }

    getBrands();
  }, [])

  const handleCatPress = (id: string) => {
    const next = activeCatId === id ? null : id;
    setActiveCatId(next);
    onCategoryPress?.(next);
  };

  const handleBrandPress = (id: string) => {
    const next = activeBrandId === id ? null : id;
    setActiveBrandId(next);
    onBrandPress?.(next);
  };

  return (
    <View className="mb-5">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 mb-3">
        <Text className="text-gray-900 font-bold text-base">Categories</Text>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCatId === cat.id;
          return (
            <GuardedTouchableOpacity
              key={cat.id}
              className={`flex-row items-center rounded-full px-4 py-2 border ${
                isActive ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'
              }`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isActive ? 0.15 : 0.05,
                shadowRadius: 4,
                elevation: isActive ? 3 : 1,
              }}
              activeOpacity={0.75}
              onPress={() => handleCatPress(cat.id)}
            >
              <Ionicons name={cat.icon} size={14} color={isActive ? '#fff' : cat.iconColor} />
              <Text className={`ml-1.5 text-sm font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
                {cat.label}
              </Text>
            </GuardedTouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Brand chips */}
      <View className="flex-row items-center justify-between px-5 mt-4 mb-3">
        <Text className="text-gray-900 font-bold text-base">Brands</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {brands.map((brand) => {
          const isActive = activeBrandId === brand.id;
          return (
            <GuardedTouchableOpacity
              key={brand.id}
              className={`rounded-full px-4 py-2 border ${
                isActive ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'
              }`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isActive ? 0.15 : 0.05,
                shadowRadius: 4,
                elevation: isActive ? 3 : 1,
              }}
              activeOpacity={0.75}
              onPress={() => handleBrandPress(brand.id)}
            >
              <Text className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-700'}`}>
                {brand.label}
              </Text>
            </GuardedTouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
