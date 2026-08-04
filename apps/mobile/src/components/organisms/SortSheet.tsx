import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SortOption } from '@/features/listing/types/listing.types';

export type { SortOption } from '@/features/listing/types/listing.types';

const SORT_OPTIONS: { id: SortOption; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'newest', label: 'Newest First', icon: 'time-outline' },
  { id: 'oldest', label: 'Oldest First', icon: 'hourglass-outline' },
  { id: 'price_low', label: 'Price: Low to High', icon: 'trending-up-outline' },
  { id: 'price_high', label: 'Price: High to Low', icon: 'trending-down-outline' },
];

interface SortSheetProps {
  visible: boolean;
  value: SortOption;
  onSelect: (option: SortOption) => void;
  onClose: () => void;
}

export default function SortSheet({ visible, value, onSelect, onClose }: SortSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 }} />

          <View className="flex-row items-center justify-between mb-4">
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>Sort by</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {SORT_OPTIONS.map((option) => {
            const isActive = value === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                className={`flex-row items-center justify-between rounded-xl px-4 py-3 mb-2 ${isActive ? 'bg-blue-50' : 'bg-gray-50'}`}
                activeOpacity={0.75}
                onPress={() => {
                  onSelect(option.id);
                  onClose();
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons name={option.icon} size={16} color={isActive ? '#2563EB' : '#6B7280'} />
                  <Text
                    className="ml-2.5 text-sm font-semibold"
                    style={{ color: isActive ? '#2563EB' : '#374151' }}
                  >
                    {option.label}
                  </Text>
                </View>
                {isActive && <Ionicons name="checkmark-circle" size={18} color="#2563EB" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}
