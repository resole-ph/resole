import ProfileSidebar from '@/features/profile/components/ProfileSidebar';
import UserInfoHeader from '@/features/profile/components/UserInfoHeader';
import RewardsBento from '@/features/profile/components/RewardsBento';
import ListingsCarousel from '@/features/profile/components/ListingsCarousel';
import RecycleDonateSection from '@/features/profile/components/RecycleDonateSection';
import TransactionHistory from '@/features/profile/components/TransactionHistory';
import MobileBottomNav from '@/features/profile/components/MobileBottomNav';

export default function ProfilePage() {
  return (
    <>
      <div className="pb-24 md:pb-8 max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        <ProfileSidebar />

        <div className="md:col-span-9 flex flex-col gap-8">
          <UserInfoHeader />
          <RewardsBento />
          <ListingsCarousel />
          <RecycleDonateSection />
          <TransactionHistory />
        </div>
      </div>

      <MobileBottomNav />
    </>
  );
}
