import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Keyboard,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InboxService, RESOLE_THREAD_ID } from '@/features/inbox/services/inbox.service';
import { SystemUpdate } from '@/features/inbox/types/inbox.types';
import { OfferService } from '@/features/offer/services/offer.service';
import { ListingService } from '@/features/listing/services/listing.service';
import { UserService } from '@/features/user/services/user.service';
import { TransactionService } from '@/features/transaction/services/transaction.service';
import { Listing } from '@/components/molecules/ListingCard';
import RatingModal from '@/components/organisms/RatingModal';
import OfferCard from '@/components/organisms/OfferCard';

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
  sender, avatarInitial, avatarColor, isSystem, onBack, onPressProfile,
}: {
  sender: string;
  avatarInitial: string;
  avatarColor: string;
  isSystem: boolean;
  onBack: () => void;
  onPressProfile?: () => void;
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

      <TouchableOpacity
        className="flex-1 flex-row items-center"
        activeOpacity={onPressProfile ? 0.7 : 1}
        onPress={onPressProfile}
        disabled={!onPressProfile}
      >
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
      </TouchableOpacity>
    </View>
  );
}

// ─── Bubbles ─────────────────────────────────────────────────────────────────

function UpdateBubble({ update }: { update: SystemUpdate }) {
  return (
    <View className="items-start my-2 px-4">
      <View className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs flex-row items-start gap-3">
        <View className="w-8 h-8 rounded-full bg-white items-center justify-center">
          <Ionicons name={update.icon} size={16} color="#2563EB" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 text-sm font-semibold">{update.title}</Text>
          <Text className="text-gray-500 text-xs leading-relaxed mt-0.5">{update.body}</Text>
        </View>
      </View>
      <Text className="text-gray-300 text-xs mt-1 ml-1">{update.time}</Text>
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

function InputBar({ onSend, disabled }: { onSend: (text: string) => void, disabled: boolean }) {
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
          activeOpacity={!text.trim() || disabled ? 0.6 : 0.85}
          onPress={handleSend}
          disabled={!text.trim() || disabled}
        >
          <Ionicons name="arrow-up" size={20} color={text.trim() && !disabled ? '#fff' : '#9CA3AF'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ConversationScreen() {
  const params = useLocalSearchParams<{
    id: string; sender?: string; avatarInitial?: string; avatarColor?: string; isSystem?: string; otherUserId?: string;
  }>();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const rawId = params.id ?? '';
  const isSystemRoute = rawId === RESOLE_THREAD_ID;
  const numericId = Number(rawId.slice(1));

  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [isLoadingSend, setIsLoadingSend] = useState(false);
  const [pendingOffer, setPendingOffer] = useState<{ id: number; action: 'accept' | 'decline' } | null>(null);

  const [notFound, setNotFound] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [offersById, setOffersById] = useState<Record<number, any>>({});
  const [offerExtrasById, setOfferExtrasById] = useState<Record<number, { listing: Listing | null; swapItem: Listing | null }>>({});

  const [updates, setUpdates] = useState<SystemUpdate[]>([]);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  const [ratingTarget, setRatingTarget] = useState<{ transactionId: number; rateeId: string; rateeName: string; raterRole: 'seller' | 'recipient' | undefined } | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [skippedRatingIds, setSkippedRatingIds] = useState<Set<number>>(new Set());

  const loadConversation = useCallback(async () => {
    setIsLoadingConversation(true);
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
      setIsLoadingConversation(false);
    }
  }, [numericId]);

  const loadUpdates = useCallback(async () => {
    setIsLoadingConversation(true);
    try {
      const conversations = await InboxService.getConversations();
      const item = conversations.find((m) => m.id === RESOLE_THREAD_ID);
      if (!item) {
        setNotFound(true);
        return;
      }
      setUpdates(item.updates ?? []);
      await InboxService.markNotificationsRead(item.notificationIds).catch(() => {});
    } catch (error) {
      console.error('Failed to load updates:', error);
      setNotFound(true);
    } finally {
      setIsLoadingConversation(false);
    }
  }, []);

  // Refetch on every focus, not just mount — this screen can stay mounted in the
  // stack while the other party accepts/rates elsewhere, or while switching
  // accounts, so a mount-only effect can leave currentUserId/offers stale.
  useFocusEffect(
    useCallback(() => {
      UserService.getUserInfo().then((user) => setCurrentUserId(user.id)).catch(() => {});
      if (isSystemRoute) {
        loadUpdates();
      } else {
        loadConversation();
      }
    }, [isSystemRoute, loadConversation, loadUpdates])
  );

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  }, [messages.length]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);
  
  // Both seller and recipient should be allowed to submit a rating — prompt
  // them once they land on a conversation with an accepted-but-unrated offer.
  useEffect(() => {
    if (!currentUserId || ratingTarget) return;

    const pending = Object.values(offersById).find(
      (offer: any) =>
        offer.isAccepted === true &&
        !offer.isRated &&
        (offer.recipientId === currentUserId || offer.listing.sellerId === currentUserId) &&
        !skippedRatingIds.has(offer.id)
    );

    if (!pending) return;

    let ratee = null;
    let raterRole: 'seller' | 'recipient' | null = null;

    if (pending.recipientId === currentUserId) {
      ratee = offerExtrasById[pending.id]?.listing?.seller;
      raterRole = 'recipient';
    } else if (pending.listing?.sellerId === currentUserId) {
      ratee = offersById[pending.id]?.recipient;
      raterRole = 'seller';
    }

    if (ratee && raterRole) {
      setRatingTarget({
        transactionId: pending.id,
        rateeId: ratee.id,
        rateeName: ratee.name,
        raterRole,
      });
    } 
  }, [currentUserId, offersById, offerExtrasById, skippedRatingIds, ratingTarget]);

  const handleSend = async (text: string) => {
    try {
      setIsLoadingSend(true);
      const res = await InboxService.sendMessage(numericId, text);
      setMessages((prev) => [...prev, res.message]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoadingSend(false);
    }
  };

  const handleAccept = async (transactionId: number) => {
    try {
      setPendingOffer({ id: transactionId, action: 'accept' });
      await OfferService.acceptOffer(transactionId);
      setOffersById((prev) => ({ ...prev, [transactionId]: { ...prev[transactionId], isAccepted: true } }));
    } catch (error) {
      console.error('Failed to accept offer:', error);
    } finally {
      setPendingOffer(null);
    }
  };

  const handleDecline = async (transactionId: number) => {
    try {
      setPendingOffer({ id: transactionId, action: 'decline' });
      await OfferService.declineOffer(transactionId);
      setOffersById((prev) => ({ ...prev, [transactionId]: { ...prev[transactionId], isAccepted: false } }));
    } catch (error) {
      console.error('Failed to decline offer:', error);
    } finally {
      setPendingOffer(null);
    }
  };

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!ratingTarget) return;
    try {
      setIsSubmittingRating(true);
      await TransactionService.submitRating(ratingTarget.transactionId, rating, ratingTarget.rateeId, comment, ratingTarget.raterRole);
      setOffersById((prev) => ({
        ...prev,
        [ratingTarget.transactionId]: { ...prev[ratingTarget.transactionId], isRated: true },
      }));
      setRatingTarget(null);
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleSkipRating = () => {
    if (!ratingTarget) return;
    setSkippedRatingIds((prev) => new Set(prev).add(ratingTarget.transactionId));
    setRatingTarget(null);
  };

  if (isLoadingConversation) {
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
          {updates.map((update) => (
            <UpdateBubble key={update.id} update={update} />
          ))}
        </ScrollView>
        <View className="bg-white border-t border-gray-100 py-3 items-center">
          <Text className="text-gray-400 text-xs">This is a system notification — replies are not supported</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ConvoHeader
        sender={sender}
        avatarInitial={avatarInitial}
        avatarColor={avatarColor}
        isSystem={false}
        onBack={() => router.back()}
        onPressProfile={params.otherUserId ? () => router.push(`/profile/${params.otherUserId}` as any) : undefined}
      />

      <KeyboardAvoidingView 
        style={{ flex: 1, padding: 0 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : (keyboardVisible ? 'height' : undefined)} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
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
                    type={offerItem.type}
                    listing={extras?.listing ?? null}
                    swapItem={extras?.swapItem ?? null}
                    price={offerItem.details?.price}
                    status={getOfferStatus(offerItem)}
                    canRespond={!!currentUserId && !!extras?.listing && extras.listing.seller.id === currentUserId}
                    onAccept={() => handleAccept(offerItem.id)}
                    onDecline={() => handleDecline(offerItem.id)}
                    time={new Date(msg.createdAt).toLocaleDateString()}
                    isMe={isMe}
                    isAccepting={!!pendingOffer && pendingOffer.id === offerItem.id && pendingOffer.action === 'accept'}
                    isDeclining={!!pendingOffer && pendingOffer.id === offerItem.id && pendingOffer.action === 'decline'}
                  />
                )}
              </View>
            );
          })}
        </ScrollView>

        <InputBar
          onSend={handleSend}
          disabled={isLoadingSend}
        />
      </KeyboardAvoidingView>

      <RatingModal
        visible={!!ratingTarget}
        targetName={ratingTarget?.rateeName ?? ''}
        submitting={isSubmittingRating}
        onSubmit={handleSubmitRating}
        onSkip={handleSkipRating}
      />
    </View>
  );
}
