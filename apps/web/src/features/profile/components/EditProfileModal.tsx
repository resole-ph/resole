'use client';

import { useRef, useState } from 'react';

type EditProfileModalProps = {
  initialName: string;
  initialLocation: string;
  initialAvatar: string | null;
  onClose: () => void;
  onSave: (values: { name: string; location: string; avatar: string | null }) => void;
};

export default function EditProfileModal({
  initialName,
  initialLocation,
  initialAvatar,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(initialName);
  const [location, setLocation] = useState(initialLocation);
  const [avatar, setAvatar] = useState<string | null>(initialAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSave({ name: trimmedName, location: location.trim(), avatar });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit profile"
        className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0px_8px_32px_rgba(0,0,0,0.15)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-on-surface">Edit Profile</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-[28px] font-bold overflow-hidden">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="Profile preview" className="w-full h-full object-cover" />
            ) : (
              <span>{name.trim().charAt(0).toUpperCase() || '?'}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-primary text-[13px] font-semibold hover:underline"
            >
              Change photo
            </button>
            {avatar && (
              <button
                onClick={() => setAvatar(null)}
                className="text-error text-[13px] font-semibold hover:underline"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-on-surface-variant text-[13px] font-semibold">Full name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-[14px] text-on-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="Your full name"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-on-surface-variant text-[13px] font-semibold">Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-[14px] text-on-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="City, Province"
            />
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-[14px] font-semibold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-full text-[14px] font-semibold text-white bg-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
