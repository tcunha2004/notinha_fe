import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { StepList, type Step } from '../components/domain/StepList';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';

const READ_DELAY_MS = 2500;
const RESULT_PATH = '/purchases/p1/review';

const steps: Step[] = [
  { title: 'Foto recebida', subtitle: 'Guardada com segurança', status: 'done' },
  {
    title: 'Extraindo os itens',
    subtitle: 'Mercado Bom Dia · 8 itens encontrados',
    status: 'active',
  },
  { title: 'Conferindo o total', subtitle: 'Soma dos itens × total da nota', status: 'pending' },
];

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

/** Receipt thumbnail with a green light sweeping over it. */
function ScanningReceipt() {
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
      <span className="absolute inset-x-0 top-0 h-3/5 animate-scan border-b-2 border-brand-green bg-linear-to-b from-transparent to-brand-green/35" />
    </div>
  );
}

export function Processing() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate(RESULT_PATH, { replace: true }), READ_DELAY_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-[440px] flex-col px-4 pt-[max(56px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))] animate-push">
      <ScanningReceipt />
      <h1 className="mt-8 text-center text-title-1">Lendo sua nota…</h1>
      <p className="mt-1 text-center text-body text-label-secondary">
        A IA está identificando a loja, a data e cada item da sua compra.
      </p>
      <div className="mt-6" aria-live="polite">
        <StepList steps={steps} />
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
    </main>
  );
}
