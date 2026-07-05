import TransactionsTabs from '@/features/profile/components/TransactionsTabs';

export default function TransactionsPage() {
  return (
    <>
      <div>
        <h1 className="text-[24px] leading-8 font-bold text-on-surface">Transactions</h1>
        <p className="text-[14px] text-on-surface-variant mt-1">Sales, swaps, and donations</p>
      </div>

      <TransactionsTabs />
    </>
  );
}
