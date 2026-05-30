import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddGameModal } from '@/components/AddGameModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderModal(props: Partial<Parameters<typeof AddGameModal>[0]> = {}) {
  const defaults = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
    error: null,
  };
  return render(<AddGameModal {...defaults} {...props} />);
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('AddGameModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Teste A ──────────────────────────────────────────────────────────────────
  it('Teste A: Modal fechado — não deve renderizar nada', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // ── Teste B ──────────────────────────────────────────────────────────────────
  it('Teste B: Modal aberto — deve renderizar os campos do formulário', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/plataforma/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/estado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/região/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument();
  });

  // ── Teste C ──────────────────────────────────────────────────────────────────
  it('Teste C: Formulário vazio — não deve chamar onSubmit (validação HTML nativa)', () => {
    const onSubmit = vi.fn();
    renderModal({ onSubmit });

    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  // ── Teste D ──────────────────────────────────────────────────────────────────
  it('Teste D: Submissão com dados válidos — deve chamar onSubmit com os dados corretos', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderModal({ onSubmit });

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Super Mario World' },
    });
    fireEvent.change(screen.getByLabelText(/plataforma/i), {
      target: { value: 'Super Nintendo' },
    });

    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Super Mario World',
          platform: 'Super Nintendo',
          condition: 'Sealed',
        })
      );
    });
  });

  // ── Teste E ──────────────────────────────────────────────────────────────────
  it('Teste E: Botão cancelar — deve chamar onClose', () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(onClose).toHaveBeenCalled();
  });

  // ── Teste F ──────────────────────────────────────────────────────────────────
  it('Teste F: Exibe mensagem de erro quando error prop é fornecida', () => {
    renderModal({ error: 'Erro ao adicionar jogo.' });

    expect(screen.getByRole('alert')).toHaveTextContent('Erro ao adicionar jogo.');
  });

  // ── Teste G ──────────────────────────────────────────────────────────────────
  it('Teste G: Estado de loading — botão deve mostrar "Salvando..." e ficar desabilitado', () => {
    renderModal({ isLoading: true });

    const button = screen.getByRole('button', { name: /salvando/i });
    expect(button).toBeDisabled();
  });
});
