import { ReceiptText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { renderGoogleButton } from '../lib/gis';
import { loginWithGoogle } from '../services/auth';

export function Login() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    // Cleared on unmount: StrictMode mounts twice and a late callback must not act on a dead page.
    let active = true;

    const onCredential = async (credential: string) => {
      if (!active) return;
      setError(false);
      try {
        await loginWithGoogle(credential);
        if (active) void navigate('/', { replace: true });
      } catch {
        if (active) setError(true);
      }
    };

    renderGoogleButton(el, (credential) => void onCredential(credential)).catch(() => {
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
      <div ref={buttonRef} />
      {error && (
        <p role="alert" className="text-footnote text-accent-orange">
          Não foi possível entrar. Tente de novo.
        </p>
      )}
    </main>
  );
}
