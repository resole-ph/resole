import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SizeSystem } from '@/features/shoe/utils/size-conversion';

interface PreferencesState {
  sizeSystem: SizeSystem;
  setSizeSystem: (sizeSystem: SizeSystem) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      sizeSystem: 'eur',
      setSizeSystem: (sizeSystem) => set({ sizeSystem }),
    }),
    {
      name: 'preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
