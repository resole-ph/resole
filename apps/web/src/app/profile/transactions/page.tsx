import Link from 'next/link';
import TransactionsTabs from '@/features/profile/components/TransactionsTabs';

export default function TransactionsPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <Link
          href="/profile"
          className="flex items-center gap-1 text-on-surface-variant hover:text-primary text-[14px] font-semibold w-fit transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to profile
        </Link>

        <div>
          <h1 className="text-[24px] leading-8 font-bold text-on-surface">Transactions</h1>
          <p className="text-[14px] text-on-surface-variant mt-1">Sales, swaps, and donations</p>
        </div>

        <TransactionsTabs />
      </div>
    </div>
  );
}
