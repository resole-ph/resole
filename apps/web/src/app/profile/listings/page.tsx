import MyListingsView from '@/features/profile/components/MyListingsView';

export default function MyListingsPage() {
  return (
    <>
      <div>
        <h1 className="text-[24px] leading-8 font-bold text-on-surface">My Listings</h1>
        <p className="text-[14px] text-on-surface-variant mt-1">Items currently for sale or swap</p>
      </div>

      <MyListingsView />
    </>
  );
}
