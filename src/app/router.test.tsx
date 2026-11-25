import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderGoogleButton } from '../lib/gis';
import { getMe, loginWithGoogle, logout } from '../services/auth';
import { uploadInvoice, UploadError } from '../services/purchases';
import { routes } from './router';

vi.mock('../services/auth', () => ({ getMe: vi.fn(), loginWithGoogle: vi.fn(), logout: vi.fn() }));
vi.mock('../lib/gis', () => ({ renderGoogleButton: vi.fn() }));
vi.mock('../services/purchases', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/purchases')>()),
  uploadInvoice: vi.fn(),
}));

const user = { email: 'ana@example.com', name: 'Ana Souza', picture: '' };

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getMe).mockResolvedValue(user);
  vi.mocked(renderGoogleButton).mockResolvedValue();
});

function renderAt(path: string, state?: unknown) {
  const entry = { pathname: path, state };
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [entry] })} />);
}

describe('routes render without crashing', () => {
  it.each([
    ['/', 'Início'],
    ['/scan', 'Enviar nota'],
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

  it('shows "Entrando…" while the login is in flight', async () => {
    vi.mocked(getMe).mockResolvedValue(null);
    vi.mocked(loginWithGoogle).mockReturnValue(new Promise(() => {})); // slow backend
    vi.mocked(renderGoogleButton).mockImplementation(async (_el, onCredential) => {
      onCredential('google-jwt');
    });
    renderAt('/login');
    expect(await screen.findByRole('status')).toHaveTextContent('Entrando…');
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

  it('opening /logout by URL does not render a blank page', async () => {
    renderAt('/logout');
    expect(await screen.findByRole('heading', { level: 1, name: 'Início' })).toBeInTheDocument();
  });

  it('API down on first load shows the error page', async () => {
    vi.mocked(getMe).mockRejectedValue(new Error('503'));
    renderAt('/');
    expect(await screen.findByText('Algo deu errado')).toBeInTheDocument();
  });

  it('the profile button shows the user data', async () => {
    renderAt('/');
    await userEvent.click(await screen.findByRole('button', { name: 'Seu perfil' }));
    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByText('ana@example.com')).not.toBeInTheDocument();
  });

  it('Sair ends the session and shows the login screen', async () => {
    vi.mocked(logout).mockImplementation(async () => {
      vi.mocked(getMe).mockResolvedValue(null); // the backend forgets the session
    });
    renderAt('/');
    await screen.findByRole('heading', { level: 1, name: 'Início' });
    // jsdom ignores the CSS breakpoints, so both Home's and the Sidebar's buttons exist.
    const [sair] = screen.getAllByRole('button', { name: 'Sair' });
    await userEvent.click(sair as HTMLElement);
    expect(await screen.findByRole('heading', { level: 1, name: 'Notinha' })).toBeInTheDocument();
    expect(logout).toHaveBeenCalledOnce();
  });
});

describe('sending a receipt', () => {
  const photo = new File(['jpeg'], 'nota.jpg', { type: 'image/jpeg' });
  const processing = () => renderAt('/scan/processing', { file: photo });

  it('picking a photo starts reading it', async () => {
    vi.mocked(uploadInvoice).mockReturnValue(new Promise(() => {})); // still reading
    renderAt('/scan');
    await userEvent.upload(await screen.findByLabelText('Galeria'), photo);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Lendo sua nota…' }),
    ).toBeInTheDocument();
    expect(uploadInvoice).toHaveBeenCalledExactlyOnceWith(photo);
  });

  it('a photo over 10 MB is refused before uploading', async () => {
    const big = new File(['x'], 'nota.jpg', { type: 'image/jpeg' });
    Object.defineProperty(big, 'size', { value: 11 * 1024 * 1024 });
    renderAt('/scan');
    await userEvent.upload(await screen.findByLabelText('Galeria'), big);
    expect(await screen.findByRole('alert')).toHaveTextContent('A foto passa de 10 MB');
    expect(uploadInvoice).not.toHaveBeenCalled();
  });

  it('opening the processing screen without a photo goes back to the camera', async () => {
    renderAt('/scan/processing');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Enviar nota' }),
    ).toBeInTheDocument();
  });

  const success = { level: 1, name: 'Nota lida com sucesso!' } as const;

  it('ok shows the success screen', async () => {
    vi.mocked(uploadInvoice).mockResolvedValue({ id: 'p2', status: 'ok' });
    processing();
    expect(await screen.findByRole('heading', success)).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('já está salva');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar outra nota' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Enviar nota' }),
    ).toBeInTheDocument();
  });

  it('needs_review shows the success screen with the total warning', async () => {
    vi.mocked(uploadInvoice).mockResolvedValue({ id: 'p1', status: 'needs_review' });
    processing();
    await screen.findByRole('heading', success);
    expect(screen.getByRole('status')).toHaveTextContent('não bateu');
  });

  it('unreadable photo explains it and offers a new photo', async () => {
    vi.mocked(uploadInvoice).mockRejectedValue(new UploadError(422));
    processing();
    const heading = await screen.findByRole('heading', {
      level: 1,
      name: 'Não conseguimos ler esta nota',
    });
    expect(heading).toHaveFocus();
    expect(screen.getByRole('alert')).toHaveTextContent('Nada foi salvo');
    expect(screen.getByText('Para a próxima foto')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tirar outra foto' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Enviar nota' }),
    ).toBeInTheDocument();
  });

  it('a network failure resends the same photo', async () => {
    vi.mocked(uploadInvoice)
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({ id: 'p2', status: 'ok' });
    processing();
    await screen.findByRole('heading', { level: 1, name: 'Não foi possível enviar agora' });
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByRole('heading', success)).toBeInTheDocument();
    expect(uploadInvoice).toHaveBeenNthCalledWith(2, photo);
  });

  it('an expired session goes to login', async () => {
    vi.mocked(uploadInvoice).mockRejectedValue(new UploadError(401));
    processing();
    vi.mocked(getMe).mockResolvedValue(null);
    expect(await screen.findByRole('heading', { level: 1, name: 'Notinha' })).toBeInTheDocument();
  });
});
