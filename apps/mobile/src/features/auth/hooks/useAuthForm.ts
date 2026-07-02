import { useState } from 'react';
import { authService } from '../services/auth.service';
import type { AuthMode } from '../types/auth.types';
import { isStrongPassword, PASSWORD_REQUIREMENT_MESSAGE } from '../validation';

export function useAuthForm() {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);

    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return null;
    }

    if (mode === 'signup') {
      if (!isStrongPassword(password)) {
        setError(PASSWORD_REQUIREMENT_MESSAGE);
        return null;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return null;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        return await authService.signUp(email.trim(), password);
      }
      return await authService.signIn(email.trim(), password);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    mode, setMode,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    loading,
    error,
    submit,
  };
}
