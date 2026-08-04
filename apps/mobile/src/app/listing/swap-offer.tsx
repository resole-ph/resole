import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Keyboard,
  TextInput, Image, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { GuardedTouchableOpacity } from '@/components/atoms/GuardedTouchableOpacity';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Listing } from '@/components/molecules/ListingCard';
import { ListingService } from '@/features/listing/services/listing.service';
import { OfferService } from '@/features/offer/services/offer.service';
import { usePreferencesStore } from '@/store/preferences';
import { formatSize } from '@/features/shoe/utils/size-conversion';

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

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [cashTopUp, setCashTopUp]   = useState('');
  const [notes, setNotes]           = useState('');
  const [sent, setSent]             = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isValid, setIsValid]       = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const sizeSystem = usePreferencesStore((s) => s.sizeSystem);

  useEffect(() => {
    const fetchListing = async () => {
      const listing = await ListingService.getListingById(Number(listingId));
      setSelectedListing(listing);
      setIsValid(!!listing);
    };
    
    const fetchUserListings = async () => {
      const data = await ListingService.getUserListings() || [];
      setUserListings(data)
    };

    fetchListing();
    fetchUserListings();
  }, [listingId]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  async function submitSwapOffer() {
    if (!isValid || !selectedId || isSubmitting) return;

    setIsConfirming(false);
    setIsSubmitting(true);
    try {
      await OfferService.createSwap(Number(listingId), [selectedId], notes || `Hello! Please check out my swap offer for your ${selectedListing?.model || 'shoe'}!`);

      setSent(true);
      setTimeout(() => {
        setSent(false);
        router.dismissAll();
        router.push('/inbox' as any);
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit() {
    if (!isValid || !selectedId || isSubmitting || isConfirming || sent) return;

    setIsConfirming(true);
    Alert.alert(
      'Send swap offer?',
      `Send your swap offer for ${selectedListing?.model ?? 'this listing'}?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setIsConfirming(false) },
        { text: 'Send Offer', onPress: () => void submitSwapOffer() },
      ],
      { cancelable: true, onDismiss: () => setIsConfirming(false) },
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, padding: 0 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : (keyboardVisible ? 'height' : undefined)} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* Header */}
      <View
        className="flex-row items-center bg-white px-5 pb-4 border-b border-gray-100"
        style={{ paddingTop: insets.top + 12 }}
      >
        <GuardedTouchableOpacity
          className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-3"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color="#111827" />
        </GuardedTouchableOpacity>
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

          {userListings?.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center" style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#E5E7EB' }}>
              <Ionicons name="cube-outline" size={32} color="#9CA3AF" />
              <Text className="text-gray-500 font-semibold mt-3 text-center">No listings yet</Text>
              <Text className="text-gray-400 text-sm text-center mt-1">
                You need at least one AI-evaluated listing to make a swap offer.
              </Text>
              <GuardedTouchableOpacity
                className="mt-4 bg-violet-600 rounded-full px-6 py-3"
                onPress={() => router.push('/sell' as any)}
                activeOpacity={0.85}
              >
                <Text className="text-white font-bold">List a Shoe</Text>
              </GuardedTouchableOpacity>
            </View>
          ) : (
            <View className="gap-3">
              {userListings?.map((item) => {
                const selected = selectedId === Number(item.id);
                const condColor = CONDITION_COLORS[item.condition] ?? '#9CA3AF';
                return (
                  <GuardedTouchableOpacity
                    key={item.id}
                    onPress={() => setSelectedId(selected ? null : Number(item.id))}
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
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }} numberOfLines={1}>{item.model}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                        {/* Condition badge */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: condColor + '18', borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 }}>
                          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: condColor, marginRight: 4 }} />
                          <Text style={{ fontSize: 11, fontWeight: '600', color: condColor }}>{item.condition}</Text>
                        </View>
                        {/* Rated capsule */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280' }}>Rated: {item.conditionScore}</Text>
                        </View>
                        {item.size && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 }}>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280' }}>Size: {formatSize(Number(item.size), sizeSystem)}</Text>
                          </View>
                        )}
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
                  </GuardedTouchableOpacity>
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
        className="bg-white border-t border-gray-100 px-5 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16), shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 10 }}
      >
        {selectedListing && (
          <View className="flex-row items-center bg-violet-50 rounded-2xl px-4 py-3 mb-3 border border-violet-200">
            <Ionicons name="swap-horizontal" size={16} color="#7C3AED" />
            <Text className="text-violet-700 text-sm font-medium ml-2 flex-1" numberOfLines={1}>
              Offering for: {selectedListing.model}
            </Text>
          </View>
        )}
        <GuardedTouchableOpacity
          className="rounded-2xl py-4 items-center flex-row justify-center"
          style={{
            backgroundColor: isValid && !isSubmitting && !isConfirming && !sent ? '#7C3AED' : '#E5E7EB',
            shadowColor: isValid && !isSubmitting && !isConfirming && !sent ? '#7C3AED' : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: isValid && !isSubmitting && !isConfirming && !sent ? 6 : 0,
          }}
          activeOpacity={isValid && !isSubmitting && !isConfirming && !sent ? 0.85 : 1}
          onPress={handleSubmit}
          disabled={!isValid || isSubmitting || isConfirming || sent}
        >
          <Ionicons name={sent ? 'checkmark-circle' : 'swap-horizontal'} size={18} color={isValid && !isSubmitting && !isConfirming ? '#fff' : '#9CA3AF'} />
          <Text className="font-bold text-base ml-2" style={{ color: isValid && !isSubmitting && !isConfirming ? '#fff' : '#9CA3AF' }}>
            {isSubmitting ? 'Sending...' : sent ? 'Offer Sent!' : 'Send Swap Offer'}
          </Text>
        </GuardedTouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
