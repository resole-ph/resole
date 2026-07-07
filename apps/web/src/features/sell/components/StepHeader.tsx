interface StepHeaderProps {
  title: string;
  stepLabel?: string;
  onBack?: () => void;
}

export default function StepHeader({ title, stepLabel, onBack }: StepHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={onBack}
        disabled={!onBack}
        aria-label="Back"
        className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-0 disabled:pointer-events-none"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>

      <div>
        {stepLabel && (
          <p className="text-[11px] font-bold text-on-surface-variant tracking-wide uppercase">
            {stepLabel}
          </p>
        )}
        <h1 className="text-[19px] font-bold text-on-surface leading-tight">{title}</h1>
      </div>
    </div>
  );
}
