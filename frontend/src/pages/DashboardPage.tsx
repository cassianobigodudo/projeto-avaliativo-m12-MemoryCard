import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useGames } from '@/hooks/useGames';
import { AddGameModal } from '@/components/AddGameModal';
import type { AddGameFormData } from '@/components/AddGameModal';
import type { Game } from '@/types';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { games, isLoading, error, fetchGames, createGame, updateGame, deleteGame } = useGames();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // ── Adicionar ──────────────────────────────────────────────────────────────
  async function handleAddGame(data: AddGameFormData) {
    const success = await createGame({
      title: data.title,
      platform: data.platform,
      condition: data.condition as any,
      region: data.region as any,
      notes: data.notes || undefined,
    });
    if (success) setIsModalOpen(false);
  }

  // ── Editar ─────────────────────────────────────────────────────────────────
  function handleOpenEdit(game: Game) {
    setEditingGame(game);
  }

  async function handleEditGame(data: AddGameFormData) {
    if (!editingGame) return;
    const success = await updateGame(editingGame.id, {
      title: data.title,
      platform: data.platform,
      condition: data.condition as any,
      region: data.region as any,
      notes: data.notes || undefined,
    });
    if (success) setEditingGame(null);
  }

  // ── Excluir ────────────────────────────────────────────────────────────────
  async function handleDeleteGame(game: Game) {
    const confirmed = window.confirm(
      `Tem certeza que deseja remover "${game.title}" da sua coleção?`
    );
    if (!confirmed) return;
    await deleteGame(game.id);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">MemoryCard 🎮</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">
            Olá, <span className="text-white font-medium">{user?.name}</span>
          </span>
          <Link
            to="/profile"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Perfil
          </Link>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Minha Coleção</h2>
            <p className="text-gray-400">Gerencie seus jogos aqui.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            aria-label="Adicionar jogo"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            + Adicionar Jogo
          </button>
        </div>

        {isLoading && <p className="text-gray-400 text-center py-10">Carregando...</p>}

        {!isLoading && games.length === 0 && (
          <div className="bg-gray-900 rounded-2xl p-10 text-center border border-gray-800">
            <p className="text-4xl mb-4">🕹️</p>
            <p className="text-gray-400">
              Sua coleção está vazia. Clique em{' '}
              <span className="text-indigo-400 font-medium">+ Adicionar Jogo</span> para começar.
            </p>
          </div>
        )}

        {!isLoading && games.length > 0 && (
          <div className="grid gap-4">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-gray-900 rounded-xl p-5 border border-gray-800 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-white">{game.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {game.platform} · {game.condition} · {game.region}
                  </p>
                  {game.notes && (
                    <p className="text-gray-500 text-xs mt-1">{game.notes}</p>
                  )}
                </div>

                {/* Botões de ação */}
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(game)}
                    aria-label={`Editar ${game.title}`}
                    className="text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-800 hover:border-indigo-600 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteGame(game)}
                    aria-label={`Excluir ${game.title}`}
                    className="text-sm text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p role="alert" className="text-red-400 text-sm text-center mt-4">
            {error}
          </p>
        )}
      </main>

      {/* Modal — Adicionar */}
      <AddGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddGame}
        isLoading={isLoading}
        error={error}
      />

      {/* Modal — Editar (reutiliza AddGameModal com dados preenchidos) */}
      <AddGameModal
        isOpen={!!editingGame}
        onClose={() => setEditingGame(null)}
        onSubmit={handleEditGame}
        isLoading={isLoading}
        error={error}
        initialData={
          editingGame
            ? {
                title: editingGame.title,
                platform: editingGame.platform,
                condition: editingGame.condition,
                region: editingGame.region,
                notes: editingGame.notes ?? '',
              }
            : undefined
        }
      />
    </div>
  );
}
