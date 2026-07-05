'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { icon: 'person', label: 'Profile', href: '/profile' },
  { icon: 'list_alt', label: 'My Listings', href: null },
  { icon: 'eco', label: 'Rewards', href: null },
  { icon: 'favorite', label: 'Favourites', href: null },
  { icon: 'receipt_long', label: 'Transactions', href: '/profile/transactions' },
];

export default function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:col-span-3 flex-col gap-6">
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-2">
          {NAV_ITEMS.map(({ icon, label, href }) => {
            const isActive = href !== null && pathname === href;
            const className = [
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left',
              isActive
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant hover:bg-surface-container',
            ].join(' ');

            if (href) {
              return (
                <Link key={label} href={href} className={className}>
                  <span className="material-symbols-outlined">{icon}</span>
                  <span className="text-[14px] font-semibold tracking-[0.05em]">{label}</span>
                </Link>
              );
            }

            return (
              <button key={label} className={className}>
                <span className="material-symbols-outlined">{icon}</span>
                <span className="text-[14px] font-semibold tracking-[0.05em]">{label}</span>
              </button>
            );
          })}

          <hr className="my-2 border-surface-variant" />

          <Link
            href="/profile/settings"
            className={[
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
              pathname === '/profile/settings'
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant hover:bg-surface-container',
            ].join(' ')}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-[14px] font-semibold tracking-[0.05em]">Settings</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
