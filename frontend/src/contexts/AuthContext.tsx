import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { User } from '@/types';

type AuthContextData = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  );
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? (JSON.parse(stored) as User) : null;
  });

  const signIn = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextData {
  return useContext(AuthContext);
}
