'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/market', label: 'Market', icon: 'storefront' },
  { href: '/sell', label: 'Sell', icon: 'add_circle' },
  { href: '/profile', label: 'Profile', icon: 'account_circle' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 md:hidden bg-surface-container-lowest rounded-t-xl shadow-[0px_-4px_20px_rgba(0,0,0,0.05)]">
      {TABS.map(({ href, label, icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={[
              'flex flex-col items-center justify-center gap-0.5 px-4 py-1 rounded-full transition-all duration-200',
              isActive ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant',
            ].join(' ')}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            <span className="text-[14px] font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
