import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '@/pages/DashboardPage';
import { AuthProvider } from '@/contexts/AuthContext';
import * as gamesHook from '@/hooks/useGames';

// ─── Mock do useGames ─────────────────────────────────────────────────────────

const fakeGames = [
  {
    id: 'game-1',
    userId: 'user-1',
    title: 'Super Mario World',
    platform: 'Super Nintendo',
    condition: 'Sealed' as const,
    region: 'NTSC' as const,
    notes: null,
    createdAt: '2024-01-01',
  },
  {
    id: 'game-2',
    userId: 'user-1',
    title: 'Zelda',
    platform: 'SNES',
    condition: 'Loose' as const,
    region: 'PAL' as const,
    notes: 'Bom estado',
    createdAt: '2024-01-02',
  },
];

function mockUseGames(overrides = {}) {
  return vi.spyOn(gamesHook, 'useGames').mockReturnValue({
    games: fakeGames,
    isLoading: false,
    error: null,
    fetchGames: vi.fn(),
    createGame: vi.fn().mockResolvedValue(true),
    updateGame: vi.fn().mockResolvedValue(true),
    deleteGame: vi.fn().mockResolvedValue(true),
    ...overrides,
  });
}

function renderDashboard() {
  localStorage.setItem('token', 'mock_token');
  localStorage.setItem('user', JSON.stringify({ id: 'user-1', name: 'Cassiano', email: 'c@c.com', createdAt: '' }));

  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('DashboardPage — botões Editar e Excluir', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('Teste A: Renderiza botões Editar e Excluir para cada jogo', () => {
    mockUseGames();
    renderDashboard();

    const editButtons = screen.getAllByRole('button', { name: /editar/i });
    const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });

    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('Teste B: Clicar em Editar abre o modal com dados do jogo preenchidos', async () => {
    mockUseGames();
    renderDashboard();

    const editButtons = screen.getAllByRole('button', { name: /editar/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Super Mario World')).toBeInTheDocument();
    });
  });

  it('Teste C: Clicar em Excluir e confirmar chama deleteGame', async () => {
    const deleteGame = vi.fn().mockResolvedValue(true);
    mockUseGames({ deleteGame });

    // Mock do window.confirm para retornar true
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderDashboard();

    const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteGame).toHaveBeenCalledWith('game-1');
    });
  });

  it('Teste D: Clicar em Excluir e cancelar NÃO chama deleteGame', async () => {
    const deleteGame = vi.fn();
    mockUseGames({ deleteGame });

    vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderDashboard();

    const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
    fireEvent.click(deleteButtons[0]);

    expect(deleteGame).not.toHaveBeenCalled();
  });

  it('Teste E: Submeter edição chama updateGame com os dados corretos', async () => {
    const updateGame = vi.fn().mockResolvedValue(true);
    mockUseGames({ updateGame });

    renderDashboard();

    // Abre modal de edição do primeiro jogo
    const editButtons = screen.getAllByRole('button', { name: /editar/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Altera o título
    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Mario Atualizado' },
    });

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(updateGame).toHaveBeenCalledWith(
        'game-1',
        expect.objectContaining({ title: 'Mario Atualizado' })
      );
    });
  });
});
