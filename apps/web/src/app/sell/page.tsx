import { Suspense } from 'react';
import SellWizard from '@/features/sell/components/SellWizard';

export default function SellPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant text-[14px] mt-4 font-medium">Loading...</p>
      </div>
    }>
      <SellWizard />
    </Suspense>
  );
}
