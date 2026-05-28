// Hook customizado para lógica de autenticação
// TODO: Implementar durante a feature de autenticação

export function useAuth() {
  // Placeholder - será implementado na feature de autenticação
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    login: async (_email: string, _password: string) => {},
    register: async (_name: string, _email: string, _password: string) => {},
    logout: () => {},
  };
}
