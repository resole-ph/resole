'use client';

import { useEffect, useState, type FormEvent } from 'react';

type AuthModalMode = 'sign-in' | 'sign-up';

interface AuthModalProps {
  initialMode?: AuthModalMode;
  prompt?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ initialMode = 'sign-in', prompt, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const endpoint = mode === 'sign-in' ? '/api/auth/sign-in' : '/api/auth/sign-up';
      const body = mode === 'sign-in' ? { email, password } : { email, password, name };

      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6">
          <h2 className="text-[20px] font-bold text-on-surface leading-tight">
            {mode === 'sign-in' ? 'Sign in to Resole' : 'Create your account'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 -mt-1 -mr-1 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {prompt && (
          <p className="px-6 mt-2 text-[13.5px] text-on-surface-variant leading-snug">{prompt}</p>
        )}

        <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6 flex flex-col gap-3">
          {mode === 'sign-up' && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-[14px] text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-[14px] text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-[14px] text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            required
            minLength={mode === 'sign-up' ? 8 : undefined}
          />

          {error && <p className="text-[13px] text-error">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-on-primary rounded-full py-3 text-[14.5px] font-semibold disabled:opacity-60 transition-opacity mt-1"
          >
            {submitting ? 'Please wait…' : mode === 'sign-in' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="px-6 pb-6 text-center text-[13.5px] text-on-surface-variant">
          {mode === 'sign-in' ? (
            <>
              New to Resole?{' '}
              <button type="button" className="text-primary font-semibold" onClick={() => switchMode('sign-up')}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="text-primary font-semibold" onClick={() => switchMode('sign-in')}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
