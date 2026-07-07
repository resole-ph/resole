import { useState, useEffect } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Listing } from '@/components/molecules/ListingCard';
import { ListingService } from '@/features/listing/services/listing.service';
import { OfferService } from '@/features/offer/services/offer.service';

export const CONDITION_COLORS: Record<Listing['condition'], string> = {
  'Like New':  '#10B981',
  'Excellent': '#3B82F6',
  'Good':      '#F59E0B',
  'Fair':      '#9CA3AF',
  'Poor':      '#EF4444',
};

const BTN_SHADOW = (color: string) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.35,
  shadowRadius: 8,
  elevation: 6,
});

export default function ListingDetailScreen() {
  const id  = Number(useLocalSearchParams<{ id: string }>());
  const insets = useSafeAreaInsets();

  const [showBuyModal, setShowBuyModal]     = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice]         = useState('');
  const [offerNote, setOfferNote]           = useState('');
  const [buyConfirmed, setBuyConfirmed]     = useState(false);
  const [offerSent, setOfferSent]           = useState(false);
  const [listing, setListing]               = useState<Listing | null>(null);
  const [similarListings, setSimilarListings] = useState<Listing[] | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const fetchedListing = await ListingService.getListingById(id);
      setListing(fetchedListing);
      
      if (fetchedListing && fetchedListing.model) {
        const similarData = await ListingService.getSimilarListings(fetchedListing.model);
        setSimilarListings(similarData);
      }
    };

    loadData();
  }, [id]);

  if (!listing) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
        <Text className="text-gray-400 mt-3">Listing not found</Text>
        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-blue-600 font-medium">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isSwappable   = listing.listingMode === 'Swap';
  const conditionColor = CONDITION_COLORS[listing.condition];

  const similarItems = similarListings?.filter(
    (l) => l.id !== listing.id && (l.brand === listing.brand || l.listingMode === listing.listingMode)
  ).slice(0, 6) || [];

  function handleSwap() {
    
    router.push({
      pathname: '/listing/swap-offer',
      params: {
        listingId:    listing!.id,
        listingName:  listing!.model,
        listingPrice: listing!.price,
        listingImage: listing!.imageUrl,
      },
    });
  }

  async function handleSendOffer() {
    if (!id) return;
    
    await OfferService.createSale(id, Number(offerPrice) || 0, offerNote || `Hello! I am interested, and will offer to pay the full price of ₱${offerPrice}`);
    
    setOfferSent(true);
    setTimeout(() => {
      setOfferSent(false);
      setShowOfferModal(false);
      setOfferPrice('');
      setOfferNote('');
      router.push('/inbox' as any);
    }, 1200);
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Back button */}
      <TouchableOpacity
        className="absolute z-10 w-10 h-10 rounded-full bg-white items-center justify-center"
        style={{ top: insets.top + 12, left: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 }}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color="#111827" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Image
          source={{ uri: listing.imageUrl }}
          style={{ width: '100%', height: 300, backgroundColor: '#F3F4F6' }}
          resizeMode="cover"
        />

        <View className="px-5 pt-5">
          {/* Brand + condition */}
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-gray-400 text-sm font-medium">{listing.brand}</Text>
            <View className="flex-row items-center rounded-full px-2.5 py-1" style={{ backgroundColor: conditionColor + '18' }}>
              <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: conditionColor }} />
              <Text className="text-xs font-semibold" style={{ color: conditionColor }}>{listing.condition}</Text>
            </View>
          </View>

          <Text className="text-gray-900 text-2xl font-bold mb-1">{listing.model}</Text>
          {listing.size && <Text className="text-gray-400 text-sm mb-4">Size: {listing.size}</Text>}

          <View className="flex-row items-center mb-6">
            <Text className="text-blue-600 text-3xl font-bold">₱{listing.price.toLocaleString()}</Text>
            {listing.originalPrice && (
              <Text className="text-gray-400 text-base line-through ml-3">₱{listing.originalPrice.toLocaleString()}</Text>
            )}
          </View>

          <View className="h-px bg-gray-100 mb-5" />

          {/* Seller */}
          <Text className="text-gray-900 font-bold text-base mb-3">Seller</Text>
          <TouchableOpacity
            className="flex-row items-center bg-white rounded-2xl p-4 mb-6"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
            activeOpacity={0.8}
          >
            <View className="w-12 h-12 rounded-full items-center justify-center mr-3" style={{ backgroundColor: (listing.seller.avatarColor ?? '#2563EB') + '20' }}>
              <Text className="text-lg font-bold" style={{ color: listing.seller.avatarColor ?? '#2563EB' }}>{listing.seller.name[0].toUpperCase()}</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-gray-900 font-semibold text-sm mr-1">@{listing.seller.name}</Text>
                {listing.seller.verified && (
                  <View className="w-4 h-4 rounded-full bg-blue-600 items-center justify-center">
                    <Ionicons name="checkmark" size={9} color="#fff" />
                  </View>
                )}
              </View>
              <View className="flex-row items-center mt-0.5">
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text className="text-gray-500 text-xs ml-1">{listing.seller.rating?.toFixed(1) || 0} · {listing.seller.totalSales ?? 0} sales</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Description */}
          <Text className="text-gray-900 font-bold text-base mb-3">Description</Text>
          <Text className="text-gray-600 text-sm leading-relaxed mb-6">{listing.description ?? 'No description provided.'}</Text>

          {/* Similar items */}
          {similarItems.length > 0 && (
            <>
              <View className="h-px bg-gray-100 mb-5" />
              <Text className="text-gray-900 font-bold text-base mb-3">Similar Items</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {similarItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    style={{ width: '47%' }}
                    onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })}
                  >
                    <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: 120, borderRadius: 14, backgroundColor: '#F3F4F6' }} resizeMode="cover" />
                    <Text className="text-gray-400 text-xs mt-2">{item.brand}</Text>
                    <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>{item.model}</Text>
                    <Text className="text-blue-600 font-bold text-sm">₱{item.price.toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16), shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 10 }}
      >
        {isSwappable ? (
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 rounded-2xl py-4 items-center justify-center flex-row"
              activeOpacity={0.85}
              onPress={() => setShowBuyModal(true)}
              style={{ backgroundColor: '#059669', ...BTN_SHADOW('#059669') }}
            >
              <Ionicons name="bag-handle-outline" size={18} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">Buy Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-2xl py-4 items-center flex-row justify-center"
              activeOpacity={0.85}
              onPress={handleSwap}
              style={{ backgroundColor: '#7C3AED', ...BTN_SHADOW('#7C3AED') }}
            >
              <Ionicons name="swap-horizontal" size={18} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">Swap Offer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 rounded-2xl py-4 items-center justify-center flex-row"
              activeOpacity={0.85}
              onPress={() => { setOfferPrice(String(listing.price)); setShowOfferModal(true); }}
              style={{ backgroundColor: '#D97706', ...BTN_SHADOW('#D97706') }}
            >
              <Ionicons name="pricetag-outline" size={18} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">Make Offer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-2xl py-4 items-center justify-center flex-row"
              activeOpacity={0.85}
              onPress={() => setShowBuyModal(true)}
              style={{ backgroundColor: '#059669', ...BTN_SHADOW('#059669') }}
            >
              <Ionicons name="bag-handle-outline" size={18} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">Buy Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Buy Now modal ── */}
      <Modal visible={showBuyModal} transparent animationType="slide" onRequestClose={() => setShowBuyModal(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => setShowBuyModal(false)} />
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: Math.max(insets.bottom, 24) }}>
          {/* Handle */}
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 }} />

          <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>Order Summary</Text>

          {/* Item row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 12, marginBottom: 20 }}>
            <Image source={{ uri: listing.imageUrl }} style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#F3F4F6' }} resizeMode="cover" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 2 }}>{listing.brand}</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }} numberOfLines={2}>{listing.model}</Text>
              {listing.size && <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Size: {listing.size}</Text>}
            </View>
          </View>

          {/* Price breakdown */}
          <View style={{ gap: 10, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>Item price</Text>
              <Text style={{ fontSize: 14, color: '#111827', fontWeight: '500' }}>₱{listing.price.toLocaleString()}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>Meet-up / shipping</Text>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>To be arranged</Text>
            </View>
            <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>Total</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#059669' }}>₱{listing.price.toLocaleString()}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSendOffer}
            style={{ backgroundColor: buyConfirmed ? '#059669' : '#059669', borderRadius: 18, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, ...BTN_SHADOW('#059669') }}
            activeOpacity={0.85}
          >
            <Ionicons name={buyConfirmed ? 'checkmark-circle' : 'bag-handle-outline'} size={20} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{buyConfirmed ? 'Order Placed!' : 'Confirm Purchase'}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── Make Offer modal ── */}
      <Modal visible={showOfferModal} transparent animationType="slide" onRequestClose={() => setShowOfferModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => setShowOfferModal(false)} />
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: Math.max(insets.bottom, 24) }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 }} />

            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 }}>Make an Offer</Text>
            <Text style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>Listed at ₱{listing.price.toLocaleString()}</Text>

            {/* Offer price input */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Your offer price</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 14, paddingHorizontal: 14, borderWidth: 1.5, borderColor: offerPrice ? '#D97706' : '#E5E7EB', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, color: '#6B7280', marginRight: 4 }}>₱</Text>
              <TextInput
                value={offerPrice}
                onChangeText={(v) => setOfferPrice(v.replace(/[^0-9]/g, ''))}
                placeholder={String(listing.price)}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                style={{ flex: 1, paddingVertical: 14, fontSize: 18, fontWeight: '700', color: '#111827' }}
              />
            </View>

            {/* Note */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Message to seller (optional)</Text>
            <TextInput
              value={offerNote}
              onChangeText={setOfferNote}
              placeholder="e.g. Can we meet in BGC this weekend?"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              style={{ backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, fontSize: 14, color: '#111827', textAlignVertical: 'top', minHeight: 80, borderWidth: 1.5, borderColor: '#E5E7EB', marginBottom: 20 }}
            />

            <TouchableOpacity
              onPress={offerPrice ? handleSendOffer : undefined}
              style={{ backgroundColor: offerPrice ? '#D97706' : '#E5E7EB', borderRadius: 18, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, ...(offerPrice ? BTN_SHADOW('#D97706') : {}) }}
              activeOpacity={offerPrice ? 0.85 : 1}
            >
              <Ionicons name={offerSent ? 'checkmark-circle' : 'pricetag-outline'} size={20} color={offerPrice ? '#fff' : '#9CA3AF'} />
              <Text style={{ color: offerPrice ? '#fff' : '#9CA3AF', fontSize: 16, fontWeight: '700' }}>
                {offerSent ? 'Offer Sent!' : 'Send Offer'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
