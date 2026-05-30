import { View } from 'react-native';
import { Redirect } from 'expo-router';
import BottomNav from '@/components/organisms/BottomNav';
import { useOnboardingStore } from '@/store/onboarding';

export default function HomeScreen() {
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding/step1" />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Content area — remaining components will go here */}
      <View className="flex-1" />
      <BottomNav activeTab="home" />
    </View>
  );
}
