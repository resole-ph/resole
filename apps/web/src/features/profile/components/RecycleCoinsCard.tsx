'use client';

import Link from 'next/link';
import { useMyStats } from '../queries/profile.queries';

export default function RecycleCoinsCard() {
  // Shares the ['profile','me','stats'] cache entry with UserInfoHeader. On
  // /profile both mount together and this resolves from the same single
  // request; on /profile/rewards it usually resolves from cache outright.
  const { data: stats, isPending, isError } = useMyStats();

  // Same fallback as before: a failed load shows zero rather than an error,
  // but "still loading" stays as the em dash so the two aren't confused.
  const coins = isPending ? null : isError ? 0 : Number(stats?.coinBalance ?? 0);

  return (
    <div className="bg-secondary text-on-secondary p-8 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[14px] font-semibold tracking-[0.1em] opacity-80 uppercase">
              Available Balance
            </p>
            <h2 className="text-[40px] leading-[48px] font-bold tracking-tight mt-2">
              {coins === null ? '—' : coins.toLocaleString()} Recycle Coins
            </h2>
          </div>
          <span className="material-symbols-outlined text-[48px]">eco</span>
        </div>
        <p className="text-[16px] mt-4 max-w-xs opacity-90">
          Redeem these for platform fees, shipping labels, or exclusive sneaker drops.
        </p>
      </div>
      <div className="mt-8 flex gap-3">
        <Link
          href="/profile/rewards"
          className="bg-white text-secondary px-6 py-2 rounded-full text-[14px] font-semibold hover:bg-surface-bright transition-colors"
        >
          Redeem Now
        </Link>
        <Link
          href="/profile/rewards"
          className="bg-white/15 border border-white/30 text-white px-6 py-2 rounded-full text-[14px] font-semibold hover:bg-white/25 transition-colors"
        >
          View Perks
        </Link>
      </div>
    </div>
  );
}
