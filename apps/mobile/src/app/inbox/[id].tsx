import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Image, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InboxService } from '@/features/inbox/services/inbox.service';
import { OfferService } from '@/features/offer/services/offer.service';
import { ListingService } from '@/features/listing/services/listing.service';
import { UserService } from '@/features/user/services/user.service';
import { Listing } from '@/components/molecules/ListingCard';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};

type OfferStatus = 'pending' | 'accepted' | 'declined';

function getOfferStatus(offer: any): OfferStatus {
  if (offer.isAccepted === true) return 'accepted';
  if (offer.isAccepted === false) return 'declined';
  return 'pending';
}

// ─── Header ──────────────────────────────────────────────────────────────────

function ConvoHeader({
  sender, avatarInitial, avatarColor, isSystem, onBack,
}: {
  sender: string;
  avatarInitial: string;
  avatarColor: string;
  isSystem: boolean;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row items-center bg-white border-b border-gray-100 px-4 pb-3"
      style={{ paddingTop: insets.top + 8, ...CARD_SHADOW }}
    >
      <TouchableOpacity className="w-9 h-9 items-center justify-center mr-2" activeOpacity={0.7} onPress={onBack}>
        <Ionicons name="chevron-back" size={22} color="#6B7280" />
      </TouchableOpacity>

      <View
        className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
        style={{ backgroundColor: avatarColor || '#EFF6FF' }}
      >
        {isSystem ? (
          <Ionicons name="notifications-outline" size={18} color="#2563EB" />
        ) : (
          <Text className="text-blue-700 font-bold">{avatarInitial}</Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-sm">{sender}</Text>
        {!isSystem && <Text className="text-gray-400 text-xs mt-0.5">Active recently</Text>}
      </View>

      {!isSystem && (
        <View className="w-9 h-9 items-center justify-center">
          <Ionicons name="call-outline" size={18} color="#9CA3AF" />
        </View>
      )}
    </View>
  );
}

// ─── Bubbles ─────────────────────────────────────────────────────────────────

function SystemBubble({ text, time }: { text: string; time: string }) {
  return (
    <View className="items-center my-2 px-8">
      <View className="bg-gray-100 rounded-2xl px-4 py-2.5 max-w-xs">
        <Text className="text-gray-500 text-xs text-center leading-relaxed">{text}</Text>
      </View>
      <Text className="text-gray-300 text-xs mt-1">{time}</Text>
    </View>
  );
}

function TextBubble({ msg, isMe }: { msg: any; isMe: boolean }) {
  return (
    <View className={`flex-row mb-1 px-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
      <View className="max-w-[78%]">
        <View
          className={`rounded-2xl px-4 py-2.5 ${isMe ? 'bg-blue-600 rounded-tr-sm' : 'bg-white rounded-tl-sm'}`}
          style={isMe ? undefined : CARD_SHADOW}
        >
          <Text className={`text-sm leading-relaxed ${isMe ? 'text-white' : 'text-gray-800'}`}>{msg.content}</Text>
        </View>
        <Text className={`text-gray-300 text-xs mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

function OfferCard({
  type, listing, swapItem, price, status, canRespond, onAccept, onDecline, time, isMe,
}: {
  type: 'sale' | 'swap';
  listing: Listing | null;
  swapItem: Listing | null;
  price?: string;
  status: OfferStatus;
  canRespond: boolean;
  onAccept: () => void;
  onDecline: () => void;
  time: string;
  isMe: boolean;
}) {
  const isSwap = type === 'swap';

  return (
    <View className={`px-4 mb-1 ${isMe ? 'items-end' : 'items-start'}`}>
      <View className="bg-white rounded-2xl p-4 max-w-[84%]" style={CARD_SHADOW}>
        <View className="flex-row items-center mb-3">
          <View className="bg-blue-50 rounded-xl px-2.5 py-1 flex-row items-center">
            <Ionicons name={isSwap ? 'swap-horizontal-outline' : 'pricetag-outline'} size={12} color="#2563EB" />
            <Text className="text-blue-600 text-xs font-semibold ml-1">{isSwap ? 'Swap Offer' : 'Buy Offer'}</Text>
          </View>
        </View>

        <View
          className="w-full h-20 rounded-xl items-center justify-center mb-3 overflow-hidden"
          style={{ backgroundColor: '#EFF6FF' }}
        >
          {listing?.imageUrl ? (
            <Image source={{ uri: listing.imageUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Ionicons name="footsteps-outline" size={28} color="#9CA3AF" />
          )}
        </View>

        {isSwap ? (
          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-gray-900 font-semibold text-sm flex-1" numberOfLines={1}>
                {swapItem?.model ?? 'Their listing'}
              </Text>
              <Ionicons name="swap-horizontal" size={16} color="#9CA3AF" />
              <Text className="text-gray-900 font-semibold text-sm flex-1 text-right" numberOfLines={1}>
                {listing?.model ?? 'Your listing'}
              </Text>
            </View>
            <Text className="text-gray-400 text-xs mb-3">Size {listing?.size ?? '—'} · Item swap</Text>
          </View>
        ) : (
          <View className="mb-3">
            <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>{listing?.model ?? 'Listing'}</Text>
            {listing?.size && <Text className="text-gray-400 text-xs">Size {listing.size}</Text>}
            <Text className="text-blue-600 font-bold text-lg mt-1">
              ₱{Number(price ?? 0).toLocaleString()}
            </Text>
          </View>
        )}

        {status === 'pending' ? (
          canRespond ? (
            <View className="flex-row gap-2">
              <TouchableOpacity className="flex-1 bg-gray-100 rounded-xl py-2.5 items-center" activeOpacity={0.7} onPress={onDecline}>
                <Text className="text-gray-600 font-semibold text-xs">Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-blue-600 rounded-xl py-2.5 items-center" activeOpacity={0.7} onPress={onAccept}>
                <Text className="text-white font-semibold text-xs">Accept</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="rounded-xl py-2.5 items-center bg-amber-50 flex-row justify-center gap-1.5">
              <Ionicons name="time-outline" size={15} color="#D97706" />
              <Text className="text-amber-600 font-semibold text-xs">Waiting for seller's response</Text>
            </View>
          )
        ) : (
          <View className={`rounded-xl py-2.5 items-center flex-row justify-center gap-1.5 ${status === 'accepted' ? 'bg-green-50' : 'bg-gray-100'}`}>
            <Ionicons name={status === 'accepted' ? 'checkmark-circle' : 'close-circle'} size={15} color={status === 'accepted' ? '#10B981' : '#9CA3AF'} />
            <Text className={`font-semibold text-xs ${status === 'accepted' ? 'text-green-600' : 'text-gray-400'}`}>
              {status === 'accepted' ? 'Offer accepted' : 'Offer declined'}
            </Text>
          </View>
        )}
      </View>
      <Text className={`text-gray-300 text-xs mt-1 ${isMe ? 'mr-1' : 'ml-1'}`}>{time}</Text>
    </View>
  );
}

function InputBar({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <View className="bg-white border-t border-gray-100 px-4 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
      <View className="flex-row items-end gap-2">
        <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 max-h-28 justify-center">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            placeholderTextColor="#9CA3AF"
            multiline
            className="text-gray-900 text-sm"
            style={{ padding: 0, margin: 0 }}
            returnKeyType="default"
            onSubmitEditing={handleSend}
          />
        </View>
        <TouchableOpacity
          className={`w-11 h-11 rounded-full items-center justify-center ${text.trim() ? 'bg-blue-600' : 'bg-gray-200'}`}
          activeOpacity={0.7}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Ionicons name="arrow-up" size={20} color={text.trim() ? '#fff' : '#9CA3AF'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ConversationScreen() {
  const params = useLocalSearchParams<{
    id: string; sender?: string; avatarInitial?: string; avatarColor?: string; isSystem?: string;
  }>();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const rawId = params.id ?? '';
  const isSystemRoute = rawId.startsWith('u');
  const numericId = Number(rawId.slice(1));

  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Conversation state
  const [messages, setMessages] = useState<any[]>([]);
  const [offersById, setOffersById] = useState<Record<number, any>>({});
  const [offerExtrasById, setOfferExtrasById] = useState<Record<number, { listing: Listing | null; swapItem: Listing | null }>>({});

  // System notification state
  const [notification, setNotification] = useState<any | null>(null);

  const loadConversation = useCallback(async () => {
    setIsLoading(true);
    try {
      const thread = await InboxService.getConversationThread(numericId);
      setMessages(thread.messages ?? []);

      const offers: any[] = thread.offers ?? [];
      setOffersById(Object.fromEntries(offers.map((o) => [o.id, o])));

      const extrasEntries = await Promise.all(
        offers.map(async (offerItem) => {
          const listing = offerItem.listingId
            ? await ListingService.getListingById(offerItem.listingId).catch(() => null)
            : null;

          const firstSwapItem = offerItem.details?.items?.[0];
          const swapItem = firstSwapItem?.itemId
            ? await ListingService.getListingById(firstSwapItem.itemId).catch(() => null)
            : null;

          return [offerItem.id, { listing, swapItem }] as const;
        })
      );
      setOfferExtrasById(Object.fromEntries(extrasEntries));
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [numericId]);

  const loadNotification = useCallback(async () => {
    setIsLoading(true);
    try {
      const conversations = await InboxService.getConversations();
      const item = conversations.find((m) => m.id === rawId);
      if (!item) {
        setNotFound(true);
        return;
      }
      setNotification(item);
      await InboxService.markNotificationRead(numericId).catch(() => {});
    } catch (error) {
      console.error('Failed to load notification:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [rawId, numericId]);

  useEffect(() => {
    UserService.getUserInfo().then((user) => setCurrentUserId(user.id)).catch(() => {});
    if (isSystemRoute) {
      loadNotification();
    } else {
      loadConversation();
    }
  }, [isSystemRoute, loadConversation, loadNotification]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  }, [messages.length]);

  const handleSend = async (text: string) => {
    try {
      const res = await InboxService.sendMessage(numericId, text);
      setMessages((prev) => [...prev, res.message]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleAccept = async (transactionId: number) => {
    try {
      await OfferService.acceptOffer(transactionId);
      setOffersById((prev) => ({ ...prev, [transactionId]: { ...prev[transactionId], isAccepted: true } }));
    } catch (error) {
      console.error('Failed to accept offer:', error);
    }
  };

  const handleDecline = async (transactionId: number) => {
    try {
      await OfferService.declineOffer(transactionId);
      setOffersById((prev) => ({ ...prev, [transactionId]: { ...prev[transactionId], isAccepted: false } }));
    } catch (error) {
      console.error('Failed to decline offer:', error);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (notFound) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Ionicons name="mail-outline" size={48} color="#D1D5DB" />
        <Text className="text-gray-400 text-sm mt-3">Conversation not found</Text>
      </View>
    );
  }

  const sender = params.sender ?? (isSystemRoute ? 'Resole' : 'Conversation');
  const avatarInitial = params.avatarInitial ?? sender.charAt(0).toUpperCase();
  const avatarColor = params.avatarColor ?? '#EFF6FF';

  if (isSystemRoute) {
    return (
      <View className="flex-1 bg-gray-50">
        <ConvoHeader sender={sender} avatarInitial={avatarInitial} avatarColor={avatarColor} isSystem onBack={() => router.back()} />
        <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
          <SystemBubble text={notification?.preview ?? ''} time={notification?.time ?? ''} />
        </ScrollView>
        <View className="bg-white border-t border-gray-100 py-3 items-center">
          <Text className="text-gray-400 text-xs">This is a system notification — replies are not supported</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ConvoHeader sender={sender} avatarInitial={avatarInitial} avatarColor={avatarColor} isSystem={false} onBack={() => router.back()} />

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((msg) => {
            const offerItem = msg.transactionId != null ? offersById[msg.transactionId] : null;
            const extras = msg.transactionId != null ? offerExtrasById[msg.transactionId] : null;
            const isMe = msg.userId === currentUserId;

            return (
              <View key={msg.id}>
                <TextBubble msg={msg} isMe={isMe} />
                {offerItem && (
                  <OfferCard
                    type={offerItem.type === 'swap' ? 'swap' : 'sale'}
                    listing={extras?.listing ?? null}
                    swapItem={extras?.swapItem ?? null}
                    price={offerItem.details?.price}
                    status={getOfferStatus(offerItem)}
                    canRespond={!!currentUserId && !!extras?.listing && extras.listing.seller.id === currentUserId}
                    onAccept={() => handleAccept(offerItem.id)}
                    onDecline={() => handleDecline(offerItem.id)}
                    time={new Date(msg.createdAt).toLocaleDateString()}
                    isMe={isMe}
                  />
                )}
              </View>
            );
          })}
        </ScrollView>

        <InputBar onSend={handleSend} />
      </KeyboardAvoidingView>
    </View>
  );
}
