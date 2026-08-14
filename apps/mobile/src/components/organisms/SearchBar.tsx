import { useRef, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator } from 'react-native';
import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
import { Ionicons } from '@expo/vector-icons';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSearchSuggestions } from '@/features/search/queries/search.queries';
import type { PersonSuggestion, ShoeSuggestion } from '@/features/search/services/search.service';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onFocus?: () => void;
  onSelectSeller?: (personId: string) => void;
}

export default function SearchBar({ onSearch, onFocus, onSelectSeller }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedQuery = useDebouncedValue(query, 300);
  const { data: suggestions, isFetching } = useSearchSuggestions(debouncedQuery);
  const shoeSuggestions = suggestions?.shoes ?? [];
  const peopleSuggestions = suggestions?.people ?? [];

  const showDropdown =
    isFocused &&
    debouncedQuery.trim().length >= 2 &&
    (shoeSuggestions.length > 0 || peopleSuggestions.length > 0 || isFetching);

  const handleFocus = () => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    hideTimeout.current = setTimeout(() => setIsFocused(false), 200);
  };

  const handlePickShoe = (shoeItem: ShoeSuggestion) => {
    const text = `${shoeItem.brand} ${shoeItem.model}`;
    setQuery(text);
    onSearch?.(text);
    setIsFocused(false);
  };

  const handlePickPerson = (person: PersonSuggestion) => {
    setIsFocused(false);
    onSelectSeller?.(person.id);
  };

  return (
    <View className="px-5 pt-4 pb-4" style={{ position: 'relative', zIndex: 10 }}>
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
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {query.length > 0 && (
          <GuardedTouchableOpacity
            onPress={() => {
              setQuery('');
              onSearch?.('');
            }}
            activeOpacity={0.6}
          >
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </GuardedTouchableOpacity>
        )}
      </View>

      {showDropdown && (
        <View
          className="bg-white rounded-2xl mt-2 overflow-hidden"
          style={{
            position: 'absolute',
            top: '100%',
            left: 20,
            right: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {isFetching && shoeSuggestions.length === 0 && peopleSuggestions.length === 0 ? (
            <View className="items-center py-6">
              <ActivityIndicator color="#2563EB" size="small" />
            </View>
          ) : (
            <>
              {shoeSuggestions.length > 0 && (
                <View className="pt-3 pb-1.5 px-2">
                  <Text className="text-gray-400 text-[11.5px] font-bold uppercase px-2 mb-1.5" style={{ letterSpacing: 0.5 }}>
                    Shoes
                  </Text>
                  {shoeSuggestions.map((shoeItem, index) => (
                    <GuardedTouchableOpacity
                      key={`${shoeItem.brand}-${shoeItem.model}-${index}`}
                      className="flex-row items-center px-2 py-2.5 rounded-xl"
                      activeOpacity={0.6}
                      // Fires on touch-down rather than release — release can land
                      // after the keyboard starts collapsing (the input blurs on
                      // touch-start), which shifts this row out from under the
                      // finger and drops the tap before onPress would fire.
                      onPressIn={() => handlePickShoe(shoeItem)}
                    >
                      <View
                        className="items-center justify-center rounded-xl mr-3"
                        style={{ width: 40, height: 40, backgroundColor: '#EFF6FF' }}
                      >
                        <Ionicons name="footsteps-outline" size={20} color="#2563EB" />
                      </View>
                      <Text className="text-gray-800 text-[15px] flex-1" numberOfLines={1}>
                        <Text className="font-bold">{shoeItem.brand}</Text> {shoeItem.model}
                      </Text>
                    </GuardedTouchableOpacity>
                  ))}
                </View>
              )}

              {peopleSuggestions.length > 0 && (
                <View
                  className="pb-3 pt-1.5 px-2"
                  style={shoeSuggestions.length > 0 ? { borderTopWidth: 1, borderTopColor: '#F3F4F6' } : undefined}
                >
                  <Text className="text-gray-400 text-[11.5px] font-bold uppercase px-2 mb-1.5 mt-1.5" style={{ letterSpacing: 0.5 }}>
                    People
                  </Text>
                  {peopleSuggestions.map((person) => (
                    <GuardedTouchableOpacity
                      key={person.id}
                      className="flex-row items-center px-2 py-2.5 rounded-xl"
                      activeOpacity={0.6}
                      onPressIn={() => handlePickPerson(person)}
                    >
                      <View
                        className="items-center justify-center rounded-xl mr-3"
                        style={{ width: 40, height: 40, backgroundColor: '#F5F3FF' }}
                      >
                        <Ionicons name="person-outline" size={20} color="#7C3AED" />
                      </View>
                      <Text className="text-gray-800 text-[15px] font-semibold flex-1" numberOfLines={1}>
                        {person.name}
                      </Text>
                    </GuardedTouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}
