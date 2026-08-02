import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type SizeSystem } from '@/features/shoe/utils/size-conversion';

interface PreferencesState {
  sizeSystem: SizeSystem;
  setSizeSystem: (sizeSystem: SizeSystem) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      // US Men matches both the storage anchor and how the PH market sizes shoes.
      sizeSystem: 'us_m',
      setSizeSystem: (sizeSystem) => set({ sizeSystem }),
    }),
    {
      name: 'preferences',
      storage: createJSONStorage(() => AsyncStorage),
      // v0 stored sizes anchored on EUR and defaulted the preference to 'eur',
      // so a persisted 'eur' is far more likely to be that untouched default
      // than a deliberate choice. Reset it once; anything else is left alone.
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as PreferencesState;
        if (version === 0 && state?.sizeSystem === 'eur') {
          return { ...state, sizeSystem: 'us_m' as SizeSystem };
        }
        return state;
      },
    }
  )
);
