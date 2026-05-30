import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

interface HeaderProps {
  name?: string;
  hasNotifications?: boolean;
  onNotificationPress?: () => void;
}

export default function Header({
  name = 'Miguel',
  hasNotifications = true,
  onNotificationPress,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between bg-gray-50 px-5 pb-4"
      style={{ paddingTop: insets.top + 8 }}
    >
      {/* Greeting */}
      <View className="flex-1 mr-4">
        <Text className="text-2xl font-bold text-gray-900" numberOfLines={1}>
          {getGreeting()}, {name}
        </Text>
        <Text className="text-sm text-gray-400 mt-0.5">
          Find your next pair today
        </Text>
      </View>

      {/* Notification bell */}
      <TouchableOpacity
        className="w-11 h-11 rounded-full bg-white items-center justify-center"
        activeOpacity={0.7}
        onPress={onNotificationPress}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 6,
          elevation: 3,
        }}
      >
        <Ionicons name="notifications-outline" size={22} color="#111827" />
        {hasNotifications && (
          <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 border border-white" />
        )}
      </TouchableOpacity>
    </View>
  );
}
