import { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onFocus?: () => void;
}

export default function SearchBar({ onSearch, onFocus }: SearchBarProps) {
  const [query, setQuery] = useState('');

  return (
    <View className="px-5 pb-4">
      <View
        className="flex-row items-center bg-white rounded-2xl px-4 py-3.5"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 3,
        }}
      >
        <Ionicons name="search-outline" size={20} color="#9CA3AF" />

        <TextInput
          className="flex-1 ml-3 text-base text-gray-800"
          placeholder="Search Nike, Jordan, Adidas..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => onSearch?.(query)}
          onFocus={onFocus}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery('');
              onSearch?.('');
            }}
            activeOpacity={0.6}
          >
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
