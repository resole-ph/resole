import { View } from 'react-native';
import BottomNav from '@/components/organisms/BottomNav';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      {/* Content area — remaining components will go here */}
      <View className="flex-1" />
      <BottomNav activeTab="home" />
    </View>
  );
}
