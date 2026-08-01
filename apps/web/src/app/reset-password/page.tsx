'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';

const PASSWORD_REQUIREMENT_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, and a number.';

function isStrongPassword(password: string): boolean {
  if (typeof password !== 'string' || password.length < 8) {
    return false;
  }
  return /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
}

type PageStatus = 'checking' | 'valid' | 'invalid' | 'done';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [status, setStatus] = useState<PageStatus>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    let cancelled = false;

    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setStatus(data.valid ? 'valid' : 'invalid');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('invalid');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isStrongPassword(password)) {
      setError(PASSWORD_REQUIREMENT_MESSAGE);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setStatus('done');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl px-6 pt-6 pb-8">
        <div className="flex justify-center mb-5">
          <Image src="/ReSoleLogo.png" alt="Resole Sneakers" width={140} height={32} className="object-contain" />
        </div>

        {status === 'checking' && (
          <p className="text-center text-[14px] text-on-surface-variant">Checking your link…</p>
        )}

        {status === 'invalid' && (
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="text-[20px] font-bold text-on-surface">Link expired or invalid</h2>
            <p className="text-[14px] text-on-surface-variant">
              This password reset link is no longer valid. Please request a new one from the sign-in screen.
            </p>
            <Link href="/" className="text-primary text-[14px] font-medium mt-2">
              Return to Resole
            </Link>
          </div>
        )}

        {status === 'valid' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-on-surface text-center mb-1">Set a new password</h2>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-[14px] text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-[14px] text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
            {error && <p className="text-[13px] text-error text-center">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-on-primary rounded-full py-3 text-[14.5px] font-semibold disabled:opacity-60 transition-opacity mt-1"
            >
              {submitting ? 'Please wait…' : 'Update password'}
            </button>
          </form>
        )}

        {status === 'done' && (
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="text-[20px] font-bold text-on-surface">Password updated</h2>
            <p className="text-[14px] text-on-surface-variant">
              You can now log in with your new password. If you started this from the Resole app, you can return to it now.
            </p>
            <Link href="/" className="text-primary text-[14px] font-medium mt-2">
              Return to Resole
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-on-surface-variant">Loading…</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
