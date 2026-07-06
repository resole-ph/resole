'use client';

import StepHeader from './StepHeader';
import type { ListingFormData, PhotoAngle, SellPhoto } from '../types/sell.types';
import { getConditionLabel } from '../utils/condition';

const ANGLES: PhotoAngle[] = ['top', 'side', 'sole', 'insole'];
const MODE_LABELS: Record<ListingFormData['listingMode'], string> = {
  sale: 'Sell',
  swap: 'Swap',
  both: 'Sell & Swap',
};

interface ReviewStepProps {
  photos: Record<PhotoAngle, SellPhoto | null>;
  form: ListingFormData;
  isPublishing: boolean;
  error: string | null;
  onBack: () => void;
  onPublish: () => void;
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-outline-variant last:border-0">
      <span className="text-[13px] text-on-surface-variant w-28 shrink-0">{label}</span>
      <span className="text-[14px] text-on-surface text-right">{value}</span>
    </div>
  );
}

export default function ReviewStep({
  photos,
  form,
  isPublishing,
  error,
  onBack,
  onPublish,
}: ReviewStepProps) {
  return (
    <div>
      <StepHeader title="Review Listing" stepLabel="Step 4 of 4" onBack={onBack} />

      <p className="text-[14px] text-on-surface-variant mb-4">
        Review your listing before it goes live.
      </p>

      <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-2 gap-2 p-3">
          {ANGLES.map((angle) => {
            const photo = photos[angle];
            return (
              <div key={angle} className="relative aspect-square rounded-xl overflow-hidden bg-surface-container">
                {photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo.previewUrl} alt={angle} className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-1.5 left-1.5 bg-black/55 rounded-full px-2 py-0.5">
                  <span className="text-white text-[10px] font-semibold capitalize">{angle}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4 pb-4">
          <FieldRow label="Brand" value={form.brand} />
          <FieldRow label="Model" value={form.model} />
          <FieldRow label="Colorway" value={form.colorway} />
          <FieldRow label="Size" value={`US ${form.size}`} />
          <FieldRow label="Category" value={form.category} />
          <FieldRow
            label="Condition"
            value={`${getConditionLabel(form.conditionScore)} (${form.conditionScore}/10)`}
          />
          <FieldRow label="Price" value={`₱${Number(form.price || 0).toLocaleString()}`} />
          <FieldRow label="Listing type" value={MODE_LABELS[form.listingMode]} />
          {form.description ? (
            <div className="pt-2">
              <p className="text-[13px] text-on-surface-variant mb-1">Description</p>
              <p className="text-[14px] text-on-surface">{form.description}</p>
            </div>
          ) : null}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-[13px]">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span className="flex-1">{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={onPublish}
          disabled={isPublishing}
          className="w-full py-3.5 rounded-full font-semibold text-[15px] text-white bg-primary disabled:bg-outline-variant disabled:text-on-surface-variant transition-colors"
        >
          {isPublishing ? 'Publishing...' : 'Publish Listing'}
        </button>
        <button
          onClick={onBack}
          disabled={isPublishing}
          className="w-full py-3.5 rounded-full font-semibold text-[15px] text-on-surface-variant border border-outline-variant"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
