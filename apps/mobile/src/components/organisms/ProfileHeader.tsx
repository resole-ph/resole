import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface ProfileHeaderProps {
  onSettingsPress?: () => void;
}

export default function ProfileHeader({ onSettingsPress }: ProfileHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between bg-gray-50 px-5 pb-4"
      style={{ paddingTop: insets.top + 8 }}
    >
      <Text className="text-2xl font-semibold text-gray-900">Profile</Text>

      <TouchableOpacity
        className="w-10 h-10 rounded-full bg-white items-center justify-center"
        activeOpacity={0.7}
        onPress={onSettingsPress}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 6,
          elevation: 3,
        }}
      >
        <Ionicons name="settings-outline" size={20} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
}
