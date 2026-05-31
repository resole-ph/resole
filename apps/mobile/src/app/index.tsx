import { ScrollView, View } from 'react-native';
import BottomNav from '@/components/organisms/BottomNav';
import Header from '@/components/organisms/Header';
import SearchBar from '@/components/organisms/SearchBar';
import HeroBanner from '@/components/organisms/HeroBanner';
import StatsRow from '@/components/organisms/StatsRow';
import CategoriesRow from '@/components/organisms/CategoriesRow';
import BrowseFeed from '@/components/organisms/BrowseFeed';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <Header name="Miguel" hasNotifications />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        <SearchBar />
        <HeroBanner />
        <StatsRow />
        <CategoriesRow />
        <BrowseFeed />
      </ScrollView>

      <BottomNav activeTab="home" />
    </View>
  );
}
