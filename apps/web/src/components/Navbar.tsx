'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/market', label: 'Market' },
  { href: '/sell', label: 'Sell' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 w-full z-50 bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-[1280px] mx-auto px-6 h-[72px] flex items-center gap-8">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/ReSoleLogo.png"
            alt="Resole Sneakers"
            width={108}
            height={36}
            priority
            className="object-contain"
          />
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'pb-1 text-[14px] font-semibold leading-5 tracking-[0.05em] border-b-2 transition-colors duration-200',
                  isActive
                    ? 'text-primary border-primary'
                    : 'text-on-surface-variant border-transparent hover:text-primary',
                ].join(' ')}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Search bar */}
        <div className="flex-1 max-w-sm mx-auto hidden lg:block">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search marketplace..."
              className="w-full bg-surface-container-low rounded-full py-2.5 pl-10 pr-4 text-[16px] leading-6 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto">
          <Link
            href="/inbox"
            className="relative p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">inbox</span>
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full" />
          </Link>

          <Link
            href="/profile"
            className="p-1 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[40px]">account_circle</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
