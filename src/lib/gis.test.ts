import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderGoogleButton } from './gis';

const SCRIPT = 'script[src="https://accounts.google.com/gsi/client"]';
const findScript = () => document.head.querySelector<HTMLScriptElement>(SCRIPT);

afterEach(() => {
  document.head.querySelectorAll(SCRIPT).forEach((script) => script.remove());
  delete window.google;
  vi.unstubAllEnvs();
});

describe('renderGoogleButton', () => {
  it('rejects when the script fails to load and lets a retry load it again', async () => {
    const el = document.createElement('div');

    const first = renderGoogleButton(el, vi.fn());
    findScript()?.dispatchEvent(new Event('error'));
    await expect(first).rejects.toThrow();
    expect(findScript()).toBeNull();

    const retry = renderGoogleButton(el, vi.fn());
    expect(document.head.querySelectorAll(SCRIPT)).toHaveLength(1);
    findScript()?.dispatchEvent(new Event('error'));
    await expect(retry).rejects.toThrow();
  });

  it('initializes Google Identity Services and renders the button', async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-123');
    const initialize = vi.fn();
    const renderButton = vi.fn();
    window.google = { accounts: { id: { initialize, renderButton } } };
    const el = document.createElement('div');
    const onCredential = vi.fn();

    const rendering = renderGoogleButton(el, onCredential);
    findScript()?.dispatchEvent(new Event('load'));
    await rendering;

    expect(initialize).toHaveBeenCalledWith(expect.objectContaining({ client_id: 'client-123' }));
    initialize.mock.calls[0]?.[0].callback({ credential: 'google-jwt' });
    expect(onCredential).toHaveBeenCalledWith('google-jwt');
    expect(renderButton).toHaveBeenCalledWith(el, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'signin_with',
      locale: 'pt-BR',
    });
  });
});
