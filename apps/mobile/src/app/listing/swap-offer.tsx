import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MY_LISTINGS } from '@/data/MockListings';

const CONDITION_COLORS: Record<string, string> = {
  'Like New':  '#10B981',
  'Excellent': '#3B82F6',
  'Good':      '#F59E0B',
  'Fair':      '#9CA3AF',
  'Poor':      '#EF4444',
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

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cashTopUp, setCashTopUp]   = useState('');
  const [notes, setNotes]           = useState('');
  const [sent, setSent]             = useState(false);

  const selectedListing = MY_LISTINGS.find((l) => l.id === selectedId);
  const isValid = !!selectedId;

  function handleSubmit() {
    if (!isValid) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      router.dismissAll();
      router.push('/inbox' as any);
    }, 1200);
  }

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

        {/* Listing they want */}
        <View className="px-5 pt-5 mb-5">
          <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">
            You're offering to swap for
          </Text>
          <View
            className="flex-row items-center bg-white rounded-2xl p-3"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
          >
            <Image
              source={{ uri: listingImage }}
              style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#F3F4F6' }}
              resizeMode="cover"
            />
            <View className="flex-1 ml-3">
              <Text className="text-gray-900 font-semibold text-sm" numberOfLines={2}>{listingName}</Text>
              <Text className="text-blue-600 font-bold text-base mt-1">
                ₱{parseInt(listingPrice).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Swap arrow */}
        <View className="items-center mb-5">
          <View
            className="w-10 h-10 rounded-full bg-violet-600 items-center justify-center"
            style={{ shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
          >
            <Ionicons name="swap-vertical" size={20} color="#fff" />
          </View>
        </View>

        {/* Pick from your listings */}
        <View className="px-5">
          <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
            Choose one of your listings to offer
          </Text>
          <Text className="text-gray-400 text-xs mb-4">
            Only AI-evaluated listings can be used in a swap.
          </Text>

          {MY_LISTINGS.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center" style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#E5E7EB' }}>
              <Ionicons name="cube-outline" size={32} color="#9CA3AF" />
              <Text className="text-gray-500 font-semibold mt-3 text-center">No listings yet</Text>
              <Text className="text-gray-400 text-sm text-center mt-1">
                You need at least one AI-evaluated listing to make a swap offer.
              </Text>
              <TouchableOpacity
                className="mt-4 bg-violet-600 rounded-full px-6 py-3"
                onPress={() => router.push('/sell' as any)}
                activeOpacity={0.85}
              >
                <Text className="text-white font-bold">List a Shoe</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="gap-3">
              {MY_LISTINGS.map((item) => {
                const selected = selectedId === item.id;
                const condColor = CONDITION_COLORS[item.condition] ?? '#9CA3AF';
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setSelectedId(selected ? null : item.id)}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: selected ? '#F5F3FF' : '#ffffff',
                      borderRadius: 18,
                      padding: 12,
                      borderWidth: 1.5,
                      borderColor: selected ? '#7C3AED' : '#F3F4F6',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    {/* Shoe image */}
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#F3F4F6' }}
                      resizeMode="cover"
                    />

                    {/* Info */}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 1 }}>{item.brand}</Text>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }} numberOfLines={1}>{item.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                        {/* Condition badge */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: condColor + '18', borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 }}>
                          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: condColor, marginRight: 4 }} />
                          <Text style={{ fontSize: 11, fontWeight: '600', color: condColor }}>{item.condition}</Text>
                        </View>
                        {/* AI score */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 }}>
                          <Ionicons name="sparkles" size={9} color="#D97706" />
                          <Text style={{ fontSize: 11, fontWeight: '600', color: '#D97706', marginLeft: 3 }}>AI {item.aiScore}%</Text>
                        </View>
                        {item.size && <Text style={{ fontSize: 11, color: '#9CA3AF' }}>{item.size}</Text>}
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#7C3AED', marginTop: 4 }}>
                        ₱{item.price.toLocaleString()}
                      </Text>
                    </View>

                    {/* Selector */}
                    <View style={{
                      width: 22, height: 22, borderRadius: 11,
                      borderWidth: 2,
                      borderColor: selected ? '#7C3AED' : '#D1D5DB',
                      backgroundColor: selected ? '#7C3AED' : 'transparent',
                      alignItems: 'center', justifyContent: 'center', marginLeft: 8,
                    }}>
                      {selected && <Ionicons name="checkmark" size={13} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Cash top-up */}
          <View className="mt-5 mb-4">
            <Text className="text-gray-700 text-sm font-semibold mb-1">Cash Top-up</Text>
            <Text className="text-gray-400 text-xs mb-2">Add cash to sweeten your offer (optional)</Text>
            <View
              className="flex-row items-center bg-white rounded-2xl px-4"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
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
            <Text className="text-gray-700 text-sm font-semibold mb-2">Message to seller</Text>
            <TextInput
              className="bg-white rounded-2xl px-4 py-3.5 text-gray-800 text-base"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, height: 88, textAlignVertical: 'top' }}
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

      {/* Submit */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16), shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 10 }}
      >
        {selectedListing && (
          <View className="flex-row items-center bg-violet-50 rounded-2xl px-4 py-3 mb-3 border border-violet-200">
            <Ionicons name="swap-horizontal" size={16} color="#7C3AED" />
            <Text className="text-violet-700 text-sm font-medium ml-2 flex-1" numberOfLines={1}>
              Offering: {selectedListing.name}
            </Text>
            {cashTopUp ? (
              <Text className="text-violet-600 text-xs font-semibold">+₱{parseInt(cashTopUp).toLocaleString()}</Text>
            ) : null}
          </View>
        )}
        <TouchableOpacity
          className="rounded-2xl py-4 items-center flex-row justify-center"
          style={{
            backgroundColor: isValid ? '#7C3AED' : '#E5E7EB',
            shadowColor: isValid ? '#7C3AED' : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: isValid ? 6 : 0,
          }}
          activeOpacity={isValid ? 0.85 : 1}
          onPress={handleSubmit}
        >
          <Ionicons name={sent ? 'checkmark-circle' : 'swap-horizontal'} size={18} color={isValid ? '#fff' : '#9CA3AF'} />
          <Text className="font-bold text-base ml-2" style={{ color: isValid ? '#fff' : '#9CA3AF' }}>
            {sent ? 'Offer Sent!' : 'Send Swap Offer'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
