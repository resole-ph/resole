import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SubScreenHeader from '@/components/organisms/SubScreenHeader';
import { MsgTab, Message } from '@/features/inbox/types/inbox.types';
import { InboxService } from '@/features/inbox/services/inbox.service';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};

function Avatar({ color, initial, icon, isSystem }: {
  color: string;
  initial: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isSystem?: boolean;
}) {
  return (
    <View
      className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
      style={{ backgroundColor: color }}
    >
      {isSystem && icon ? (
        <Ionicons name={icon} size={22} color="#2563EB" />
      ) : (
        <Text className="text-blue-700 font-bold text-base">{initial}</Text>
      )}
    </View>
  );
}

function MessageRow({ msg, onPress }: { msg: Message; onPress: () => void }) {
  const isUnread = msg.unread > 0;
  return (
    <TouchableOpacity
      className="flex-row items-center px-5 py-3.5 border-b border-gray-50"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Avatar
        color={msg.avatarColor || '#EFF6FF'}
        initial={msg.avatarInitial}
        icon={msg.icon}
        isSystem={msg.isSystem}
      />

      <View className="flex-1 mr-2">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text className={`text-sm ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
            {msg.sender}
          </Text>
          <Text className={`text-xs ${isUnread ? 'text-blue-600 font-semibold' : 'text-gray-300'}`}>
            {msg.time}
          </Text>
        </View>
        <Text
          className={`text-xs leading-relaxed ${isUnread ? 'text-gray-700' : 'text-gray-400'}`}
          numberOfLines={2}
        >
          {msg.preview}
        </Text>
      </View>

      {isUnread ? (
        <View className="w-5 h-5 rounded-full bg-blue-600 items-center justify-center ml-1">
          <Text className="text-white text-xs font-bold">{msg.unread}</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#E5E7EB" />
      )}
    </TouchableOpacity>
  );
}

export default function InboxScreen() {
  const router = useRouter();

  const [tab, setTab] = useState<MsgTab>('all');
  const [conversations, setConversations] = useState<Message[]>([]);

  useEffect(() => {
    const getConversations = async () => {
      const data = await InboxService.getConversations();
      setConversations(data);
    }

    getConversations();
  }, []);

  const TAB_LABELS: { id: MsgTab; label: string }[] = [
    { id: 'all',     label: 'All' },
    { id: 'offers',  label: 'Offers' },
    { id: 'updates', label: 'Updates' },
  ];

  const filtered = tab === 'all' ? conversations : conversations.filter((m) => m.tab === tab);
  const totalUnread = conversations.reduce((n, m) => n + m.unread, 0);

  return (
    <View className="flex-1 bg-gray-50">
      <SubScreenHeader
        title="Inbox"
        rightElement={
          totalUnread > 0 ? (
            <View className="bg-blue-600 rounded-full px-2.5 py-0.5">
              <Text className="text-white text-xs font-bold">{totalUnread} new</Text>
            </View>
          ) : undefined
        }
      />

      {/* Tab switcher */}
      <View className="flex-row mx-5 bg-gray-100 rounded-2xl p-1 mb-2">
        {TAB_LABELS.map(({ id, label }) => (
          <TouchableOpacity
            key={id}
            className={`flex-1 py-2 rounded-xl items-center ${tab === id ? 'bg-white' : ''}`}
            activeOpacity={0.7}
            onPress={() => setTab(id)}
            style={tab === id ? CARD_SHADOW : undefined}
          >
            <Text className={`text-xs font-semibold ${tab === id ? 'text-gray-900' : 'text-gray-400'}`}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 bg-white mx-5 rounded-2xl" style={CARD_SHADOW} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        {filtered.length === 0 ? (
          <View className="items-center py-20">
            <Ionicons name="mail-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 text-sm mt-3">No messages here</Text>
          </View>
        ) : (
          filtered.map((msg) => (
            <MessageRow
              key={msg.id}
              msg={msg}
              onPress={() => router.push(`/inbox/${msg.id}` as any)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
