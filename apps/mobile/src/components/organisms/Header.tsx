import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const ICON_BTN_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 6,
  elevation: 3,
};

interface HeaderProps {
  name?: string;
  title?: string;
  hasNotifications?: boolean;
  notificationCount?: number;
  hasMessages?: boolean;
  showInbox?: boolean;
  showCart?: boolean;
  cartCount?: number;
  onNotificationPress?: () => void;
  onInboxPress?: () => void;
  onCartPress?: () => void;
}

export default function Header({
  name = 'Miguel',
  title,
  hasNotifications = true,
  notificationCount,
  hasMessages = true,
  showInbox = true,
  showCart = false,
  cartCount,
  onNotificationPress,
  onInboxPress,
  onCartPress,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const branded = !!title;

  return (
    <View
      className={`flex-row items-center justify-between px-5 pb-4 ${branded ? 'bg-white' : 'bg-gray-50'}`}
      style={{ paddingTop: insets.top + 8 }}
    >
      {/* Left: branded title or greeting */}
      {branded ? (
        <Text style={{ color: '#2563EB', fontWeight: '800', fontSize: 19, letterSpacing: -0.5, flex: 1 }}>
          {title}
        </Text>
      ) : (
        <View className="flex-1 mr-4">
          <Text className="text-2xl font-bold text-gray-900" numberOfLines={1}>
            {getGreeting()}, {name}
          </Text>
          <Text className="text-sm text-gray-400 mt-0.5">Find your next pair today</Text>
        </View>
      )}

      {/* Inbox icon (home mode only) */}
      {showInbox && (
        <TouchableOpacity
          className="w-11 h-11 rounded-full bg-white items-center justify-center mr-2"
          activeOpacity={0.7}
          onPress={onInboxPress}
          style={ICON_BTN_SHADOW}
        >
          <Ionicons name="mail-outline" size={22} color="#111827" />
          {hasMessages && (
            <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 border border-white" />
          )}
        </TouchableOpacity>
      )}

      {/* Cart icon (market mode) */}
      {showCart && (
        <TouchableOpacity activeOpacity={0.7} onPress={onCartPress} style={{ marginRight: 16 }}>
          <Ionicons name="cart-outline" size={23} color="#374151" />
          {cartCount != null && cartCount > 0 && (
            <View style={{ position: 'absolute', top: -3, right: -5, backgroundColor: '#2563EB', borderRadius: 8, width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 8, fontWeight: '800' }}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Notification bell */}
      <TouchableOpacity
        className={branded ? '' : 'w-11 h-11 rounded-full bg-white items-center justify-center'}
        activeOpacity={0.7}
        onPress={onNotificationPress}
        style={branded ? {} : ICON_BTN_SHADOW}
      >
        <Ionicons name="notifications-outline" size={22} color="#374151" />
        {notificationCount != null && notificationCount > 0 ? (
          <View style={{ position: 'absolute', top: -3, right: -4, backgroundColor: '#2563EB', borderRadius: 8, width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 8, fontWeight: '800' }}>{notificationCount}</Text>
          </View>
        ) : hasNotifications && !branded ? (
          <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 border border-white" />
        ) : null}
      </TouchableOpacity>
    </View>
  );
}
