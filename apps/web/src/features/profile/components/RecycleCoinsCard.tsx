'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProfileClient } from '../services/profile.client';

export default function RecycleCoinsCard() {
  const [coins, setCoins] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const stats = await ProfileClient.getMyStats();
        setCoins(Number(stats.coinBalance ?? 0));
      } catch {
        setCoins(0);
      }
    })();
  }, []);

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
