import { View } from 'react-native';
import BottomNav from '@/components/organisms/BottomNav';
import ProfileHeader from '@/components/organisms/ProfileHeader';
import UserInfoCard from '@/components/organisms/UserInfoCard';

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <ProfileHeader />
      <UserInfoCard />
      {/* Profile components will slot in here */}
      <View className="flex-1" />
      <BottomNav />
    </View>
  );
}
