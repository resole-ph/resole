import ProfileSidebar from '@/features/profile/components/ProfileSidebar';
import UserInfoHeader from '@/features/profile/components/UserInfoHeader';
import MyListingsPreviewCard from '@/features/profile/components/MyListingsPreviewCard';
import FavouritesPreviewCard from '@/features/profile/components/FavouritesPreviewCard';
import QuickLinksCard from '@/features/profile/components/QuickLinksCard';
import SellerAnalyticsCard from '@/features/profile/components/SellerAnalyticsCard';
import MobileBottomNav from '@/features/profile/components/MobileBottomNav';

export default function ProfilePage() {
  return (
    <>
      <div className="pb-24 md:pb-8 max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        <ProfileSidebar />

        <div className="md:col-span-9 flex flex-col gap-4">
          <UserInfoHeader />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MyListingsPreviewCard />
            <FavouritesPreviewCard />
          </div>

          <QuickLinksCard />
          <SellerAnalyticsCard />
        </div>
      </div>

      <MobileBottomNav />
    </>
  );
}
