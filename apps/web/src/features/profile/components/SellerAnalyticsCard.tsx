'use client';

import { useSellerAnalytics } from '../queries/profile.queries';
import type { AnalyticsMetric } from '../types/profile.types';

/**
 * Week-over-week change. With no prior week to compare against, a percentage
 * is meaningless — the endpoint is new enough that most accounts will hit
 * this — so show a dash rather than a fabricated "+100%".
 */
function toDelta(metric: AnalyticsMetric | undefined) {
  if (!metric || metric.lastWeek === 0) {
    return { delta: '—', up: true };
  }

  const change = Math.round((metric.lastWeek > 0 ? (metric.thisWeek - metric.lastWeek) / metric.lastWeek * 100 : metric.thisWeek > 0 ? 100 : 0) * 100) / 100;
  const rounded = Math.round(change);

  return { delta: `${rounded >= 0 ? '+' : ''}${rounded}%`, up: rounded >= 0 };
}

export default function SellerAnalyticsCard() {
  // Was three hardcoded figures ("1,240" profile views, "+18%") shown
  // identically to every account. /api/users/me/seller-analytics returns real
  // totals plus this-week/last-week counts, which is where the deltas come from.
  const { data } = useSellerAnalytics();

  const METRICS = [
    { label: 'Profile Views', metric: data?.profileViews },
    { label: 'Listing Views', metric: data?.listingViews },
    { label: 'Saves', metric: data?.listingSaves },
  ].map(({ label, metric }) => ({
    label,
    value: (metric?.total ?? 0).toLocaleString(),
    ...toDelta(metric),
  }));

  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">bar_chart</span>
        </div>
        <h4 className="text-[14px] font-semibold text-on-surface">Seller Analytics</h4>
      </div>

      <div className="grid grid-cols-3 divide-x divide-surface-variant">
        {METRICS.map(({ label, value, delta, up }) => (
          <div key={label} className="px-4 first:pl-0 last:pr-0">
            <p className="text-[20px] leading-6 font-bold text-on-surface">{value}</p>
            <p className="text-[13px] text-on-surface-variant mt-0.5">{label}</p>
            <div className="flex items-center gap-0.5 mt-1.5">
              <span
                className={`material-symbols-outlined text-[14px] ${up ? 'text-secondary' : 'text-error'}`}
              >
                {up ? 'trending_up' : 'trending_down'}
              </span>
              <span className={`text-[12px] font-semibold ${up ? 'text-secondary' : 'text-error'}`}>
                {delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[12px] text-on-surface-variant mt-4">Compared to last 7 days</p>
    </div>
  );
}
