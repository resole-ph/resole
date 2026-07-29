'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PublicListingCard from './PublicListingCard';
import { ProfileClient } from '../services/profile.client';
import type {
  ProfileListing,
  PublicProfile,
  PublicProfileTab,
  UserReview,
} from '../types/profile.types';

const TABS: { id: PublicProfileTab; label: string; icon: string }[] = [
  { id: 'reviews', label: 'Reviews', icon: 'star' },
  { id: 'listings', label: 'Listings', icon: 'list_alt' },
];

function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <span
          key={step}
          className={`material-symbols-outlined text-[16px] ${
            step <= value ? 'text-tertiary' : 'text-outline-variant'
          }`}
          style={step <= value ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          star
        </span>
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: UserReview }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-5 flex gap-4">
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-[14px] font-bold shrink-0 overflow-hidden">
        {review.rater.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={review.rater.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <span>{review.rater.name.trim().charAt(0).toUpperCase() || '?'}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-on-surface font-semibold text-[14px] truncate">{review.rater.name}</p>
          <span className="text-on-surface-variant text-[12px] shrink-0">
            {new Date(review.createdAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="mt-1">
          <Stars value={review.rating} />
        </div>
        {review.comment?.trim() && (
          <p className="text-on-surface-variant text-[13px] leading-relaxed mt-2">{review.comment}</p>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/**
 * Someone else's profile. Same header card as your own profile, but the rest of
 * the profile tab (coins, favourites, analytics, quick links) is yours alone —
 * a visitor only gets the header and the seller's live listings.
 */
export default function PublicProfileView({ userId }: { userId: string }) {
  const router = useRouter();

  const [tab, setTab] = useState<PublicProfileTab>('reviews');
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [listings, setListings] = useState<ProfileListing[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [user, userListings, userReviews] = await Promise.all([
          ProfileClient.getPublicProfile(userId),
          ProfileClient.getUserListings(userId).catch(() => []),
          ProfileClient.getUserReviews(userId).catch(() => []),
        ]);
        setProfile(user);
        setListings(userListings);
        setReviews(userReviews);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load this profile');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userId]);

  if (isLoading) return <Spinner />;

  if (error || !profile) {
    return (
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-10 text-center">
        <span className="material-symbols-outlined text-error text-[40px]">person_off</span>
        <p className="text-error font-semibold text-[15px] mt-2">{error ?? 'Profile not found'}</p>
      </div>
    );
  }

  const stats = [
    { value: profile.listingCount, label: 'Listings' },
    { value: profile.salesCount, label: 'Sold' },
    { value: profile.swapsCount, label: 'Swaps' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface text-[14px] font-semibold w-fit"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Back
      </button>

      {/* Header card — the only piece of the profile tab a visitor sees. */}
      <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-[32px] font-bold overflow-hidden shrink-0">
            {profile.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{profile.name.trim().charAt(0).toUpperCase() || '?'}</span>
            )}
          </div>
          <div>
            <h1 className="text-[24px] leading-8 font-semibold text-on-surface">{profile.name}</h1>
            <div className="flex items-center gap-1 mt-1">
              <span
                className="material-symbols-outlined text-[16px] text-tertiary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="text-[14px] font-semibold text-on-surface">
                {profile.overallRating.toFixed(1)}
              </span>
              <span className="text-on-surface-variant text-[14px]">
                &middot; {profile.reviewCount} reviews
              </span>
            </div>
            <p className="text-[14px] text-on-surface-variant mt-0.5">
              {[profile.location, profile.joinedYear ? `Joined ${profile.joinedYear}` : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="bg-surface-container p-4 rounded-xl text-center min-w-[80px]">
              <p className="text-[24px] leading-8 font-bold text-on-surface">{value}</p>
              <p className="text-[14px] font-semibold text-on-surface-variant">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-2">
        <div className="flex bg-surface-container rounded-xl p-1">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={[
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-semibold transition-colors',
                tab === id
                  ? 'bg-surface-container-lowest text-on-surface shadow-[0px_2px_8px_rgba(0,0,0,0.06)]'
                  : 'text-on-surface-variant',
              ].join(' ')}
            >
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              {label}
              <span className={tab === id ? 'text-primary' : 'text-on-surface-variant'}>
                ({id === 'listings' ? listings.length : reviews.length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {tab === 'reviews' ? (
        reviews.length === 0 ? (
          <section className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-10 flex flex-col items-center">
            <span className="material-symbols-outlined text-[40px] text-outline-variant">reviews</span>
            <p className="text-on-surface-variant text-[14px] mt-3">No reviews yet</p>
          </section>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )
      ) : listings.length === 0 ? (
        <section className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-10 flex flex-col items-center">
          <span className="material-symbols-outlined text-[40px] text-outline-variant">inventory_2</span>
          <p className="text-on-surface-variant text-[14px] mt-3">No live listings right now</p>
        </section>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <PublicListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
