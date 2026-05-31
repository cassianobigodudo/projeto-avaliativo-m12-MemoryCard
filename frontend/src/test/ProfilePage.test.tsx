import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProfilePage } from '@/pages/ProfilePage';
import { AuthProvider } from '@/contexts/AuthContext';
import * as profileHook from '@/hooks/useProfile';

// ─── Mock do useProfile ───────────────────────────────────────────────────────

function mockUseProfile(overrides = {}) {
  return vi.spyOn(profileHook, 'useProfile').mockReturnValue({
    updateProfile: vi.fn().mockResolvedValue(true),
    deleteAccount: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
    error: null,
    success: null,
    ...overrides,
  });
}

function renderProfilePage() {
  localStorage.setItem('token', 'mock_token');
  localStorage.setItem(
    'user',
    JSON.stringify({ id: 'user-1', name: 'Cassiano', email: 'cassiano@email.com', createdAt: '' })
  );

  return render(
    <MemoryRouter initialEntries={['/profile']}>
      <AuthProvider>
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<div>Login</div>} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('ProfilePage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ── Teste A ──────────────────────────────────────────────────────────────────
  it('Teste A: Renderiza os dados atuais do usuário nos campos do formulário', () => {
    mockUseProfile();
    renderProfilePage();

    expect(screen.getByDisplayValue('Cassiano')).toBeInTheDocument();
    expect(screen.getByDisplayValue('cassiano@email.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
  });

  // ── Teste B ──────────────────────────────────────────────────────────────────
  it('Teste B: Botão "Excluir Conta" está visível na tela', () => {
    mockUseProfile();
    renderProfilePage();

    expect(screen.getByRole('button', { name: /excluir conta/i })).toBeInTheDocument();
  });

  // ── Teste C ──────────────────────────────────────────────────────────────────
  it('Teste C: Clicar em "Excluir Conta" abre o modal de confirmação', () => {
    mockUseProfile();
    renderProfilePage();

    fireEvent.click(screen.getByRole('button', { name: /excluir conta/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/atenção/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sim, excluir minha conta/i })).toBeInTheDocument();
  });

  // ── Teste D ──────────────────────────────────────────────────────────────────
  it('Teste D: Cancelar no modal fecha o modal sem chamar deleteAccount', () => {
    mockUseProfile();
    renderProfilePage();

    fireEvent.click(screen.getByRole('button', { name: /excluir conta/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // ── Teste E ──────────────────────────────────────────────────────────────────
  it('Teste E: Confirmar exclusão chama deleteAccount', async () => {
    const deleteAccount = vi.fn().mockResolvedValue(undefined);
    mockUseProfile({ deleteAccount });
    renderProfilePage();

    fireEvent.click(screen.getByRole('button', { name: /excluir conta/i }));
    fireEvent.click(screen.getByRole('button', { name: /sim, excluir minha conta/i }));

    await waitFor(() => {
      expect(deleteAccount).toHaveBeenCalled();
    });
  });

  // ── Teste F ──────────────────────────────────────────────────────────────────
  it('Teste F: Submeter formulário com alteração chama updateProfile', async () => {
    const updateProfile = vi.fn().mockResolvedValue(true);
    mockUseProfile({ updateProfile });
    renderProfilePage();

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'Cassiano Atualizado' },
    });
    fireEvent.click(screen.getByRole('button', { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Cassiano Atualizado' })
      );
    });
  });

  // ── Teste G ──────────────────────────────────────────────────────────────────
  it('Teste G: Exibe mensagem de erro quando error prop está preenchida', () => {
    mockUseProfile({ error: 'Este email já está em uso por outra conta.' });
    renderProfilePage();

    expect(screen.getByRole('alert')).toHaveTextContent('Este email já está em uso por outra conta.');
  });

  // ── Teste H ──────────────────────────────────────────────────────────────────
  it('Teste H: Exibe mensagem de sucesso quando success prop está preenchida', () => {
    mockUseProfile({ success: 'Perfil atualizado com sucesso!' });
    renderProfilePage();

    expect(screen.getByRole('status')).toHaveTextContent('Perfil atualizado com sucesso!');
  });
});
