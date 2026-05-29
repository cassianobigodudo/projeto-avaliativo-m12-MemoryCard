import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RegisterPage } from '@/pages/RegisterPage';
import { AuthProvider } from '@/contexts/AuthContext';
import * as apiModule from '@/services/api';

function renderRegisterPage() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ── Teste A ──────────────────────────────────────────────────────────────────
  it('Teste A: Renderiza os inputs de nome, email e senha corretamente', () => {
    renderRegisterPage();

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  // ── Teste B ──────────────────────────────────────────────────────────────────
  it('Teste B: Formulário vazio não chama a API', () => {
    const postSpy = vi.spyOn(apiModule.api, 'post');
    renderRegisterPage();

    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(postSpy).not.toHaveBeenCalled();
  });

  // ── Teste C ──────────────────────────────────────────────────────────────────
  it('Teste C: Cadastro com sucesso redireciona para /login', async () => {
    vi.spyOn(apiModule.api, 'post').mockResolvedValue({ success: true });

    renderRegisterPage();

    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Cassiano' } });
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'cassiano@email.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'Senha123' } });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
  });

  // ── Teste D ──────────────────────────────────────────────────────────────────
  it('Teste D: Email já cadastrado exibe mensagem de erro', async () => {
    vi.spyOn(apiModule.api, 'post').mockRejectedValue(
      new Error('Este email já está cadastrado.')
    );

    renderRegisterPage();

    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Cassiano' } });
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'existente@email.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'Senha123' } });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Este email já está cadastrado.');
    });
  });
});
