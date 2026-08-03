import { useEffect } from 'react';
import { usePreferencesStore } from '@/store/preferences';
import { SIZE_SYSTEMS, type SizeSystem } from '@/features/shoe/utils/size-conversion';

/**
 * Keeps the local size-system preference (used synchronously all over the app
 * for conversions) aligned with the backend `unit` column, which is the real
 * source of truth. Call with whatever `unit` value the current screen already
 * fetched — the backend is authoritative, so this always overwrites local state.
 */
export function useSyncSizeSystem(unit: string | null | undefined) {
  const setSizeSystem = usePreferencesStore((s) => s.setSizeSystem);

  useEffect(() => {
    if (unit && (SIZE_SYSTEMS as string[]).includes(unit)) {
      setSizeSystem(unit as SizeSystem);
    }
  }, [unit, setSizeSystem]);
}
