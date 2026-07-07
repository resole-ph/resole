import RecycleCoinsCard from '@/features/profile/components/RecycleCoinsCard';
import RewardsSections from '@/features/profile/components/RewardsSections';

export default function RewardsPage() {
  return (
    <>
      <div>
        <h1 className="text-[24px] leading-8 font-bold text-on-surface">Rewards</h1>
        <p className="text-[14px] text-on-surface-variant mt-1">
          Earn Recycle Coins by donating or recycling your kicks
        </p>
      </div>

      <RecycleCoinsCard />
      <RewardsSections />
    </>
  );
}
