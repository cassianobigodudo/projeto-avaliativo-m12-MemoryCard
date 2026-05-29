import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';

function renderWithAuth(hasToken: boolean) {
  if (hasToken) {
    localStorage.setItem('token', 'mock_token');
  } else {
    localStorage.removeItem('token');
  }

  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Página de Login</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Conteúdo Protegido</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── Teste A ──────────────────────────────────────────────────────────────────
  it('Teste A: Sem token — redireciona para /login', () => {
    renderWithAuth(false);
    expect(screen.getByText('Página de Login')).toBeInTheDocument();
  });

  // ── Teste B ──────────────────────────────────────────────────────────────────
  it('Teste B: Com token — renderiza o conteúdo protegido', () => {
    renderWithAuth(true);
    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
  });
});
