'use client';

import StepHeader from './StepHeader';
import type { AiAnalysisResult } from '../types/sell.types';
import { getConditionLabel } from '../utils/condition';

interface AiResultsStepProps {
  isAnalyzing: boolean;
  error: string | null;
  result: AiAnalysisResult | null;
  onBack: () => void;
  onContinue: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-outline-variant last:border-0">
      <span className="text-[13px] font-semibold text-on-surface-variant">{label}</span>
      <span className="text-[14px] text-on-surface text-right">{value}</span>
    </div>
  );
}

export default function AiResultsStep({
  isAnalyzing,
  error,
  result,
  onBack,
  onContinue,
}: AiResultsStepProps) {
  return (
    <div>
      <StepHeader title="AI Results" stepLabel="Step 2 of 4" onBack={onBack} />

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="w-16 h-16 rounded-full bg-secondary-container/30 flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-primary text-[32px]">auto_awesome</span>
          </div>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-on-surface">Analyzing your shoes...</p>
            <p className="text-[13px] text-on-surface-variant mt-1">
              Our AI is identifying details and estimating value.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 py-16 px-4 text-center">
          <span className="material-symbols-outlined text-error text-[40px]">error</span>
          <p className="text-[14px] text-error">{error}</p>
        </div>
      )}

      {result && (
        <>
          <p className="text-[14px] text-on-surface-variant mb-4">
            Review the details and continue to finalize your listing.
          </p>

          <div className="rounded-2xl bg-primary text-on-primary p-5 shadow-[0px_6px_20px_rgba(0,74,198,0.25)]">
            <div className="flex items-center gap-1.5 mb-1 opacity-80">
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              <span className="text-[11px] font-bold tracking-wide">AI VALUATION</span>
            </div>
            <p className="text-[28px] font-bold">
              ₱{Math.round(result.estimatedPrice).toLocaleString()}
            </p>
            <p className="text-[13px] opacity-80 mt-0.5">Estimated resale value</p>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-4 mt-4 shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[18px]">manage_search</span>
              <h3 className="text-[15px] font-bold text-on-surface">AI-Identified Details</h3>
            </div>

            <DetailRow label="Brand" value={result.brand} />
            <DetailRow label="Model" value={result.model} />

            <div className="flex items-center justify-between py-2.5 border-b border-outline-variant last:border-0">
              <span className="text-[13px] font-semibold text-on-surface-variant">Condition</span>
              <div className="flex items-center gap-2">
                <span className="bg-secondary-container/30 text-primary text-[12px] font-semibold rounded-full px-3 py-1">
                  {getConditionLabel(result.conditionScore)}
                </span>
                <span className="text-[14px] text-on-surface">{Math.round(result.conditionScore)} / 10</span>
              </div>
            </div>

            {result.description && (
              <div className="pt-2">
                <p className="text-[13px] font-semibold text-on-surface-variant mb-1">Notes</p>
                <p className="text-[14px] text-on-surface">{result.description}</p>
              </div>
            )}
          </div>

          <button
            onClick={onContinue}
            className="w-full mt-6 py-3.5 rounded-full font-semibold text-[15px] text-white bg-primary transition-colors hover:opacity-90"
          >
            Looks Good
          </button>
        </>
      )}
    </div>
  );
}
