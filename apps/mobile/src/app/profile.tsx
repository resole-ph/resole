import { View, ScrollView } from 'react-native';
import BottomNav from '@/components/organisms/BottomNav';
import ProfileHeader from '@/components/organisms/ProfileHeader';
import UserInfoCard from '@/components/organisms/UserInfoCard';
import ProfileMenuList from '@/components/organisms/ProfileMenuList';

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <ProfileHeader />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        <UserInfoCard />
        <ProfileMenuList />
      </ScrollView>
      <BottomNav />
    </View>
  );
}
