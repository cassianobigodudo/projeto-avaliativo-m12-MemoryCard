import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useAuthContext } from '@/contexts/AuthContext';
import type { Game, CreateGamePayload } from '@/types';

type GamesResponse = {
  success: boolean;
  data: Game[];
};

type CreateGameResponse = {
  success: boolean;
  data: Game;
};

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

  const createGame = useCallback(
    async (data: CreateGamePayload): Promise<boolean> => {
      if (!token) return false;
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post<CreateGameResponse>('/games', data, token);
        setGames((prev) => [response.data, ...prev]);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao adicionar jogo.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  return { games, isLoading, error, fetchGames, createGame };
}
