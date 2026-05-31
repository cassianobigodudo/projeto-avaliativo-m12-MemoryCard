import { useState, useEffect, FormEvent } from 'react';

export type AddGameFormData = {
  title: string;
  platform: string;
  condition: string;
  region: string;
  notes: string;
};

type AddGameModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddGameFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  initialData?: AddGameFormData;
};

const CONDITIONS = [
  { value: 'Sealed', label: 'Lacrado' },
  { value: 'CompleteInBox', label: 'Completo com Caixa e Manual' },
  { value: 'Loose', label: 'Apenas Mídia' },
  { value: 'Digital', label: 'Digital' },
];

const REGIONS = [
  { value: 'RegionFree', label: 'Region Free' },
  { value: 'NTSC', label: 'NTSC' },
  { value: 'PAL', label: 'PAL' },
  { value: 'NTSC_J', label: 'NTSC-J' },
];

export function AddGameModal({ isOpen, onClose, onSubmit, isLoading, error, initialData }: AddGameModalProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [platform, setPlatform] = useState(initialData?.platform ?? '');
  const [condition, setCondition] = useState(initialData?.condition ?? 'Sealed');
  const [region, setRegion] = useState(initialData?.region ?? 'RegionFree');
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  // Preenche os campos quando o modal abre com dados iniciais (modo edição)
  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title);
      setPlatform(initialData.platform);
      setCondition(initialData.condition);
      setRegion(initialData.region);
      setNotes(initialData.notes);
    } else if (isOpen && !initialData) {
      setTitle('');
      setPlatform('');
      setCondition('Sealed');
      setRegion('RegionFree');
      setNotes('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  function handleClose() {
    setTitle('');
    setPlatform('');
    setCondition('Sealed');
    setRegion('RegionFree');
    setNotes('');
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit({ title, platform, condition, region, notes });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Adicionar jogo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
    >
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Editar Jogo' : 'Adicionar Jogo'}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Fechar modal"
            className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="game-title" className="block text-sm text-gray-300 mb-1">
              Título *
            </label>
            <input
              id="game-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Super Mario World"
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="game-platform" className="block text-sm text-gray-300 mb-1">
              Plataforma *
            </label>
            <input
              id="game-platform"
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="Ex: Super Nintendo, PS2, Nintendo Switch"
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="game-condition" className="block text-sm text-gray-300 mb-1">
              Estado *
            </label>
            <select
              id="game-condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="game-region" className="block text-sm text-gray-300 mb-1">
              Região
            </label>
            <select
              id="game-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="game-notes" className="block text-sm text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              id="game-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalhes sobre a compra, estado, etc."
              rows={3}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {error && (
            <p role="alert" className="text-red-400 text-sm">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg py-3 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg py-3 transition-colors"
            >
              {isLoading ? 'Salvando...' : initialData ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
