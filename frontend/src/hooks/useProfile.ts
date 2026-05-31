import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuthContext } from '@/contexts/AuthContext';

type UpdateProfileData = {
  name?: string;
  email?: string;
  password?: string;
};

type UpdateProfileResponse = {
  success: boolean;
  message: string;
  data: { id: string; name: string; email: string };
};

export function useProfile() {
  const { token, signIn, signOut, user } = useAuthContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function updateProfile(data: UpdateProfileData): Promise<boolean> {
    if (!token) return false;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.put<UpdateProfileResponse>('/users/profile', data, token);
      // Atualiza o usuário no contexto com os novos dados
      signIn(token, { ...response.data, createdAt: user?.createdAt ?? '' });
      setSuccess('Perfil atualizado com sucesso!');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteAccount(): Promise<void> {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      await api.delete('/users/profile', token);
      signOut();
      navigate('/login', { state: { message: 'Sua conta foi excluída com sucesso.' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir conta.');
    } finally {
      setIsLoading(false);
    }
  }

  return { updateProfile, deleteAccount, isLoading, error, success };
}
