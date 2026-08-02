'use client';

import { useState } from 'react';
import EditProfileModal from './EditProfileModal';
import { useMyProfile, useMyStats, useUpdateMyProfile } from '../queries/profile.queries';

export default function UserInfoHeader() {
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Both come from the shared cache. RecycleCoinsCard asks for the same stats
  // on this page — one request now serves both, and revisiting /profile within
  // the stale window serves from cache with no request at all.
  const { data: profile, error: profileError } = useMyProfile();
  const { data: stats } = useMyStats();
  const updateProfile = useUpdateMyProfile();

  // Stats are supplementary — the old code swallowed their failure with a
  // `.catch(() => null)` and still rendered the header. Only a failed profile
  // load is worth surfacing.
  const error =
    saveError ?? (profileError ? profileError.message || 'Unable to load your profile' : null);

  const name = profile?.name ?? '';
  const location = profile?.location ?? '';
  const avatar = profile?.image || null;

  const statItems = [
    { value: stats?.listingCount ?? 0, label: 'Listings' },
    { value: stats?.salesCount ?? 0, label: 'Sold' },
    { value: stats?.swapsCount ?? 0, label: 'Swaps' },
  ];

  const handleSave = async (values: { name: string; location: string; avatar: string | null }) => {
    setSaveError(null);
    try {
      // The mutation merges the response into the cached profile, so every
      // component reading useMyProfile() updates without a refetch.
      await updateProfile.mutateAsync({
        name: values.name,
        location: values.location,
        image: values.avatar,
      });
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unable to save your profile');
    }
  };

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
              <h1 className="text-[24px] leading-8 font-semibold text-on-surface">
                {name || (error ? 'Profile unavailable' : 'Loading…')}
              </h1>
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
              <span className="text-[14px] font-semibold text-on-surface">
                {(profile?.overallRating ?? 0).toFixed(1)}
              </span>
              <span className="text-on-surface-variant text-[14px]">
                &middot; {profile?.reviewCount ?? 0} reviews
              </span>
            </div>
            <p className="text-[14px] text-on-surface-variant mt-0.5">
              {[location, profile?.joinedYear ? `Joined ${profile.joinedYear}` : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          {statItems.map(({ value, label }) => (
            <div key={label} className="bg-surface-container p-4 rounded-xl text-center min-w-[80px]">
              <p className="text-[24px] leading-8 font-bold text-on-surface">{value}</p>
              <p className="text-[14px] font-semibold text-on-surface-variant">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="text-error text-[13px] -mt-2">{error}</p>}

      {isEditing && (
        <EditProfileModal
          initialName={name}
          initialLocation={location}
          initialAvatar={avatar}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
