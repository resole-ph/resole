import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FavoritesToggleProps {
  active: boolean;
  onToggle: () => void;
}

export default function FavoritesToggle({ active, onToggle }: FavoritesToggleProps) {
  return (
    <View className="px-5 pb-4">
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.75}
        className={`flex-row items-center self-start rounded-full px-4 py-2 border ${
          active ? 'bg-red-500 border-red-500' : 'bg-white border-gray-200'
        }`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: active ? 0.15 : 0.05,
          shadowRadius: 4,
          elevation: active ? 3 : 1,
        }}
      >
        <Ionicons name={active ? 'heart' : 'heart-outline'} size={14} color={active ? '#fff' : '#EF4444'} />
        <Text className={`ml-1.5 text-sm font-medium ${active ? 'text-white' : 'text-gray-700'}`}>
          Favorites only
        </Text>
      </TouchableOpacity>
    </View>
  );
}
