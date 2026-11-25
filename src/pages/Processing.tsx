import { Check, Lightbulb, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { StepList, type Step } from '../components/domain/StepList';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { uploadInvoice, UploadError } from '../services/purchases';
import type { PurchaseStatus } from '../types';

/** After this long, reassure the user it hasn't frozen (the agent may retry up to 3x). */
const SLOW_MS = 10_000;

/** 'unreadable' = the API said nothing on the photo is legible (422): a new photo is needed.
 *  'failed' = network or server error: the photo is fine, so we offer to resend the same one. */
type Phase = 'reading' | 'unreadable' | 'failed' | PurchaseStatus;

const lineWidths = [
  'w-3/5',
  'w-2/5',
  'w-4/5',
  'w-3/4',
  'w-5/6',
  'w-3/5',
  'w-3/4',
  'w-1/2',
  'w-4/5',
  'w-3/5',
];

const tips = [
  'Lugar bem iluminado, sem sombra sobre a nota',
  'A nota inteira dentro do quadro',
  'Celular parado, para a foto não sair tremida',
];

/** Receipt thumbnail: a green light sweeps over it while reading; then a check (read) or an alert (failed). */
function ScanningReceipt({ result }: { result?: 'read' | 'failed' }) {
  return (
    <div
      aria-hidden
      className="relative mx-auto h-44 w-33 overflow-hidden rounded-[20px] bg-paper px-4 pt-5 shadow-glass"
    >
      <div className="flex flex-col items-center gap-2">
        {lineWidths.map((width, i) => (
          <span key={i} className={`h-1 rounded-full bg-paper-line ${width}`} />
        ))}
      </div>
      {result === 'read' && (
        <span className="absolute inset-0 grid place-items-center bg-paper/60">
          <span className="grid size-14 place-items-center rounded-full bg-brand-green text-label-on-accent shadow-brand animate-dialog-in">
            <Check size={30} strokeWidth={3} />
          </span>
        </span>
      )}
      {result === 'failed' && (
        <span className="absolute inset-0 grid place-items-center bg-paper/60">
          <span className="grid size-14 place-items-center rounded-full bg-accent-orange-soft">
            <TriangleAlert size={28} className="text-accent-orange" />
          </span>
        </span>
      )}
      {!result && (
        <span className="absolute inset-x-0 top-0 h-3/5 animate-scan border-b-2 border-brand-green bg-linear-to-b from-transparent to-brand-green/35" />
      )}
    </div>
  );
}

function readingSteps(slow: boolean): Step[] {
  return [
    { title: 'Foto recebida', subtitle: 'Guardada com segurança', status: 'done' },
    {
      title: 'Extraindo os itens',
      subtitle: slow ? 'Quase lá, conferindo os detalhes…' : 'Loja, data e cada item da compra',
      status: 'active',
    },
    { title: 'Conferindo o total', subtitle: 'Soma dos itens × total da nota', status: 'pending' },
  ];
}

function readSteps(status: PurchaseStatus): Step[] {
  return [
    { title: 'Foto recebida', subtitle: 'Guardada com segurança', status: 'done' },
    { title: 'Itens extraídos', subtitle: 'Loja, data e cada item da compra', status: 'done' },
    status === 'ok'
      ? { title: 'Total conferido', subtitle: 'A soma dos itens bate com a nota', status: 'done' }
      : {
          title: 'Total com diferença',
          subtitle: 'Vale conferir os itens depois',
          status: 'error',
        },
  ];
}

const unreadableSteps: Step[] = [
  { title: 'Foto recebida', subtitle: 'Enviada para a leitura', status: 'done' },
  { title: 'Não deu para ler', subtitle: 'Nenhum dado legível na foto', status: 'error' },
  { title: 'Conferindo o total', subtitle: 'Soma dos itens × total da nota', status: 'pending' },
];

export function Processing() {
  const navigate = useNavigate();
  const file = (useLocation().state as { file?: File } | null)?.file;
  const [phase, setPhase] = useState<Phase>('reading');
  const [slow, setSlow] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // `started` stops StrictMode's double effect from uploading twice;
  // `alive` drops the answer if the user already left (Cancelar).
  const started = useRef(false);
  const alive = useRef(true);

  const send = useCallback(
    async (image: File) => {
      try {
        const { status } = await uploadInvoice(image);
        // ponytail: success screen instead of opening /purchases/:id, which still reads the mocks.
        // Navigate to the purchase (or its review) once the purchase screens use the API.
        if (alive.current) setPhase(status);
      } catch (error) {
        if (!alive.current) return;
        const code = error instanceof UploadError ? error.status : 0; // 0 = no connection
        if (code === 401) navigate('/login', { replace: true });
        else setPhase(code === 422 ? 'unreadable' : 'failed');
      }
    },
    [navigate],
  );

  useEffect(() => {
    alive.current = true;
    if (file && !started.current) {
      started.current = true;
      void send(file);
    }
    return () => {
      alive.current = false;
    };
  }, [file, send]);

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
    void send(file);
  };
  const newPhoto = () => navigate('/scan', { replace: true });

  if (phase === 'ok' || phase === 'needs_review') {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[440px] flex-col px-4 pt-[max(56px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))] animate-push">
        <ScanningReceipt result="read" />
        <div role="status" className="mt-8 text-center">
          <h1 ref={headingRef} tabIndex={-1} className="text-title-1 outline-none">
            Nota lida com sucesso!
          </h1>
          <p className="mt-1 text-body text-label-secondary">
            {phase === 'ok'
              ? 'Sua compra já está salva e organizada.'
              : 'Sua compra foi salva, mas o total da nota não bateu com a soma dos itens.'}
          </p>
        </div>
        <div className="mt-6">
          <StepList steps={readSteps(phase)} />
        </div>
        <div className="mt-auto flex flex-col gap-3 pt-8">
          <Button onClick={newPhoto}>Enviar outra nota</Button>
          <Button variant="gray" to="/">
            Voltar para o início
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-[440px] flex-col px-4 pt-[max(56px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))] animate-push">
      <ScanningReceipt result={phase === 'reading' ? undefined : 'failed'} />

      {phase === 'reading' ? (
        <>
          <h1 className="mt-8 text-center text-title-1">Lendo sua nota…</h1>
          <p className="mt-1 text-center text-body text-label-secondary">
            A IA está identificando a loja, a data e cada item da sua compra.
          </p>
          <div className="mt-6" aria-live="polite">
            <StepList steps={readingSteps(slow)} />
          </div>
          <div className="mt-6">
            <ProgressBar value={2} max={3} label="Progresso da leitura" />
            <p className="mt-2 text-footnote text-label-secondary">Etapa 2 de 3</p>
          </div>
          <div className="mt-auto pt-8">
            <Button variant="gray" to="/">
              Cancelar
            </Button>
          </div>
        </>
      ) : (
        <>
          <div role="alert" className="mt-8 text-center">
            <h1 ref={headingRef} tabIndex={-1} className="text-title-1 outline-none">
              {phase === 'unreadable'
                ? 'Não conseguimos ler esta nota'
                : 'Não foi possível enviar agora'}
            </h1>
            <p className="mt-1 text-body text-label-secondary">
              {phase === 'unreadable'
                ? 'A foto pode estar escura, tremida ou cortada. Nada foi salvo, é só tentar de novo.'
                : 'Verifique sua conexão. Sua foto não foi perdida.'}
            </p>
          </div>

          {phase === 'unreadable' && (
            <>
              <div className="mt-6">
                <StepList steps={unreadableSteps} />
              </div>
              <Card className="mt-4 p-4">
                <h2 className="flex items-center gap-2 text-headline">
                  <Lightbulb aria-hidden size={20} className="text-accent-orange" />
                  Para a próxima foto
                </h2>
                <ul className="mt-2 list-disc space-y-1 pl-7 text-subheadline text-label-secondary">
                  {tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </Card>
            </>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-8">
            {phase === 'unreadable' ? (
              <Button onClick={newPhoto}>Tirar outra foto</Button>
            ) : (
              <Button onClick={retry}>Tentar de novo</Button>
            )}
            <Button variant="gray" to="/">
              Voltar para o início
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
