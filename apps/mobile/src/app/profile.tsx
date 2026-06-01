import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import BottomNav from '@/components/organisms/BottomNav';
import ProfileHeader from '@/components/organisms/ProfileHeader';
import UserInfoCard from '@/components/organisms/UserInfoCard';
import ProfileMenuList from '@/components/organisms/ProfileMenuList';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      <ProfileHeader onSettingsPress={() => router.push('/profile/settings')} />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        <UserInfoCard />
        <ProfileMenuList />
      </ScrollView>
      <BottomNav activeTab="profile" onFabPress={() => router.push('/sell' as any)} />
    </View>
  );
}
