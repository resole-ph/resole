import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, Image,
  Modal, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Listing } from '@/components/molecules/ListingCard';

type OfferSummary = {
  type: 'sale' | 'swap' | 'donation';
  details: { price?: string; items?: { itemId: number }[] } | null;
};

interface EditOfferModalProps {
  visible: boolean;
  offer: OfferSummary | null;
  listing: Listing | null;
  swapItem: Listing | null;
  myListings: Listing[] | null;
  isLoadingListings: boolean;
  submitting: boolean;
  onClose: () => void;
  onSave: (payload: { price: number } | { listings: number[] }) => void;
}

export default function EditOfferModal({
  visible, offer, listing, swapItem, myListings, isLoadingListings, submitting, onClose, onSave,
}: EditOfferModalProps) {
  const insets = useSafeAreaInsets();
  const isSwap = offer?.type === 'swap';
  const [price, setPrice] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (!visible) return;
    setPrice(offer?.details?.price ?? '');
    setSelectedId(swapItem ? Number(swapItem.id) : null);
  }, [visible, offer, swapItem]);

  const priceValue = Number.parseFloat(price);
  const isSaleValid = !isSwap && Number.isFinite(priceValue) && priceValue > 0;
  const isSwapValid = isSwap && selectedId != null;
  const canSave = (isSaleValid || isSwapValid) && !submitting;

  function handleSave() {
    if (!canSave) return;
    if (isSwap) {
      if (selectedId == null) return;
      onSave({ listings: [selectedId] });
    } else {
      onSave({ price: priceValue });
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={submitting ? undefined : onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={submitting ? undefined : onClose}
        />
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: Math.max(insets.bottom, 24), maxHeight: '85%' }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>Edit Offer</Text>
            <TouchableOpacity onPress={onClose} disabled={submitting} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 14, padding: 10, marginBottom: 16 }}>
            <View style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: '#F3F4F6', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
              {listing?.imageUrl ? (
                <Image source={{ uri: listing.imageUrl }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Ionicons name="footsteps-outline" size={20} color="#9CA3AF" />
              )}
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }} numberOfLines={1}>{listing?.model ?? 'Listing'}</Text>
              {listing?.size && <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Size {listing.size}</Text>}
            </View>
          </View>

          {isSwap ? (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                Choose one of your listings to offer
              </Text>
              {isLoadingListings ? (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <ActivityIndicator color="#2563EB" />
                </View>
              ) : !myListings || myListings.length === 0 ? (
                <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 16 }}>
                  You don&apos;t have any listings available to swap.
                </Text>
              ) : (
                <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
                  <View style={{ gap: 8 }}>
                    {myListings.map((item) => {
                      const selected = selectedId === Number(item.id);
                      return (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => setSelectedId(selected ? null : Number(item.id))}
                          activeOpacity={0.8}
                          style={{
                            flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 14,
                            borderWidth: 1.5, borderColor: selected ? '#2563EB' : '#F3F4F6',
                            backgroundColor: selected ? '#EFF6FF' : '#fff',
                          }}
                        >
                          <View style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: '#F3F4F6', overflow: 'hidden' }}>
                            {item.imageUrl ? (
                              <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} />
                            ) : null}
                          </View>
                          <View style={{ marginLeft: 10, flex: 1 }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }} numberOfLines={1}>{item.model}</Text>
                            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Size {item.size}</Text>
                          </View>
                          {selected && <Ionicons name="checkmark-circle" size={20} color="#2563EB" />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              )}
            </View>
          ) : (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Offer price</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 14 }}>
                <Text style={{ fontSize: 15, color: '#9CA3AF', marginRight: 6 }}>₱</Text>
                <TextInput
                  value={price}
                  onChangeText={(v) => setPrice(v.replace(/[^0-9.]/g, ''))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: '#111827' }}
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSave}
            style={{ backgroundColor: canSave ? '#2563EB' : '#E5E7EB', borderRadius: 18, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12 }}
            activeOpacity={canSave ? 0.85 : 1}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: canSave ? '#fff' : '#9CA3AF', fontSize: 16, fontWeight: '700' }}>Save changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
