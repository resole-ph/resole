import { View } from 'react-native';
import BottomNav from '@/components/organisms/BottomNav';
import Header from '@/components/organisms/Header';
import SearchBar from '@/components/organisms/SearchBar';
import HeroBanner from '@/components/organisms/HeroBanner';
import StatsRow from '@/components/organisms/StatsRow';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <Header name="Miguel" hasNotifications />
      <SearchBar />
      <HeroBanner />
      <StatsRow />
      {/* Content area — remaining components will go here */}
      <View className="flex-1" />
      <BottomNav activeTab="home" />
    </View>
  );
}
