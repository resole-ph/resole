import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface SubScreenHeaderProps {
  title: string;
  rightElement?: React.ReactNode;
}

export default function SubScreenHeader({ title, rightElement }: SubScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      className="flex-row items-center bg-gray-50 px-5 pb-4"
      style={{ paddingTop: insets.top + 8 }}
    >
      <TouchableOpacity
        className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3"
        activeOpacity={0.7}
        onPress={() => router.back()}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 6,
          elevation: 3,
        }}
      >
        <Ionicons name="chevron-back" size={20} color="#6B7280" />
      </TouchableOpacity>
      <Text className="flex-1 text-xl font-semibold text-gray-900">{title}</Text>
      {rightElement}
    </View>
  );
}
