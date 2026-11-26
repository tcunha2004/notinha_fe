import { TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Logo } from '../components/domain/Logo';
import { cn } from '../lib/cn';
import { renderGoogleButton } from '../lib/gis';
import { loginWithGoogle } from '../services/auth';

/** Key moment: the green fills the screen. */
export function Login() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [buttonReady, setButtonReady] = useState(false);
  // From the Google credential until Início is on screen (login + Início's loaders).
  const [signingIn, setSigningIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    // Cleared on unmount: StrictMode mounts twice and a late callback must not act on a dead page.
    let active = true;

    const onCredential = async (credential: string) => {
      if (!active) return;
      setError(false);
      setSigningIn(true);
      try {
        await loginWithGoogle(credential);
        // Stays "signing in" on purpose: the page unmounts once Início has loaded.
        if (active) void navigate('/', { replace: true });
      } catch {
        if (active) {
          setSigningIn(false);
          setError(true);
        }
      }
    };

    renderGoogleButton(el, (credential) => void onCredential(credential))
      .then(() => active && setButtonReady(true))
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main className="flex min-h-dvh flex-col bg-marca pt-[max(12px,env(safe-area-inset-top))] text-sobre-marca">
      <div className="page-container flex flex-1 flex-col">
        <Logo mark className="px-5 pt-4 text-[30px]" />

        <div className="flex flex-1 flex-col justify-center gap-4 px-5 py-10">
          <h1 className="text-[50px] leading-[50px] font-extrabold tracking-[-0.045em] text-balance [font-stretch:115%]">
            Fotografe a nota. A gente organiza suas compras.
          </h1>
          <p className="max-w-[300px] text-lg leading-[26px] text-sobre-marca-secundario">
            Cada item e cada preço, sem digitar nada.
          </p>
        </div>

        <div className="flex flex-col gap-4 px-5 pb-[max(34px,env(safe-area-inset-bottom))]">
          {error && (
            <p role="alert" className="flex items-center justify-center gap-2 texto-corpo-forte">
              <TriangleAlert aria-hidden size={18} className="shrink-0" />
              Não foi possível entrar. Tente de novo.
            </p>
          )}
          {/* Placeholder, Google button and spinner share one grid cell: they swap without the page jumping. */}
          <div className="grid min-h-14 place-items-center *:[grid-area:1/1]">
            {/* invisible, not unmounted/display:none: Google draws its iframe here and needs real layout.
                scheme-light: in dark mode the page is `color-scheme: dark`, and a cross-origin iframe
                whose scheme differs gets an opaque white backdrop (the white box around the button). */}
            <div
              ref={buttonRef}
              className={cn(
                'flex w-full justify-center scheme-light',
                (signingIn || !buttonReady) && 'invisible',
              )}
            />
            {signingIn ? (
              <p role="status" className="flex items-center gap-3 texto-botao">
                <span
                  aria-hidden
                  className="block size-6 animate-spin rounded-full border-[2.5px] border-tinta/20 border-t-tinta"
                />
                Entrando…
              </p>
            ) : (
              !buttonReady &&
              !error && (
                <span aria-hidden className="h-10 w-60 animate-pulse rounded-full bg-tinta/12" />
              )
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
