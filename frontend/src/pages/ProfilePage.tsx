import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

export function ProfilePage() {
  const { user } = useAuthContext();
  const { updateProfile, deleteAccount, isLoading, error, success } = useProfile();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data: Record<string, string> = {};
    if (name !== user?.name) data.name = name;
    if (email !== user?.email) data.email = email;
    if (password) data.password = password;

    if (Object.keys(data).length === 0) return;

    const ok = await updateProfile(data);
    if (ok) setPassword('');
  }

  async function handleConfirmDelete() {
    setShowDeleteModal(false);
    await deleteAccount();
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">MemoryCard 🎮</h1>
        <Link to="/dashboard" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          ← Voltar ao Dashboard
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-2">Meu Perfil</h2>
        <p className="text-gray-400 mb-8">Atualize seus dados cadastrais.</p>

        <form onSubmit={handleSubmit} className="space-y-5 bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <div>
            <label htmlFor="profile-name" className="block text-sm text-gray-300 mb-1">
              Nome
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-sm text-gray-300 mb-1">
              E-mail
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="profile-password" className="block text-sm text-gray-300 mb-1">
              Nova Senha <span className="text-gray-500">(deixe em branco para não alterar)</span>
            </label>
            <input
              id="profile-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres com letra e número"
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && <p role="alert" className="text-red-400 text-sm">{error}</p>}
          {success && <p role="status" className="text-green-400 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg py-3 transition-colors"
          >
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>

        {/* Zona de perigo */}
        <div className="mt-8 bg-red-950/30 border border-red-900 rounded-2xl p-6">
          <h3 className="text-red-400 font-semibold mb-2">Zona de Perigo</h3>
          <p className="text-gray-400 text-sm mb-4">
            A exclusão da conta é permanente e remove todos os seus jogos salvos.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            aria-label="Excluir conta"
            className="bg-red-700 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Excluir Conta
          </button>
        </div>
      </main>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar exclusão de conta"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        >
          <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-red-900 shadow-2xl">
            <h2 className="text-xl font-bold text-red-400 mb-3">⚠️ Atenção</h2>
            <p className="text-gray-300 mb-6">
              Esta ação é <strong>irreversível</strong>. Todos os seus dados e jogos salvos serão
              apagados para sempre. Deseja continuar?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg py-3 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isLoading}
                className="flex-1 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-semibold rounded-lg py-3 transition-colors"
              >
                {isLoading ? 'Excluindo...' : 'Sim, excluir minha conta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
