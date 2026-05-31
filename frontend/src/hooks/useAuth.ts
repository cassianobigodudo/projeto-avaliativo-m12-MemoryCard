import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuthContext } from '@/contexts/AuthContext';
import type { AuthResponse } from '@/types';

export function useAuth() {
  const { signIn, signOut, user, token, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function login(email: string, password: string) {
    setError(null);
    setIsLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      signIn(response.token, response.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'E-mail ou senha incorretos.');
    } finally {
      setIsLoading(false);
    }
  }

  async function register(name: string, email: string, password: string) {
    setError(null);
    setIsLoading(true);
    try {
      await api.post('/users/register', { name, email, password });
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    signOut();
    navigate('/login');
  }

  return { login, register, logout, user, token, isAuthenticated, error, isLoading };
}
