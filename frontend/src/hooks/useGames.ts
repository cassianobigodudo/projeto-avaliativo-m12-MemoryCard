import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useAuthContext } from '@/contexts/AuthContext';
import type { Game, CreateGamePayload } from '@/types';

type GamesResponse = { success: boolean; data: Game[] };
type GameResponse  = { success: boolean; data: Game };

export function useGames() {
  const { token } = useAuthContext();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<GamesResponse>('/games', token);
      setGames(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar jogos.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const createGame = useCallback(async (data: CreateGamePayload): Promise<boolean> => {
    if (!token) return false;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<GameResponse>('/games', data, token);
      setGames((prev) => [response.data, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar jogo.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const updateGame = useCallback(async (id: string, data: Partial<CreateGamePayload>): Promise<boolean> => {
    if (!token) return false;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.put<GameResponse>(`/games/${id}`, data, token);
      setGames((prev) => prev.map((g) => (g.id === id ? response.data : g)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar jogo.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const deleteGame = useCallback(async (id: string): Promise<boolean> => {
    if (!token) return false;
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/games/${id}`, token);
      setGames((prev) => prev.filter((g) => g.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover jogo.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  return { games, isLoading, error, fetchGames, createGame, updateGame, deleteGame };
}
