import { afterEach, describe, expect, it, vi } from 'vitest';
import { getMe, loginWithGoogle, logout } from './auth';

const user = { email: 'ana@example.com', name: 'Ana Souza', picture: '' };
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const respond = (status: number, body?: unknown) =>
  fetchMock.mockResolvedValueOnce(new Response(body ? JSON.stringify(body) : null, { status }));

afterEach(() => fetchMock.mockReset());

describe('auth service', () => {
  it('getMe returns the user and sends cookies', async () => {
    respond(200, user);
    await expect(getMe()).resolves.toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/me$/),
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('getMe returns null when not logged in', async () => {
    respond(401);
    await expect(getMe()).resolves.toBeNull();
  });

  it('getMe throws on server errors', async () => {
    respond(503);
    await expect(getMe()).rejects.toThrow();
  });

  it('loginWithGoogle posts the credential', async () => {
    respond(200, user);
    await expect(loginWithGoogle('google-jwt')).resolves.toEqual(user);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit & { body: string }];
    expect(url).toMatch(/\/auth\/google$/);
    expect(init).toMatchObject({ method: 'POST', credentials: 'include' });
    expect(JSON.parse(init.body)).toEqual({ credential: 'google-jwt' });
  });

  it('loginWithGoogle throws when the API rejects', async () => {
    respond(401);
    await expect(loginWithGoogle('forged')).rejects.toThrow();
  });

  it('logout posts with cookies', async () => {
    respond(204);
    await logout();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/logout$/),
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
  });
});
