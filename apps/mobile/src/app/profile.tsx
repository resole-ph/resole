import { View } from 'react-native';
import BottomNav from '@/components/organisms/BottomNav';
import ProfileHeader from '@/components/organisms/ProfileHeader';

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <ProfileHeader />
      {/* Profile components will slot in here */}
      <View className="flex-1" />
      <BottomNav activeTab="profile" />
    </View>
  );
}
