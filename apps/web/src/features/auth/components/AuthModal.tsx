'use client';

import Image from 'next/image';
import { useEffect, useState, type FormEvent } from 'react';

const PASSWORD_REQUIREMENT_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, and a number.';

function isStrongPassword(password: string): boolean {
  if (typeof password !== 'string' || password.length < 8) {
    return false;
  }
  return /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
}

type AuthModalMode = 'sign-in' | 'sign-up';
type AuthModalStep = 'credentials' | 'forgot-password' | 'check-email';

interface AuthModalProps {
  initialMode?: AuthModalMode;
  prompt?: string;
  onClose: () => void;
  onSuccess: () => void;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="#ffffff">
      <path d="M13.06 9.55c-.02-2 1.63-2.96 1.7-3-.93-1.36-2.38-1.54-2.9-1.56-1.23-.13-2.4.72-3.03.72-.63 0-1.6-.7-2.63-.68-1.35.02-2.6.79-3.29 1.99-1.4 2.44-.36 6.05 1.02 8.03.66.95 1.46 2.03 2.5 1.99 1-.04 1.38-.65 2.6-.65 1.21 0 1.55.65 2.61.63 1.08-.02 1.77-.98 2.43-1.93.77-1.12 1.08-2.2 1.1-2.26-.02-.01-2.1-.81-2.11-3.28z" />
      <path d="M11.1 3.35c.55-.67.92-1.6.82-2.53-.79.03-1.75.53-2.32 1.19-.51.59-.96 1.54-.84 2.45.88.07 1.79-.45 2.34-1.11z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="9" height="18" viewBox="0 0 9 18" fill="#ffffff">
      <path d="M8.24 9.5h-2.4V18H2.5V9.5H.72V6.62H2.5V4.66C2.5 2.2 3.6 0 7.2 0h1.86v2.8H7.7c-.5 0-.7.24-.7.72v1.1h2.24l-.2 2.88z" />
    </svg>
  );
}

export default function AuthModal({ initialMode = 'sign-in', prompt, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  const [step, setStep] = useState<AuthModalStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function switchMode(nextMode: AuthModalMode) {
    setMode(nextMode);
    setError(null);
  }

  function openForgotPassword() {
    setForgotEmail(email);
    setForgotError(null);
    setStep('forgot-password');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === 'sign-up') {
      if (!isStrongPassword(password)) {
        setError(PASSWORD_REQUIREMENT_MESSAGE);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const endpoint = mode === 'sign-in' ? '/api/auth/sign-in' : '/api/auth/sign-up';
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      onSuccess();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setForgotError(null);
    setForgotSubmitting(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setForgotError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setStep('check-email');
    } catch {
      setForgotError('Network error. Please try again.');
    } finally {
      setForgotSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[420px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center justify-center pt-6 px-6">
          <Image src="/ReSoleLogo.png" alt="Resole Sneakers" width={140} height={32} className="object-contain" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 p-1 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-6 pt-5 pb-6 flex flex-col gap-6">
          {step === 'credentials' && (
            <>
              {/* Welcome section */}
              <div className="flex flex-col items-center gap-1 text-center">
                <h2 className="text-[22px] font-bold text-on-surface leading-tight">Welcome to Resole</h2>
                <p className="text-[14px] text-on-surface-variant">
                  {mode === 'sign-up' ? 'Sign up to start swapping.' : 'Log in to continue.'}
                </p>
                {prompt && <p className="text-[13px] text-on-surface-variant mt-1">{prompt}</p>}
              </div>

              {/* Mode toggle */}
              <div className="flex rounded-full bg-surface-container-low p-1 border border-outline-variant">
                <button
                  type="button"
                  onClick={() => switchMode('sign-up')}
                  className={`flex-1 py-2 rounded-full text-[14px] font-medium transition-colors ${
                    mode === 'sign-up' ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('sign-in')}
                  className={`flex-1 py-2 rounded-full text-[14px] font-medium transition-colors ${
                    mode === 'sign-in' ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant'
                  }`}
                >
                  Log In
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-[14px] text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 pr-11 text-[14px] text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {mode === 'sign-up' && (
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 pr-11 text-[14px] text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                )}

                {mode === 'sign-in' && (
                  <button
                    type="button"
                    onClick={openForgotPassword}
                    className="self-end text-[13px] text-primary font-medium"
                  >
                    Forgot password?
                  </button>
                )}

                {error && <p className="text-[13px] text-error text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-on-primary rounded-full py-3 text-[14.5px] font-semibold shadow-[0px_8px_20px_rgba(37,99,235,0.25)] disabled:opacity-60 transition-opacity mt-1"
                >
                  {submitting ? 'Please wait…' : mode === 'sign-up' ? 'Create Account' : 'Log In'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 -my-2">
                <div className="flex-1 h-px bg-outline-variant" />
                <span className="text-[12.5px] text-on-surface-variant">or</span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>

              {/* Social auth (visual only) */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-white border border-outline-variant shadow-sm text-[14px] font-medium text-on-surface"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full text-[14px] font-medium text-white"
                  style={{ backgroundColor: '#131b2e' }}
                >
                  <AppleIcon />
                  Continue with Apple ID
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full text-[14px] font-medium text-white"
                  style={{ backgroundColor: '#1877F2' }}
                >
                  <FacebookIcon />
                  Continue with Facebook
                </button>
              </div>
            </>
          )}

          {step === 'forgot-password' && (
            <>
              <div className="flex flex-col items-center gap-1 text-center">
                <h2 className="text-[22px] font-bold text-on-surface leading-tight">Reset your password</h2>
                <p className="text-[14px] text-on-surface-variant">
                  Enter your account email and we&apos;ll send you a link to set a new password.
                </p>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-[14px] text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />

                {forgotError && <p className="text-[13px] text-error text-center">{forgotError}</p>}

                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="bg-primary text-on-primary rounded-full py-3 text-[14.5px] font-semibold shadow-[0px_8px_20px_rgba(37,99,235,0.25)] disabled:opacity-60 transition-opacity mt-1"
                >
                  {forgotSubmitting ? 'Please wait…' : 'Send reset link'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="self-center text-[13px] text-on-surface-variant font-medium"
                >
                  Back to log in
                </button>
              </form>
            </>
          )}

          {step === 'check-email' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-[22px] font-bold text-on-surface leading-tight">Check your email</h2>
              <p className="text-[14px] text-on-surface-variant">
                If an account exists for <strong>{forgotEmail}</strong>, we&apos;ve sent a link to reset
                your password. Open it to set a new password, then come back here to log in.
              </p>
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="text-primary text-[14px] font-medium"
              >
                Back to log in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
