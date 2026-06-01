import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from '@/components/organisms/BottomNav';

export default function MarketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-gray-50">
      <View style={{ paddingTop: insets.top + 8 }} className="px-5 pb-4">
        <Text className="text-2xl font-semibold text-gray-900">Market</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-400">Coming soon</Text>
      </View>
      <BottomNav activeTab="market" onFabPress={() => router.push('/sell' as any)} />
    </View>
  );
}
