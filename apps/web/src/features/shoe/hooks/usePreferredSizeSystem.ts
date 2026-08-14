'use client';

import { useMyProfile } from '@/features/profile/queries/profile.queries';
import { useAuth } from '@/providers/AuthProvider';
import { sizeSystemFromUserPreferences } from '../utils/size-conversion';

/**
 * Resolves the signed-in user's account preference. Guests and accounts that
 * predate the preference fields use the storage anchor, US Men.
 */
export function usePreferredSizePreference() {
  const { user, loading } = useAuth();
  const { data: profile, isPending } = useMyProfile({ enabled: !loading && Boolean(user) });

  return {
    sizeSystem: sizeSystemFromUserPreferences(profile?.unit, profile?.classification),
    isLoading: loading || (Boolean(user) && isPending),
  };
}

export function usePreferredSizeSystem() {
  return usePreferredSizePreference().sizeSystem;
}
