import { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// ─── Types ──────────────────────────────────────────────────────────────────

type BubbleFrom = 'me' | 'them' | 'system';

type OfferData = {
  type: 'buy' | 'swap';
  item: string;
  size: string;
  price?: string;
  swapItem?: string;
  color: string;
  status: 'pending' | 'accepted' | 'declined';
};

type ChatMsg = {
  id: string;
  from: BubbleFrom;
  text?: string;
  time: string;
  seen?: boolean;
  offer?: OfferData;
};

type ConvoMeta = {
  sender: string;
  avatarColor: string;
  avatarInitial: string;
  isSystem: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  isOnline?: boolean;
  subtitle: string;
  messages: ChatMsg[];
};

// ─── Conversation data ───────────────────────────────────────────────────────

const CONVOS: Record<string, ConvoMeta> = {
  m1: {
    sender: '@jmendoza',
    avatarColor: '#DBEAFE',
    avatarInitial: 'J',
    isSystem: false,
    isOnline: true,
    subtitle: 'Online now',
    messages: [
      { id: '1', from: 'them', text: 'Hey! Is the Jordan 1 Retro High still available?', time: '9:20 AM' },
      { id: '2', from: 'me',   text: 'Yes it is! Which size are you looking for?', time: '9:22 AM' },
      { id: '3', from: 'them', text: "Size 10.5. It's listed at ₱18k — any chance you'd take ₱16,000? I can pick up in BGC today.", time: '9:24 AM' },
      {
        id: '4', from: 'them', time: '9:25 AM',
        offer: {
          type: 'buy', item: 'Jordan 1 Retro High OG', size: '10.5',
          price: '₱16,000', color: '#DBEAFE', status: 'pending',
        },
      },
      { id: '5', from: 'them', text: 'I can also bring cash if that makes it easier 🙏', time: '9:41 AM' },
    ],
  },

  m2: {
    sender: 'Resole',
    avatarColor: '#EFF6FF',
    avatarInitial: 'R',
    isSystem: true,
    icon: 'cube-outline',
    subtitle: 'Order updates',
    messages: [
      { id: '1', from: 'system', text: 'Order ORD-001 confirmed.', time: 'May 29, 9:12 AM' },
      { id: '2', from: 'system', text: 'Your Nike Air Max 90 has been picked up by J&T Express.', time: 'May 30, 2:45 PM' },
      { id: '3', from: 'system', text: 'Package is in transit. Tracking: JT8273910284', time: 'May 31, 8:00 AM' },
      { id: '4', from: 'system', text: 'Your order is now out for delivery. Expected by 3 PM today.', time: '8:15 AM' },
    ],
  },

  m3: {
    sender: '@kevinr',
    avatarColor: '#EDE9FE',
    avatarInitial: 'K',
    isSystem: false,
    isOnline: false,
    subtitle: 'Last seen yesterday',
    messages: [
      { id: '1', from: 'me',   text: 'Thanks for checking out the Panda Dunk!', time: '2:10 PM' },
      { id: '2', from: 'them', text: 'Love the listing. Really clean pair. I have a DS NB 550 in size 10 — great condition, would you consider a swap?', time: '2:15 PM' },
      {
        id: '3', from: 'them', time: '2:16 PM',
        offer: {
          type: 'swap', item: 'Nike Dunk Low Panda', size: '10',
          swapItem: 'New Balance 550', color: '#EDE9FE', status: 'pending',
        },
      },
      { id: '4', from: 'them', text: 'Both DS, never worn. Let me know what you think!', time: '2:18 PM' },
    ],
  },

  m4: {
    sender: 'Resole',
    avatarColor: '#EFF6FF',
    avatarInitial: 'R',
    isSystem: true,
    icon: 'bar-chart-outline',
    subtitle: 'Listing insights',
    messages: [
      { id: '1', from: 'system', text: 'Your listing "Adidas Samba OG" is getting traction!', time: 'Yesterday, 8:00 AM' },
      { id: '2', from: 'system', text: '48 profile views this week — up 22% from last week.', time: 'Yesterday, 8:00 AM' },
      { id: '3', from: 'system', text: 'Tip: Listings with 5+ photos get 3× more offers. Add more photos to boost visibility.', time: 'Yesterday, 8:01 AM' },
    ],
  },

  m5: {
    sender: '@amirag',
    avatarColor: '#D1FAE5',
    avatarInitial: 'A',
    isSystem: false,
    isOnline: false,
    subtitle: 'Last seen Monday',
    messages: [
      { id: '1', from: 'them', text: 'Hi! Is the Adidas Samba OG still available?', time: '11:00 AM' },
      { id: '2', from: 'me',   text: "Yes it is! Still looking for the right buyer.", time: '11:05 AM' },
      { id: '3', from: 'them', text: "Great condition from the photos! Would you do ₱7,500 cash? I'm near Quezon City.", time: '11:08 AM' },
      { id: '4', from: 'me',   text: "I was hoping for closer to ₱7,800 since it's deadstock. But open to meeting halfway.", time: '11:10 AM' },
      { id: '5', from: 'them', text: 'Deal at ₱7,650? Meet-up on Friday works for me.', time: '11:12 AM' },
      { id: '6', from: 'me',   text: "₱7,650 works. Let's lock in Friday afternoon — I'll DM you the spot.", time: '11:14 AM', seen: true },
    ],
  },

  m6: {
    sender: 'Resole',
    avatarColor: '#EFF6FF',
    avatarInitial: 'R',
    isSystem: true,
    icon: 'heart-outline',
    subtitle: 'Donation & rewards',
    messages: [
      { id: '1', from: 'system', text: 'Pickup confirmed! Your Converse Chuck 70 has been collected.', time: 'May 22, 10:00 AM' },
      { id: '2', from: 'system', text: 'Drop-off verified at Gawad Kalinga partner site.', time: 'May 22, 3:15 PM' },
      { id: '3', from: 'system', text: 'Donation confirmed! You earned +80 Recycle Coins. Total balance: 1,240 coins 🌱', time: 'May 22, 4:00 PM' },
    ],
  },

  m7: {
    sender: '@lramos',
    avatarColor: '#FCE7F3',
    avatarInitial: 'L',
    isSystem: false,
    isOnline: false,
    subtitle: 'Last seen May 20',
    messages: [
      { id: '1', from: 'me',   text: 'Hey! Just wanted to let you know the NB 550 arrived safe.', time: '1:00 PM' },
      { id: '2', from: 'them', text: 'Awesome! Really glad to hear that. How does it look?', time: '1:30 PM' },
      { id: '3', from: 'me',   text: 'Pristine condition, exactly as described. Really happy with the swap.', time: '1:32 PM' },
      { id: '4', from: 'them', text: 'The Panda Dunk just arrived too — absolutely clean. Thanks for the smooth transaction!', time: '2:00 PM' },
      { id: '5', from: 'me',   text: 'Likewise! Would trade with you again anytime 🤝', time: '2:05 PM' },
      { id: '6', from: 'them', text: 'Same here! Take care 👟', time: '2:06 PM', seen: true },
    ],
  },

  m8: {
    sender: 'Resole Support',
    avatarColor: '#FEF3C7',
    avatarInitial: 'S',
    isSystem: true,
    icon: 'shield-checkmark-outline',
    subtitle: 'Support',
    messages: [
      { id: '1', from: 'system', text: 'We received your dispute for order DON-002.', time: 'May 16, 2:00 PM' },
      { id: '2', from: 'system', text: 'Our team is reviewing the case. Expected resolution in 2 business days.', time: 'May 16, 2:01 PM' },
      { id: '3', from: 'system', text: 'Update: The seller has been notified and asked to respond within 24 hours.', time: 'May 17, 10:30 AM' },
      { id: '4', from: 'system', text: 'Dispute resolved in your favour. A refund of ₱200 will be credited to your wallet within 3–5 business days.', time: 'May 18, 9:00 AM' },
    ],
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};

function ConvoHeader({ meta, onBack }: { meta: ConvoMeta; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row items-center bg-white border-b border-gray-100 px-4 pb-3"
      style={{ paddingTop: insets.top + 8, ...CARD_SHADOW }}
    >
      <TouchableOpacity
        className="w-9 h-9 items-center justify-center mr-2"
        activeOpacity={0.7}
        onPress={onBack}
      >
        <Ionicons name="chevron-back" size={22} color="#6B7280" />
      </TouchableOpacity>

      {/* Avatar */}
      <View
        className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
        style={{ backgroundColor: meta.avatarColor }}
      >
        {meta.isSystem && meta.icon ? (
          <Ionicons name={meta.icon} size={18} color="#2563EB" />
        ) : (
          <Text className="text-blue-700 font-bold">{meta.avatarInitial}</Text>
        )}
      </View>

      {/* Name + status */}
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-sm">{meta.sender}</Text>
        <View className="flex-row items-center mt-0.5">
          {!meta.isSystem && (
            <View
              className="w-1.5 h-1.5 rounded-full mr-1"
              style={{ backgroundColor: meta.isOnline ? '#10B981' : '#D1D5DB' }}
            />
          )}
          <Text className="text-gray-400 text-xs">{meta.subtitle}</Text>
        </View>
      </View>

    </View>
  );
}

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

function TextBubble({ msg }: { msg: ChatMsg }) {
  const isMe = msg.from === 'me';
  return (
    <View className={`flex-row mb-1 px-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
      <View className="max-w-[78%]">
        <View
          className={`rounded-2xl px-4 py-2.5 ${
            isMe ? 'bg-blue-600 rounded-tr-sm' : 'bg-white rounded-tl-sm'
          }`}
          style={isMe ? undefined : CARD_SHADOW}
        >
          <Text className={`text-sm leading-relaxed ${isMe ? 'text-white' : 'text-gray-800'}`}>
            {msg.text}
          </Text>
        </View>
        <View className={`flex-row items-center mt-1 gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <Text className="text-gray-300 text-xs">{msg.time}</Text>
          {isMe && msg.seen && (
            <Text className="text-blue-400 text-xs">· Seen</Text>
          )}
        </View>
      </View>
    </View>
  );
}

function OfferCard({
  msg,
  status,
  onAccept,
  onDecline,
}: {
  msg: ChatMsg;
  status: 'pending' | 'accepted' | 'declined';
  onAccept: () => void;
  onDecline: () => void;
}) {
  const offer = msg.offer!;
  const isSwap = offer.type === 'swap';

  return (
    <View className="px-4 mb-1">
      <View className="bg-white rounded-2xl p-4 max-w-[84%]" style={CARD_SHADOW}>
        {/* Tag */}
        <View className="flex-row items-center mb-3">
          <View className="bg-blue-50 rounded-xl px-2.5 py-1 flex-row items-center">
            <Ionicons
              name={isSwap ? 'swap-horizontal-outline' : 'pricetag-outline'}
              size={12}
              color="#2563EB"
            />
            <Text className="text-blue-600 text-xs font-semibold ml-1">
              {isSwap ? 'Swap Offer' : 'Buy Offer'}
            </Text>
          </View>
        </View>

        {/* Item info */}
        <View
          className="w-full h-20 rounded-xl items-center justify-center mb-3"
          style={{ backgroundColor: offer.color }}
        >
          <Ionicons name="footsteps-outline" size={28} color="#9CA3AF" />
        </View>

        {isSwap ? (
          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-gray-900 font-semibold text-sm flex-1" numberOfLines={1}>
                {offer.swapItem}
              </Text>
              <Ionicons name="swap-horizontal" size={16} color="#9CA3AF" />
              <Text className="text-gray-900 font-semibold text-sm flex-1 text-right" numberOfLines={1}>
                {offer.item}
              </Text>
            </View>
            <Text className="text-gray-400 text-xs mb-3">Size {offer.size} · Even swap</Text>
          </View>
        ) : (
          <View className="mb-3">
            <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>{offer.item}</Text>
            <Text className="text-gray-400 text-xs">Size {offer.size}</Text>
            <Text className="text-blue-600 font-bold text-lg mt-1">{offer.price}</Text>
          </View>
        )}

        {/* Actions */}
        {status === 'pending' ? (
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 bg-gray-100 rounded-xl py-2.5 items-center"
              activeOpacity={0.7}
              onPress={onDecline}
            >
              <Text className="text-gray-600 font-semibold text-xs">Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-600 rounded-xl py-2.5 items-center"
              activeOpacity={0.7}
              onPress={onAccept}
            >
              <Text className="text-white font-semibold text-xs">Accept</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            className={`rounded-xl py-2.5 items-center flex-row justify-center gap-1.5 ${
              status === 'accepted' ? 'bg-green-50' : 'bg-gray-100'
            }`}
          >
            <Ionicons
              name={status === 'accepted' ? 'checkmark-circle' : 'close-circle'}
              size={15}
              color={status === 'accepted' ? '#10B981' : '#9CA3AF'}
            />
            <Text
              className={`font-semibold text-xs ${
                status === 'accepted' ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {status === 'accepted' ? 'Offer accepted' : 'Offer declined'}
            </Text>
          </View>
        )}
      </View>

      <Text className="text-gray-300 text-xs mt-1 ml-1">{msg.time}</Text>
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
    <View
      className="bg-white border-t border-gray-100 px-4 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
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
          className={`w-11 h-11 rounded-full items-center justify-center ${
            text.trim() ? 'bg-blue-600' : 'bg-gray-200'
          }`}
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const meta = CONVOS[id ?? ''];

  const [messages, setMessages] = useState<ChatMsg[]>(meta?.messages ?? []);
  const [offerStatuses, setOfferStatuses] = useState<Record<string, 'pending' | 'accepted' | 'declined'>>(() => {
    const init: Record<string, 'pending' | 'accepted' | 'declined'> = {};
    meta?.messages.forEach((m) => { if (m.offer) init[m.id] = m.offer.status; });
    return init;
  });

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  }, []);

  const handleSend = (text: string) => {
    const newMsg: ChatMsg = {
      id: String(Date.now()),
      from: 'me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  if (!meta) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Ionicons name="mail-outline" size={48} color="#D1D5DB" />
        <Text className="text-gray-400 text-sm mt-3">Conversation not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ConvoHeader meta={meta} onBack={() => router.back()} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((msg) => {
            if (msg.from === 'system') {
              return <SystemBubble key={msg.id} text={msg.text!} time={msg.time} />;
            }
            if (msg.offer) {
              return (
                <OfferCard
                  key={msg.id}
                  msg={msg}
                  status={offerStatuses[msg.id] ?? 'pending'}
                  onAccept={() => setOfferStatuses((s) => ({ ...s, [msg.id]: 'accepted' }))}
                  onDecline={() => setOfferStatuses((s) => ({ ...s, [msg.id]: 'declined' }))}
                />
              );
            }
            return <TextBubble key={msg.id} msg={msg} />;
          })}
        </ScrollView>

        {meta.isSystem ? (
          <View className="bg-white border-t border-gray-100 py-3 items-center">
            <Text className="text-gray-400 text-xs">This is a system notification — replies are not supported</Text>
          </View>
        ) : (
          <InputBar onSend={handleSend} />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
