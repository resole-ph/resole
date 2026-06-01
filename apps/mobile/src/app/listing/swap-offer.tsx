    import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type Condition = 'New' | 'Like New' | 'Good' | 'Fair';

const CONDITIONS: Condition[] = ['New', 'Like New', 'Good', 'Fair'];

const CONDITION_COLORS: Record<Condition, string> = {
  'New':      '#10B981',
  'Like New': '#3B82F6',
  'Good':     '#F59E0B',
  'Fair':     '#9CA3AF',
};

export default function SwapOfferScreen() {
  const insets = useSafeAreaInsets();
  const { listingId, listingName, listingPrice, listingImage } =
    useLocalSearchParams<{
      listingId: string;
      listingName: string;
      listingPrice: string;
      listingImage: string;
    }>();

  const [shoeName, setShoeName] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [condition, setCondition] = useState<Condition | null>(null);
  const [cashTopUp, setCashTopUp] = useState('');
  const [notes, setNotes] = useState('');

  const isFormValid = shoeName.trim() && brand.trim() && size.trim() && condition;

  const handleSubmit = () => {
    // TODO: wire up to API
    console.log('Swap offer submitted:', {
      listingId,
      offeredShoe: { shoeName, brand, size, condition },
      cashTopUp: cashTopUp ? parseInt(cashTopUp) : 0,
      notes,
    });
    // Navigate back to home after submit
    router.dismissAll();
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View
        className="flex-row items-center bg-white px-5 pb-4 border-b border-gray-100"
        style={{ paddingTop: insets.top + 12 }}
      >
        <TouchableOpacity
          className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-3"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color="#111827" />
        </TouchableOpacity>
        <Text className="text-gray-900 font-bold text-lg">Make Swap Offer</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Listing they're swapping for */}
        <View className="px-5 pt-5 mb-6">
          <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-3">
            You're offering to swap for
          </Text>
          <View
            className="flex-row items-center bg-white rounded-2xl p-3"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Image
              source={{ uri: listingImage }}
              style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#F3F4F6' }}
              resizeMode="cover"
            />
            <View className="flex-1 ml-3">
              <Text className="text-gray-900 font-semibold text-sm" numberOfLines={2}>
                {listingName}
              </Text>
              <Text className="text-blue-600 font-bold text-base mt-1">
                ₱{parseInt(listingPrice).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Swap arrow */}
        <View className="items-center mb-6">
          <View className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center"
            style={{
              shadowColor: '#2563EB',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Ionicons name="swap-vertical" size={20} color="#fff" />
          </View>
        </View>

        {/* Your shoe form */}
        <View className="px-5">
          <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-4">
            Your shoe details
          </Text>

          {/* Shoe name */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">Shoe Name *</Text>
            <TextInput
              className="bg-white rounded-2xl px-4 py-3.5 text-gray-800 text-base"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
              placeholder="e.g. Air Force 1 Low"
              placeholderTextColor="#9CA3AF"
              value={shoeName}
              onChangeText={setShoeName}
            />
          </View>

          {/* Brand */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">Brand *</Text>
            <TextInput
              className="bg-white rounded-2xl px-4 py-3.5 text-gray-800 text-base"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
              placeholder="e.g. Nike"
              placeholderTextColor="#9CA3AF"
              value={brand}
              onChangeText={setBrand}
            />
          </View>

          {/* Size */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">Size *</Text>
            <TextInput
              className="bg-white rounded-2xl px-4 py-3.5 text-gray-800 text-base"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
              placeholder="e.g. US 10"
              placeholderTextColor="#9CA3AF"
              value={size}
              onChangeText={setSize}
            />
          </View>

          {/* Condition */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">Condition *</Text>
            <View className="flex-row gap-2 flex-wrap">
              {CONDITIONS.map((c) => {
                const isSelected = condition === c;
                return (
                  <TouchableOpacity
                    key={c}
                    className="rounded-full px-4 py-2 border"
                    style={{
                      borderColor: isSelected ? CONDITION_COLORS[c] : '#E5E7EB',
                      backgroundColor: isSelected ? CONDITION_COLORS[c] + '15' : '#fff',
                    }}
                    onPress={() => setCondition(c)}
                    activeOpacity={0.75}
                  >
                    <Text
                      className="text-sm font-medium"
                      style={{ color: isSelected ? CONDITION_COLORS[c] : '#6B7280' }}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Cash top-up */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-1">Cash Top-up</Text>
            <Text className="text-gray-400 text-xs mb-2">
              Add cash to sweeten your offer (optional)
            </Text>
            <View
              className="flex-row items-center bg-white rounded-2xl px-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text className="text-gray-400 text-base mr-2">₱</Text>
              <TextInput
                className="flex-1 py-3.5 text-gray-800 text-base"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                value={cashTopUp}
                onChangeText={(v) => setCashTopUp(v.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Notes */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">Notes</Text>
            <TextInput
              className="bg-white rounded-2xl px-4 py-3.5 text-gray-800 text-base"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
                height: 96,
                textAlignVertical: 'top',
              }}
              placeholder="Any additional info for the seller..."
              placeholderTextColor="#9CA3AF"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4"
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        <TouchableOpacity
          className="rounded-2xl py-4 items-center"
          style={{
            backgroundColor: isFormValid ? '#2563EB' : '#E5E7EB',
            shadowColor: isFormValid ? '#2563EB' : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: isFormValid ? 6 : 0,
          }}
          activeOpacity={isFormValid ? 0.85 : 1}
          onPress={isFormValid ? handleSubmit : undefined}
        >
          <Text
            className="font-bold text-base"
            style={{ color: isFormValid ? '#fff' : '#9CA3AF' }}
          >
            Send Swap Offer
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
