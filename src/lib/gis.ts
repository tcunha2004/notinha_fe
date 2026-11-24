// Minimal typings for Google Identity Services: only what the login button uses.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }): void;
          renderButton(parent: HTMLElement, options: Record<string, string>): void;
        };
      };
    };
  }
}

let loading: Promise<void> | undefined;

function loadScript(): Promise<void> {
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = undefined;
      script.remove();
      reject(new Error('Google Identity Services failed to load'));
    };
    document.head.append(script);
  });
  return loading;
}

export async function renderGoogleButton(
  el: HTMLElement,
  onCredential: (credential: string) => void,
): Promise<void> {
  await loadScript();
  const gis = window.google?.accounts.id;
  if (!gis) throw new Error('Google Identity Services is unavailable');
  gis.initialize({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    callback: (response) => onCredential(response.credential),
  });
  gis.renderButton(el, {
    theme: 'outline',
    size: 'large',
    shape: 'pill',
    text: 'signin_with',
    locale: 'pt-BR',
  });
}
