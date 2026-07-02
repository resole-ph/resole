import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/features/auth/services/auth.service';
import { getSessionToken } from '@/lib/session';
import type { User } from '@/features/auth/types/auth.types';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const token = await getSessionToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    const profile = await authService.getProfile();
    setUser(profile);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
