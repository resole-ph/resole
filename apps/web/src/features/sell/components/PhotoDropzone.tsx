'use client';

import { useRef } from 'react';
import type { PhotoAngle, SellPhoto } from '../types/sell.types';

const ANGLE_LABELS: Record<PhotoAngle, string> = {
  top: 'Top View',
  side: 'Side View',
  sole: 'Sole',
  insole: 'Insole',
};

interface PhotoDropzoneProps {
  angle: PhotoAngle;
  photo: SellPhoto | null;
  onSelect: (angle: PhotoAngle, file: File) => void;
  onRemove: (angle: PhotoAngle) => void;
}

export default function PhotoDropzone({ angle, photo, onSelect, onRemove }: PhotoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onSelect(angle, file);
  }

  return (
    <div
      onClick={() => !photo && inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
      }}
      className={[
        'relative aspect-square rounded-xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center gap-1 transition-colors',
        photo
          ? 'border-transparent'
          : 'border-outline-variant hover:border-primary cursor-pointer bg-surface-container-low',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.previewUrl}
            alt={ANGLE_LABELS[angle]}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black/55 rounded-full px-2.5 py-1">
            <span className="text-white text-[11px] font-semibold">{ANGLE_LABELS[angle]}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(angle);
            }}
            aria-label={`Remove ${ANGLE_LABELS[angle]} photo`}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-[28px] text-outline">
            add_photo_alternate
          </span>
          <span className="text-[12px] font-semibold text-on-surface-variant">
            {ANGLE_LABELS[angle]}
          </span>
        </>
      )}
    </div>
  );
}
