'use client';

import StepHeader from './StepHeader';
import PhotoDropzone from './PhotoDropzone';
import type { PhotoAngle, SellPhoto } from '../types/sell.types';

const ANGLES: PhotoAngle[] = ['top', 'side', 'sole', 'insole'];

interface PhotoUploadStepProps {
  photos: Record<PhotoAngle, SellPhoto | null>;
  onSelect: (angle: PhotoAngle, file: File) => void;
  onRemove: (angle: PhotoAngle) => void;
  onContinue: () => void;
}

export default function PhotoUploadStep({
  photos,
  onSelect,
  onRemove,
  onContinue,
}: PhotoUploadStepProps) {
  const uploadedCount = ANGLES.filter((a) => photos[a]).length;
  const allUploaded = uploadedCount === ANGLES.length;

  return (
    <div>
      <StepHeader title="Upload Photos" stepLabel="Step 1 of 4" />

      <p className="text-[14px] text-on-surface-variant mb-5 md:max-w-md">
        Choose four clear, well-lit photos of your shoe — top, side, sole, and insole — for the
        most accurate AI valuation.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ANGLES.map((angle) => (
          <PhotoDropzone
            key={angle}
            angle={angle}
            photo={photos[angle]}
            onSelect={onSelect}
            onRemove={onRemove}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 mt-5">
        {ANGLES.map((angle) => (
          <div
            key={angle}
            className={`flex-1 h-1 rounded-full ${photos[angle] ? 'bg-primary' : 'bg-outline-variant'}`}
          />
        ))}
      </div>
      <p className="text-[12px] text-on-surface-variant text-center mt-1.5">
        {uploadedCount} of {ANGLES.length} uploaded
      </p>

      <button
        onClick={onContinue}
        disabled={!allUploaded}
        className="w-full md:w-auto md:min-w-64 md:mx-auto md:block mt-6 py-3.5 rounded-full font-semibold text-[15px] text-white bg-primary disabled:bg-outline-variant disabled:text-on-surface-variant transition-colors"
      >
        Analyze with AI
      </button>
    </div>
  );
}
