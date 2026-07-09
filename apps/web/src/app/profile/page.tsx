import UserInfoHeader from '@/features/profile/components/UserInfoHeader';
import RecycleCoinsCard from '@/features/profile/components/RecycleCoinsCard';
import MyListingsPreviewCard from '@/features/profile/components/MyListingsPreviewCard';
import FavouritesPreviewCard from '@/features/profile/components/FavouritesPreviewCard';
import QuickLinksCard from '@/features/profile/components/QuickLinksCard';
import SellerAnalyticsCard from '@/features/profile/components/SellerAnalyticsCard';

export default function ProfilePage() {
  return (
    <>
      <UserInfoHeader />
      <RecycleCoinsCard />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MyListingsPreviewCard />
        <FavouritesPreviewCard />
      </div>

      <QuickLinksCard />
      <SellerAnalyticsCard />
    </>
  );
}
