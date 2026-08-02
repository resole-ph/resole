'use client';

import type { ReactNode } from 'react';
import StepHeader from './StepHeader';
import type { ListingFormData, ShoeCategory, ListingMode } from '../types/sell.types';
import { getConditionLabel } from '../utils/condition';
import { validateListingForm } from '../utils/validation';

const CATEGORIES: ShoeCategory[] = ['running', 'basketball', 'football', 'casual', 'other'];

const LISTING_MODES: { value: ListingMode; label: string; hint: string }[] = [
  { value: 'sale', label: 'Sell', hint: 'Fixed price' },
  { value: 'swap', label: 'Swap', hint: 'Trade only' },
  { value: 'both', label: 'Both', hint: 'Sell or swap' },
];

const inputClass =
  'rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-[14px] text-on-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';

function fieldInputClass(hasError?: string) {
  return hasError ? inputClass.replace('border-outline-variant', 'border-error') : inputClass;
}

interface EditListingStepProps {
  form: ListingFormData;
  onChange: <K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) => void;
  onBack: () => void;
  onContinue: () => void;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-on-surface-variant">{label}</span>
      {children}
      {error && <span className="text-[11px] text-error">{error}</span>}
    </label>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-4 md:p-6 mb-4 shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: string }) {
  return <p className="text-[12px] font-bold text-on-surface-variant tracking-wide mb-3">{children}</p>;
}

export default function EditListingStep({ form, onChange, onBack, onContinue }: EditListingStepProps) {
  const errors = validateListingForm(form);
  const canContinue = Object.keys(errors).length === 0;

  return (
    <div>
      <StepHeader title="Edit Listing" stepLabel="Step 3 of 4" onBack={onBack} />

      <div className="md:grid md:grid-cols-2 md:gap-6 md:items-start">
        <div>
          <Card>
            <CardLabel>Shoe Details</CardLabel>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Brand *" error={errors.brand}>
                  <input
                    className={fieldInputClass(errors.brand)}
                    value={form.brand}
                    onChange={(e) => onChange('brand', e.target.value)}
                  />
                </Field>
                <Field label="Model *" error={errors.model}>
                  <input
                    className={fieldInputClass(errors.model)}
                    value={form.model}
                    onChange={(e) => onChange('model', e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Colorway *" error={errors.colorway}>
                <input
                  className={fieldInputClass(errors.colorway)}
                  value={form.colorway}
                  onChange={(e) => onChange('colorway', e.target.value)}
                  placeholder="e.g. Chicago"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Size (US Men's) *" error={errors.size}>
                  <input
                    className={fieldInputClass(errors.size)}
                    value={form.size}
                    onChange={(e) => onChange('size', e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="10"
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Category">
                  <select
                    className={inputClass}
                    value={form.category}
                    onChange={(e) => onChange('category', e.target.value as ShoeCategory)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <CardLabel>Condition</CardLabel>
              <span className="bg-secondary-container/30 text-primary text-[12px] font-semibold rounded-full px-3 py-1">
                {getConditionLabel(form.conditionScore)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={form.conditionScore}
                onChange={(e) => onChange('conditionScore', Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="bg-secondary-container/30 text-primary text-[13px] font-semibold rounded-full px-3 py-1">
                {form.conditionScore} / 10
              </span>
            </div>

            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={form.isRefurbished}
                onChange={(e) => onChange('isRefurbished', e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-[13px] text-on-surface">This pair has been refurbished/restored</span>
            </label>
          </Card>
        </div>

        <div>
          <Card>
            <CardLabel>Asking Price</CardLabel>
            <div
              className={[
                'flex items-center rounded-lg border overflow-hidden',
                errors.price ? 'border-error' : 'border-outline-variant',
              ].join(' ')}
            >
              <span className="px-3 py-2.5 border-r border-outline-variant text-on-surface-variant text-[14px]">
                ₱
              </span>
              <input
                className="flex-1 px-3 py-2.5 text-[14px] text-on-surface outline-none"
                value={form.price}
                onChange={(e) => onChange('price', e.target.value.replace(/[^0-9]/g, ''))}
                inputMode="numeric"
              />
            </div>
            {errors.price && <p className="text-[11px] text-error mt-1.5">{errors.price}</p>}
          </Card>

          <Card>
            <CardLabel>Listing Type</CardLabel>
            <div className="flex gap-3">
              {LISTING_MODES.map((opt) => {
                const checked = form.listingMode === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange('listingMode', opt.value)}
                    className={[
                      'flex-1 rounded-xl border p-3 text-left transition-colors',
                      checked ? 'border-primary bg-primary/5' : 'border-outline-variant',
                    ].join(' ')}
                  >
                    <p className={`text-[13px] font-semibold ${checked ? 'text-primary' : 'text-on-surface'}`}>
                      {opt.label}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">{opt.hint}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardLabel>Description</CardLabel>
            <textarea
              className={`${inputClass} w-full`}
              rows={4}
              value={form.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Add any extra details about your shoes..."
            />
          </Card>
        </div>
      </div>

      {!canContinue && (
        <p className="text-[12px] text-error mb-2 text-center">
          {Object.values(errors)[0]} Please fix the highlighted fields to continue.
        </p>
      )}

      <button
        onClick={onContinue}
        disabled={!canContinue}
        className="w-full md:w-auto md:min-w-64 md:mx-auto md:block py-3.5 rounded-full font-semibold text-[15px] text-white bg-primary disabled:bg-outline-variant disabled:text-on-surface-variant transition-colors"
      >
        Review Listing
      </button>
    </div>
  );
}
