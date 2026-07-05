'use client';

import { useState } from 'react';
import EditProfileModal from './EditProfileModal';

const STATS = [
  { value: '14', label: 'Listings' },
  { value: '28', label: 'Sold' },
  { value: '6', label: 'Swaps' },
];

export default function UserInfoHeader() {
  const [name, setName] = useState('Miguel Rodriguez');
  const [location, setLocation] = useState('Quezon City');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsEditing(true)}
            aria-label="Edit profile photo"
            className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-[32px] font-bold relative group overflow-hidden shrink-0"
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="z-10">{name.trim().charAt(0).toUpperCase() || '?'}</span>
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="material-symbols-outlined text-white">edit</span>
            </div>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] leading-8 font-semibold text-on-surface">{name}</h1>
              <button
                onClick={() => setIsEditing(true)}
                aria-label="Edit profile"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span
                className="material-symbols-outlined text-[16px] text-tertiary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="text-[14px] font-semibold text-on-surface">4.9</span>
              <span className="text-on-surface-variant text-[14px]">&middot; 156 reviews</span>
            </div>
            <p className="text-[14px] text-on-surface-variant mt-0.5">
              {location ? `${location} · Joined 2024` : 'Joined 2024'}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="bg-surface-container p-4 rounded-xl text-center min-w-[80px]">
              <p className="text-[24px] leading-8 font-bold text-on-surface">{value}</p>
              <p className="text-[14px] font-semibold text-on-surface-variant">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {isEditing && (
        <EditProfileModal
          initialName={name}
          initialLocation={location}
          initialAvatar={avatar}
          onClose={() => setIsEditing(false)}
          onSave={(values) => {
            setName(values.name);
            setLocation(values.location);
            setAvatar(values.avatar);
            setIsEditing(false);
          }}
        />
      )}
    </>
  );
}
