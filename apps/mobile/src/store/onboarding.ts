import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Intent = 'buy' | 'sell' | 'donate';

interface OnboardingState {
  hasSeenOnboarding: boolean;
  intent: Intent;
  location: string;
  phoneNumber: string;
  completeOnboarding: () => void;
  setIntent: (intent: Intent) => void;
  setLocation: (location: string) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      intent: 'buy',
      location: '',
      phoneNumber: '',
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
      setIntent: (intent) => set({ intent }),
      setLocation: (location) => set({ location }),
      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
      reset: () => set({
        hasSeenOnboarding: false,
        intent: 'buy',
        location: '',
        phoneNumber: '',
      }),
    }),
    {
      name: 'onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
