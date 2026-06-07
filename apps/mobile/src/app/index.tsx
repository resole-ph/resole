import { ScrollView, View, TouchableOpacity, Text } from 'react-native';
import { useEffect, useState, useMemo } from 'react';
import { Redirect, useRouter } from 'expo-router';
import BottomNav from '@/components/organisms/BottomNav';
import Header from '@/components/organisms/Header';
import SearchBar from '@/components/organisms/SearchBar';
import HeroBanner from '@/components/organisms/HeroBanner';
import StatsRow from '@/components/organisms/StatsRow';
import CategoriesRow from '@/components/organisms/CategoriesRow';
import BrowseFeed from '@/components/organisms/BrowseFeed';
import { useOnboardingStore } from '@/store/onboarding';
import { useNotificationsStore } from '@/store/notifications';

export default function HomeScreen() {
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(
    () => useOnboardingStore.persist.hasHydrated()
  );
  const unreadCount = useNotificationsStore((s) =>
    s.notifications.filter((n) => !n.read).length,
  );

  useEffect(() => {
    if (hydrated) return;
    return useOnboardingStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  if (!hydrated) return null;

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding/step1" />;
  }

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const handleResetOnboarding = () => {
    useOnboardingStore.persist.clearStorage();
    useOnboardingStore.setState({ hasSeenOnboarding: false, intent: 'buy', location: '' });
    router.replace('/onboarding/step1');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Header
        onInboxPress={() => router.push('/inbox' as any)}
        onNotificationPress={() => router.push('/notifications' as any)}
        notificationCount={unreadCount}
      />
      {/* TEMP: dev shortcuts — remove before release */}
      <View className="flex-row gap-2 px-4 py-2 bg-yellow-100 border-b border-yellow-300">
        <TouchableOpacity
          onPress={handleResetOnboarding}
          className="flex-1 items-center rounded-md bg-yellow-400 py-1.5"
        >
          <Text className="text-xs font-semibold text-yellow-900">Onboarding</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/onboarding/auth' as any)}
          className="flex-1 items-center rounded-md bg-yellow-400 py-1.5"
        >
          <Text className="text-xs font-semibold text-yellow-900">Auth</Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-3 pb-1">
          <Text className="text-2xl font-bold text-gray-900">{greeting}, Miguel</Text>
          <Text className="text-sm text-gray-400 mt-0.5">Find your next pair today</Text>
        </View>
        <SearchBar />
        <HeroBanner />
        <StatsRow />
        <CategoriesRow />
        <BrowseFeed />
      </ScrollView>
      <BottomNav activeTab="home" onFabPress={() => router.push('/sell' as any)} />
    </View>
  );
}
