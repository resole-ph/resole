'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import AuthModal from '@/features/auth/components/AuthModal';

type AuthGateMode = 'sign-in' | 'sign-up';

type AuthGateContextValue = {
  /** Runs `action` immediately if signed in, otherwise opens the sign-in modal and
   * runs `action` after a successful sign-in/sign-up. Returns whether it ran immediately. */
  requireAuth: (action?: () => void, prompt?: string) => boolean;
  openSignIn: () => void;
  openSignUp: () => void;
};

const AuthGateContext = createContext<AuthGateContextValue | null>(null);

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const { user, refresh } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthGateMode>('sign-in');
  const [prompt, setPrompt] = useState<string | undefined>(undefined);
  const pendingAction = useRef<(() => void) | null>(null);

  const requireAuth = useCallback((action?: () => void, promptMessage?: string) => {
    if (user) {
      action?.();
      return true;
    }

    pendingAction.current = action ?? null;
    setPrompt(promptMessage);
    setMode('sign-in');
    setIsOpen(true);
    return false;
  }, [user]);

  const openSignIn = useCallback(() => {
    pendingAction.current = null;
    setPrompt(undefined);
    setMode('sign-in');
    setIsOpen(true);
  }, []);

  const openSignUp = useCallback(() => {
    pendingAction.current = null;
    setPrompt(undefined);
    setMode('sign-up');
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    pendingAction.current = null;
  }, []);

  const handleSuccess = useCallback(async () => {
    await refresh();
    setIsOpen(false);
    const action = pendingAction.current;
    pendingAction.current = null;
    action?.();
  }, [refresh]);

  return (
    <AuthGateContext.Provider value={{ requireAuth, openSignIn, openSignUp }}>
      {children}
      {isOpen && (
        <AuthModal
          initialMode={mode}
          prompt={prompt}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
    </AuthGateContext.Provider>
  );
}

export function useAuthGate() {
  const ctx = useContext(AuthGateContext);
  if (!ctx) {
    throw new Error('useAuthGate must be used within an AuthGateProvider');
  }
  return ctx;
}
