import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SubScreenHeader from '@/components/organisms/SubScreenHeader';
import { useNotificationsStore, type Notification } from '@/store/notifications';

const DAY = 1000 * 60 * 60 * 24;

function groupNotifications(notifications: Notification[]) {
  const now = Date.now();
  const groups: { label: string; items: Notification[] }[] = [
    { label: 'Today',     items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Earlier',   items: [] },
  ];

  for (const n of notifications) {
    const age = now - n.timestamp;
    if (age < DAY)          groups[0].items.push(n);
    else if (age < DAY * 2) groups[1].items.push(n);
    else                    groups[2].items.push(n);
  }

  return groups.filter((g) => g.items.length > 0);
}

function NotifRow({ notif }: { notif: Notification }) {
  const markRead = useNotificationsStore((s) => s.markRead);

  return (
    <TouchableOpacity
      className="flex-row items-start px-4 py-3.5"
      activeOpacity={0.7}
      onPress={() => markRead(notif.id)}
    >
      {/* Icon */}
      <View
        className="w-10 h-10 rounded-2xl items-center justify-center mt-0.5 mr-3 flex-shrink-0"
        style={{ backgroundColor: notif.iconBg }}
      >
        <Ionicons name={notif.icon as any} size={18} color={notif.iconColor} />
      </View>

      {/* Content */}
      <View className="flex-1 mr-2">
        <Text
          className={`text-sm leading-snug ${notif.read ? 'text-gray-600 font-medium' : 'text-gray-900 font-bold'}`}
          numberOfLines={1}
        >
          {notif.title}
        </Text>
        <Text className="text-gray-400 text-xs leading-relaxed mt-0.5" numberOfLines={2}>
          {notif.body}
        </Text>
        <Text className="text-gray-300 text-xs mt-1">{notif.timeLabel}</Text>
      </View>

      {/* Unread dot */}
      {!notif.read && (
        <View className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
      )}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const { notifications, markAllRead } = useNotificationsStore();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const groups = groupNotifications(notifications);

  return (
    <View className="flex-1 bg-gray-50">
      <SubScreenHeader
        title="Notifications"
        rightElement={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
              <Text className="text-blue-600 text-sm font-medium">Mark all read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Ionicons name="notifications-outline" size={36} color="#D1D5DB" />
          </View>
          <Text className="text-gray-900 font-semibold text-base">You're all caught up</Text>
          <Text className="text-gray-400 text-sm mt-1">No new notifications.</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {groups.map((group) => (
            <View key={group.label} className="mb-2">
              {/* Section label */}
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 pt-4 pb-1">
                {group.label}
              </Text>

              {/* Cards */}
              <View
                className="bg-white mx-4 rounded-2xl overflow-hidden"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                {group.items.map((notif, idx) => (
                  <View key={notif.id}>
                    <NotifRow notif={notif} />
                    {idx < group.items.length - 1 && (
                      <View className="h-px bg-gray-50 ml-16" />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
