import ProfileSidebar from '@/features/profile/components/ProfileSidebar';
import MobileBottomNav from '@/features/profile/components/MobileBottomNav';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pb-24 md:pb-8 max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        <ProfileSidebar />

        <div className="md:col-span-9 flex flex-col gap-4">{children}</div>
      </div>

      <MobileBottomNav />
    </>
  );
}
