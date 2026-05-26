// Hook customizado para lógica do catálogo de jogos
// TODO: Implementar durante a feature de catálogo

export function useGames() {
  // Placeholder - será implementado na feature de catálogo
  return {
    games: [],
    isLoading: false,
    error: null,
    fetchGames: async () => {},
    createGame: async (_data: unknown) => {},
    updateGame: async (_id: string, _data: unknown) => {},
    deleteGame: async (_id: string) => {},
  };
}
