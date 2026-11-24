import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from './router';

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
