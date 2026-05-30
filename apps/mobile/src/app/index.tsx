import { View } from 'react-native';
import { useRouter } from 'expo-router';
import BottomNav from '@/components/organisms/BottomNav';
import Header from '@/components/organisms/Header';
import SearchBar from '@/components/organisms/SearchBar';
import HeroBanner from '@/components/organisms/HeroBanner';
import StatsRow from '@/components/organisms/StatsRow';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      <Header name="Miguel" hasNotifications />
      <SearchBar />
      <HeroBanner />
      <StatsRow />
      {/* Content area — remaining components will go here */}
      <View className="flex-1" />
      <BottomNav
        activeTab="home"
        onTabPress={(tab) => {
          if (tab === 'profile') router.push('/profile');
        }}
      />
    </View>
  );
}
