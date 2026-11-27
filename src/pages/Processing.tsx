import { TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { StepList, type Step } from '../components/domain/StepList';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { uploadInvoice, ApiError } from '../services/purchases';

/** After this long, reassure the user it hasn't frozen (the agent may retry up to 3x). */
const SLOW_MS = 10_000;

/** 'unreadable' = the API said nothing on the photo is legible (422): a new photo is needed.
 *  'invalid' = it's not a supermarket/pharmacy receipt (422, reason 'invalid'): send another receipt.
 *  'failed' = network or server error: the photo is fine, so we offer to resend the same one.
 *  'duplicate' = this receipt was already saved (409): we point to the existing purchase. */
type Phase = 'reading' | 'unreadable' | 'invalid' | 'failed' | 'duplicate';

/** Short title + one sentence + one action (Voz board, "Vazio e erro"). */
const problems = {
  unreadable: {
    title: 'Não deu pra ler a nota',
    text: 'Tente com mais luz e com a nota inteira dentro do quadro. Nada foi salvo.',
  },
  invalid: {
    title: 'Essa nota não é de mercado',
    text: 'Por enquanto, o Notinha só lê notas de supermercado e farmácia',
  },
  duplicate: {
    title: 'Esta nota já foi salva',
    text: 'Você já tem uma compra desta loja no mesmo dia e horário. Nada foi salvo de novo.',
  },
  failed: {
    title: 'Não deu pra enviar agora',
    text: 'Confira sua conexão. Sua foto não foi perdida.',
  },
};

const lineWidths = ['w-[70%]', 'w-[92%]', 'w-[56%]', null, 'w-[84%]', 'w-[60%]', 'w-[78%]'];

/** Receipt thumbnail: ink lines for what was read, gray for what's still coming. */
function ReceiptThumb() {
  return (
    <div
      aria-hidden
      className="flex h-35 w-28 flex-col gap-2.25 rounded-[14px] bg-branco px-3.5 py-4.5"
    >
      {lineWidths.map((width, i) =>
        width ? (
          <span
            key={i}
            className={`block h-1.5 rounded-[3px] ${i < 3 ? 'bg-tinta' : 'bg-linha'} ${width}`}
          />
        ) : (
          <span key={i} className="-mx-3.5 block h-0.75 bg-tinta" />
        ),
      )}
    </div>
  );
}

function readingSteps(slow: boolean): Step[] {
  return [
    { title: 'Foto recebida', subtitle: 'Guardada com segurança', status: 'done' },
    {
      title: 'Lendo os itens',
      subtitle: slow ? 'Quase lá, conferindo os detalhes…' : 'Loja, data e cada item',
      status: 'active',
    },
    { title: 'Conferindo o total', subtitle: 'Soma dos itens × total da nota', status: 'pending' },
  ];
}

export function Processing() {
  const navigate = useNavigate();
  const file = (useLocation().state as { file?: File } | null)?.file;
  const [phase, setPhase] = useState<Phase>('reading');
  const [slow, setSlow] = useState(false);
  const [existingId, setExistingId] = useState<string>();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [attempt, setAttempt] = useState(0); // "Tentar de novo" bumps it to upload again

  // One upload per attempt. Leaving the screen (Cancelar) aborts it: the API stops reading and
  // saves nothing. StrictMode mounts twice in dev: the first upload is aborted, the second goes on.
  useEffect(() => {
    if (!file) return;
    const controller = new AbortController();
    const { signal } = controller;
    uploadInvoice(file, signal).then(
      ({ id }) => {
        // Straight to "Nota lida": it shows what was read and whether it needs a review.
        if (!signal.aborted) navigate(`/purchases/${id}/review`, { replace: true });
      },
      (error: unknown) => {
        if (signal.aborted) return;
        const code = error instanceof ApiError ? error.status : 0; // 0 = no connection
        if (code === 401) navigate('/login', { replace: true });
        else if (code === 409) {
          setExistingId((error as ApiError).purchaseId);
          setPhase('duplicate');
        } else if (code === 422) {
          setPhase((error as ApiError).reason === 'invalid' ? 'invalid' : 'unreadable');
        } else setPhase('failed');
      },
    );
    return () => controller.abort();
  }, [file, attempt, navigate]);

  useEffect(() => {
    if (phase !== 'reading') {
      headingRef.current?.focus();
      return;
    }
    const timer = setTimeout(() => setSlow(true), SLOW_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  // Opened by URL or after a refresh lost the photo: nothing to read.
  if (!file) return <Navigate to="/scan" replace />;

  const retry = () => {
    setSlow(false);
    setPhase('reading');
    setAttempt((n) => n + 1);
  };
  const newPhoto = () => navigate('/scan', { replace: true });
  const shell =
    'flex min-h-dvh flex-col pt-[max(24px,env(safe-area-inset-top))] pb-[max(34px,env(safe-area-inset-bottom))]';

  if (phase === 'reading') {
    // Key moment: the green fills the screen.
    return (
      <main className={`${shell} bg-marca text-sobre-marca animate-surgir`}>
        <div className="page-container flex flex-1 flex-col px-5">
          <div className="pt-6">
            <ReceiptThumb />
          </div>
          <p className="mt-8 texto-rotulo text-sobre-marca-secundario">Etapa 2 de 3</p>
          <h1 className="mt-2 texto-display">Lendo sua nota…</h1>
          <p className="mt-2 max-w-[320px] text-[17px] leading-6 text-sobre-marca-secundario">
            A IA está lendo a loja, a data e cada item.
          </p>
          <div className="mt-8" aria-live="polite">
            <StepList steps={readingSteps(slow)} />
          </div>
          <div className="mt-6">
            <ProgressBar value={2} max={3} label="Progresso da leitura" />
          </div>
          <div className="mt-auto pt-8">
            <Button variant="translucido" to="/">
              Cancelar
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const problem = problems[phase];
  return (
    <main className={`${shell} animate-surgir`}>
      <div className="page-container flex flex-1 flex-col px-5">
        <div role="alert" className="flex flex-1 flex-col justify-center gap-2 py-10">
          <span className="mb-4 grid size-14 place-items-center rounded-full bg-atencao-50 text-atencao-700">
            <TriangleAlert aria-hidden size={28} />
          </span>
          <h1 ref={headingRef} tabIndex={-1} className="texto-titulo-1 outline-none">
            {problem.title}
          </h1>
          <p className="texto-corpo text-texto-secundario">{problem.text}</p>
        </div>

        <div className="flex flex-col gap-3">
          {phase === 'unreadable' ? (
            <Button onClick={newPhoto}>Tirar outra foto</Button>
          ) : phase === 'invalid' ? (
            <Button onClick={newPhoto}>Enviar outra nota</Button>
          ) : phase === 'duplicate' ? (
            <Button to={`/purchases/${existingId}`}>Ver compra salva</Button>
          ) : (
            <Button onClick={retry}>Tentar de novo</Button>
          )}
          <Button variant="secundario" to="/">
            Voltar para o início
          </Button>
        </div>
      </div>
    </main>
  );
}
