import { ReceiptText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '../lib/cn';
import { renderGoogleButton } from '../lib/gis';
import { loginWithGoogle } from '../services/auth';

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
    <main className="page-container grid min-h-dvh place-content-center justify-items-center gap-6 text-center">
      <span className="grid size-16 place-items-center rounded-[18px] bg-brand-gradient text-label-on-accent">
        <ReceiptText aria-hidden size={32} />
      </span>
      <h1 className="text-large-title">Notinha</h1>
      <p className="text-body text-label-secondary">
        Fotografe a nota, a gente organiza suas compras.
      </p>
      {/* Skeleton, Google button and spinner share one grid cell: they swap without the page jumping. */}
      <div className="grid min-h-11 place-items-center *:[grid-area:1/1]">
        {/* invisible, not unmounted/display:none: Google draws its iframe here and needs real layout. */}
        <div ref={buttonRef} className={cn((signingIn || !buttonReady) && 'invisible')} />
        {signingIn ? (
          <p role="status" className="flex items-center gap-3 text-headline">
            <span
              aria-hidden
              className="block size-6 animate-spin rounded-full border-[2.5px] border-brand-mint border-t-brand-green border-r-brand-green"
            />
            Entrando…
          </p>
        ) : (
          !buttonReady &&
          !error && (
            <span aria-hidden className="h-10 w-60 animate-pulse rounded-full bg-fill-secondary" />
          )
        )}
      </div>
      {error && (
        <p role="alert" className="text-footnote text-accent-orange">
          Não foi possível entrar. Tente de novo.
        </p>
      )}
    </main>
  );
}
