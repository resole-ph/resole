import PublicProfileView from '@/features/profile/components/PublicProfileView';

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="pt-6 md:pt-8 pb-24 md:pb-8 max-w-[1280px] mx-auto px-6">
      <PublicProfileView userId={id} />
    </div>
  );
}
