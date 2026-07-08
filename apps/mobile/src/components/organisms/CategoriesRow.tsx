import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Category, Brand } from '@/features/shoe/types/shoe.types';
import { ShoeService } from '@/features/shoe/services/shoe.service';

const CATEGORIES: Category[] = [
  { id: 'running',    label: 'Running',    icon: 'walk',         iconColor: '#F59E0B' },
  { id: 'basketball', label: 'Basketball', icon: 'basketball',   iconColor: '#EF4444' },
  { id: 'lifestyle',  label: 'Lifestyle',  icon: 'sunny',        iconColor: '#8B5CF6' },
  { id: 'skate',      label: 'Skate',      icon: 'trending-up',  iconColor: '#10B981' },
  { id: 'training',   label: 'Training',   icon: 'barbell',      iconColor: '#3B82F6' },
  { id: 'casual',     label: 'Casual',     icon: 'shirt',        iconColor: '#EC4899' },
  { id: 'other',      label: 'Other',      icon: 'ellipsis-horizontal-outline',        iconColor: '#a1a1a1' },
];

interface CategoriesRowProps {
  onCategoryPress?: (categoryId: string) => void;
  onBrandPress?: (brandId: string) => void;
  onSeeAll?: () => void;
}

export default function CategoriesRow({ onCategoryPress, onBrandPress, onSeeAll }: CategoriesRowProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  
  useEffect(() => {
    const getBrands = async () => {
      const data = await ShoeService.getShoeBrands();
      setBrands(data);
    }

    getBrands();
  }, [])

  const handleCatPress = (id: string) => {
    setActiveCatId(prev => (prev === id ? null : id));
    onCategoryPress?.(id);
  };

  const handleBrandPress = (id: string) => {
    setActiveBrandId(prev => (prev === id ? null : id));
    onBrandPress?.(id);
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

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCatId === cat.id;
          return (
            <TouchableOpacity
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
            </TouchableOpacity>
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
            <TouchableOpacity
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
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
