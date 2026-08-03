import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Listing } from '@/components/molecules/ListingCard';
import type { MarketFilters } from '@/features/listing/types/listing.types';

export type { MarketFilters } from '@/features/listing/types/listing.types';

export const EMPTY_FILTERS: MarketFilters = {
  sizes: [],
  colors: [],
  conditions: [],
  minRating: null,
  priceMin: '',
  priceMax: '',
};

const CONDITIONS: Listing['condition'][] = ['Like New', 'Excellent', 'Good', 'Fair', 'Poor'];
const RATINGS = [4.5, 4, 3];

interface FilterSheetProps {
  visible: boolean;
  value: MarketFilters;
  sizeOptions: string[];
  colorOptions: string[];
  onApply: (filters: MarketFilters) => void;
  onClose: () => void;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      className={`rounded-full px-3.5 py-2 mr-2 mb-2 border ${active ? 'bg-blue-600 border-blue-600' : 'bg-gray-50 border-gray-200'}`}
      activeOpacity={0.75}
      onPress={onPress}
    >
      <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-gray-700'}`}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text className="text-gray-900 font-bold text-sm mb-2.5 mt-5">{children}</Text>;
}

export default function FilterSheet({ visible, value, sizeOptions, colorOptions, onApply, onClose }: FilterSheetProps) {
  const [draft, setDraft] = useState<MarketFilters>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const toggle = <K extends 'sizes' | 'colors' | 'conditions'>(key: K, item: MarketFilters[K][number]) => {
    setDraft((prev) => {
      const list = prev[key] as any[];
      const next = list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
      return { ...prev, [key]: next };
    });
  };

  const activeCount =
    draft.sizes.length +
    draft.colors.length +
    draft.conditions.length +
    (draft.minRating ? 1 : 0) +
    (draft.priceMin ? 1 : 0) +
    (draft.priceMax ? 1 : 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, maxHeight: '82%' }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 }} />

          <View className="flex-row items-center justify-between">
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>Filters</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
            {/* Size preference */}
            <SectionLabel>Size preference</SectionLabel>
            {sizeOptions.length === 0 ? (
              <Text className="text-gray-400 text-xs">No sizes available</Text>
            ) : (
              <View className="flex-row flex-wrap">
                {sizeOptions.map((size) => (
                  <Chip key={size} label={size} active={draft.sizes.includes(size)} onPress={() => toggle('sizes', size)} />
                ))}
              </View>
            )}

            {/* Color */}
            <SectionLabel>Color</SectionLabel>
            {colorOptions.length === 0 ? (
              <Text className="text-gray-400 text-xs">No colors available</Text>
            ) : (
              <View className="flex-row flex-wrap">
                {colorOptions.map((color) => (
                  <Chip key={color} label={color} active={draft.colors.includes(color)} onPress={() => toggle('colors', color)} />
                ))}
              </View>
            )}

            {/* Condition */}
            <SectionLabel>Condition</SectionLabel>
            <View className="flex-row flex-wrap">
              {CONDITIONS.map((condition) => (
                <Chip
                  key={condition}
                  label={condition}
                  active={draft.conditions.includes(condition)}
                  onPress={() => toggle('conditions', condition)}
                />
              ))}
            </View>

            {/* Rating */}
            <SectionLabel>Rating</SectionLabel>
            <View className="flex-row flex-wrap">
              {RATINGS.map((rating) => (
                <Chip
                  key={rating}
                  label={`${rating}+ ★`}
                  active={draft.minRating === rating}
                  onPress={() => setDraft((prev) => ({ ...prev, minRating: prev.minRating === rating ? null : rating }))}
                />
              ))}
            </View>

            {/* Price range */}
            <SectionLabel>Price range</SectionLabel>
            <View className="flex-row items-center mb-6">
              <View className="flex-row items-center flex-1 bg-gray-50 rounded-xl px-3 border border-gray-200">
                <Text className="text-gray-400 text-sm mr-1">₱</Text>
                <TextInput
                  value={draft.priceMin}
                  onChangeText={(v) => setDraft((prev) => ({ ...prev, priceMin: v.replace(/[^0-9]/g, '') }))}
                  placeholder="Min"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  style={{ flex: 1, paddingVertical: 12, fontSize: 14, color: '#111827' }}
                />
              </View>
              <Text className="text-gray-400 mx-2">–</Text>
              <View className="flex-row items-center flex-1 bg-gray-50 rounded-xl px-3 border border-gray-200">
                <Text className="text-gray-400 text-sm mr-1">₱</Text>
                <TextInput
                  value={draft.priceMax}
                  onChangeText={(v) => setDraft((prev) => ({ ...prev, priceMax: v.replace(/[^0-9]/g, '') }))}
                  placeholder="Max"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  style={{ flex: 1, paddingVertical: 12, fontSize: 14, color: '#111827' }}
                />
              </View>
            </View>
          </ScrollView>

          <View className="flex-row gap-3" style={{ paddingBottom: 28, paddingTop: 8 }}>
            <TouchableOpacity
              className="rounded-2xl py-4 items-center justify-center px-5 bg-gray-100"
              activeOpacity={0.8}
              onPress={() => setDraft(EMPTY_FILTERS)}
            >
              <Text className="text-gray-600 font-semibold text-sm">Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-2xl py-4 items-center justify-center bg-blue-600"
              activeOpacity={0.85}
              onPress={() => {
                onApply(draft);
                onClose();
              }}
            >
              <Text className="text-white font-bold text-sm">
                Apply Filters{activeCount > 0 ? ` (${activeCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
