import { View } from 'react-native';
import BottomNav from '@/components/organisms/BottomNav';
import Header from '@/components/organisms/Header';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <Header name="Miguel" hasNotifications />
      {/* Content area — remaining components will go here */}
      <View className="flex-1" />
      <BottomNav activeTab="home" />
    </View>
  );
}
