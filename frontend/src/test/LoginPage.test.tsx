import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { AuthProvider } from '@/contexts/AuthContext';
import * as apiModule from '@/services/api';

// ─── Helper ──────────────────────────────────────────────────────────────────

function renderLoginPage(initialPath = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ── Teste A ──────────────────────────────────────────────────────────────────
  it('Teste A: Renderiza os inputs de email e senha corretamente', () => {
    renderLoginPage();

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  // ── Teste B ──────────────────────────────────────────────────────────────────
  it('Teste B: Formulário vazio não chama a API (validação HTML nativa)', () => {
    const postSpy = vi.spyOn(apiModule.api, 'post');
    renderLoginPage();

    const button = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(button);

    // Inputs com required impedem o submit — API não deve ser chamada
    expect(postSpy).not.toHaveBeenCalled();
  });

  // ── Teste C ──────────────────────────────────────────────────────────────────
  it('Teste C: Login com sucesso redireciona para /dashboard', async () => {
    vi.spyOn(apiModule.api, 'post').mockResolvedValue({
      success: true,
      token: 'mock_token',
      user: { id: 'uuid-1', name: 'Cassiano', email: 'cassiano@email.com', createdAt: '' },
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'cassiano@email.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'Senha123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  // ── Teste D ──────────────────────────────────────────────────────────────────
  it('Teste D: Credenciais inválidas exibem mensagem de erro em vermelho', async () => {
    vi.spyOn(apiModule.api, 'post').mockRejectedValue(
      new Error('E-mail ou senha incorretos.')
    );

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'errado@email.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'SenhaErrada1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.');
    });
  });
});
