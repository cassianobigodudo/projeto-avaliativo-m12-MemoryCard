import { useAuth } from '@/hooks/useAuth';

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">MemoryCard 🎮</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">
            Olá, <span className="text-white font-medium">{user?.name}</span>
          </span>
          <button
            onClick={logout}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1">Minha Coleção</h2>
          <p className="text-gray-400">Gerencie seus jogos aqui.</p>
        </div>

        {/* Placeholder — catálogo de jogos será implementado na próxima feature */}
        <div className="bg-gray-900 rounded-2xl p-10 text-center border border-gray-800">
          <p className="text-4xl mb-4">🕹️</p>
          <p className="text-gray-400">
            Sua coleção está vazia. Em breve você poderá adicionar jogos aqui.
          </p>
        </div>
      </main>
    </div>
  );
}
