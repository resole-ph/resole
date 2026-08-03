'use client';

import { useRef, useState } from 'react';
import type { PhotoAngle, SellPhoto } from '../types/sell.types';
import { rotateImageFile } from '../utils/rotateImageFile';

const ANGLE_LABELS: Record<PhotoAngle, string> = {
  top: 'Top View',
  leftSide: 'Left Side View',
  rightSide: 'Right Side View',
  sole: 'Sole',
  insoleRight: 'Insole Right',
  insoleLeft: 'Insole Left',
};

const ANGLE_ICONS: Record<PhotoAngle, string> = {
  top: 'arrow_circle_up',
  leftSide: 'arrow_back',
  rightSide: 'arrow_forward',
  sole: 'footprint',
  insoleRight: 'layers',
  insoleLeft: 'layers',
};

interface PhotoDropzoneProps {
  angle: PhotoAngle;
  photo: SellPhoto | null;
  onSelect: (angle: PhotoAngle, file: File) => void;
  onRemove: (angle: PhotoAngle) => void;
}

export default function PhotoDropzone({ angle, photo, onSelect, onRemove }: PhotoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isRotating, setIsRotating] = useState(false);

  async function handleRotate(e: React.MouseEvent, direction: 'cw' | 'ccw') {
    e.stopPropagation();
    if (!photo?.file || isRotating) return;
    setIsRotating(true);
    try {
      const rotated = await rotateImageFile(photo.file, direction);
      onSelect(angle, rotated);
    } finally {
      setIsRotating(false);
    }
  }

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
        'relative aspect-square rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-1 transition-colors',
        photo
          ? ''
          : 'border-[1.5px] border-dashed border-outline-variant hover:border-primary cursor-pointer bg-surface-container-low',
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
          <div className="absolute top-2 left-2 bg-black/50 rounded-full px-2.5 py-1">
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
          {photo.file && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              <button
                onClick={(e) => handleRotate(e, 'ccw')}
                disabled={isRotating}
                aria-label={`Rotate ${ANGLE_LABELS[angle]} photo counter-clockwise`}
                className="w-7 h-7 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/70 disabled:opacity-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">rotate_left</span>
              </button>
              <button
                onClick={(e) => handleRotate(e, 'cw')}
                disabled={isRotating}
                aria-label={`Rotate ${ANGLE_LABELS[angle]} photo clockwise`}
                className="w-7 h-7 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/70 disabled:opacity-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">rotate_right</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[20px] text-primary">
              {ANGLE_ICONS[angle]}
            </span>
          </div>
          <span className="text-[13px] font-medium text-on-surface">
            {ANGLE_LABELS[angle]}
          </span>
          <span className="text-[11px] text-on-surface-variant mt-0.5">
            Click to upload
          </span>
        </>
      )}
    </div>
  );
}
