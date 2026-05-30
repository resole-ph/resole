import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Intent = 'buy' | 'sell' | 'explore';

interface OnboardingState {
  hasSeenOnboarding: boolean;
  intent: Intent;
  location: string;
  completeOnboarding: () => void;
  setIntent: (intent: Intent) => void;
  setLocation: (location: string) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      intent: 'buy',
      location: '',
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
      setIntent: (intent) => set({ intent }),
      setLocation: (location) => set({ location }),
    }),
    {
      name: 'onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
