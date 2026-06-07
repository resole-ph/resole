import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const resoleLogo = require('../../../assets/ReSoleLogo.png');

const ICON_BTN_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 6,
  elevation: 3,
};

interface HeaderProps {
  title?: string;
  branded?: boolean;
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
  title,
  branded: brandedProp = false,
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
  const branded = brandedProp || !!title;

  return (
    <View
      className={`flex-row items-center justify-between px-5 pb-4 ${branded ? 'bg-white' : 'bg-gray-50'}`}
      style={{ paddingTop: insets.top + 8 }}
    >
      {/* Left: logo */}
      <View style={{ flex: 1 }}>
        <Image source={resoleLogo} style={{ height: 34, width: 146 }} resizeMode="contain" />
      </View>

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
