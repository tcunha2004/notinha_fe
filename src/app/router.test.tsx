import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderGoogleButton } from '../lib/gis';
import { getMe, loginWithGoogle } from '../services/auth';
import { routes } from './router';

vi.mock('../services/auth', () => ({ getMe: vi.fn(), loginWithGoogle: vi.fn(), logout: vi.fn() }));
vi.mock('../lib/gis', () => ({ renderGoogleButton: vi.fn() }));

const user = { email: 'ana@example.com', name: 'Ana Souza', picture: '' };

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getMe).mockResolvedValue(user);
  vi.mocked(renderGoogleButton).mockResolvedValue();
});

function renderAt(path: string) {
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />);
}

describe('routes render without crashing', () => {
  it.each([
    ['/', 'Início'],
    ['/scan', 'Enviar nota'],
    ['/scan/processing', 'Lendo sua nota…'],
    ['/purchases/p1/review', 'Nota lida'],
    ['/purchases', 'Compras'],
    ['/purchases/p2', 'Compra'],
  ])('%s', async (path, heading) => {
    renderAt(path);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('/purchases/:id/review/items/:itemId opens the edit sheet', async () => {
    renderAt('/purchases/p1/review/items/p1-i8');
    expect(await screen.findByRole('dialog', { name: 'Editar item' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pão francês')).toBeInTheDocument();
  });

  it('shows the review banner for a purchase that needs review', async () => {
    renderAt('/purchases/p2');
    expect(await screen.findByText('Precisa de revisão')).toBeInTheDocument();
  });

  it('unknown purchase shows not found', async () => {
    renderAt('/purchases/nope');
    expect(await screen.findByText('Página não encontrada')).toBeInTheDocument();
  });
});

describe('authentication', () => {
  it.each(['/', '/scan', '/purchases/p2'])(
    'logged out: %s shows the login screen',
    async (path) => {
      vi.mocked(getMe).mockResolvedValue(null);
      renderAt(path);
      expect(await screen.findByRole('heading', { level: 1, name: 'Notinha' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Início' })).not.toBeInTheDocument();
    },
  );

  it('logged in: /login redirects to Início', async () => {
    renderAt('/login');
    expect(await screen.findByRole('heading', { level: 1, name: 'Início' })).toBeInTheDocument();
  });

  it('a Google credential logs in and opens Início', async () => {
    vi.mocked(getMe).mockResolvedValueOnce(null);
    vi.mocked(loginWithGoogle).mockResolvedValue(user);
    vi.mocked(renderGoogleButton).mockImplementation(async (_el, onCredential) => {
      onCredential('google-jwt');
    });
    renderAt('/login');
    expect(await screen.findByRole('heading', { level: 1, name: 'Início' })).toBeInTheDocument();
    expect(loginWithGoogle).toHaveBeenCalledWith('google-jwt');
  });

  it('a rejected login shows the error', async () => {
    vi.mocked(getMe).mockResolvedValue(null);
    vi.mocked(loginWithGoogle).mockRejectedValue(new Error('401'));
    vi.mocked(renderGoogleButton).mockImplementation(async (_el, onCredential) => {
      onCredential('forged');
    });
    renderAt('/login');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível entrar. Tente de novo.',
    );
  });

  it('GIS failing to load shows the error', async () => {
    vi.mocked(getMe).mockResolvedValue(null);
    vi.mocked(renderGoogleButton).mockRejectedValue(new Error('script blocked'));
    renderAt('/login');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível entrar. Tente de novo.',
    );
  });

  it('API down on first load shows the error page', async () => {
    vi.mocked(getMe).mockRejectedValue(new Error('503'));
    renderAt('/');
    expect(await screen.findByText('Algo deu errado')).toBeInTheDocument();
  });
});
