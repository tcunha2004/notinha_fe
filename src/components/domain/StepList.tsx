import { Check, TriangleAlert } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface Step {
  title: string;
  subtitle: string;
  status: 'done' | 'active' | 'pending' | 'error';
}

const statusText = {
  done: 'concluída',
  active: 'em andamento',
  pending: 'pendente',
  error: 'falhou',
};

function StepIcon({ status }: { status: Step['status'] }) {
  if (status === 'done') {
    return (
      <span className="grid size-7 place-items-center rounded-full bg-tinta text-marca">
        <Check size={16} strokeWidth={2.75} />
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="grid size-7 place-items-center rounded-full bg-tinta text-atencao-500">
        <TriangleAlert size={15} strokeWidth={2.5} />
      </span>
    );
  }
  if (status === 'active') {
    return (
      <span className="block size-7 animate-spin rounded-full border-[2.5px] border-tinta/20 border-t-tinta" />
    );
  }
  return (
    <span className="block size-7 rounded-full border-2 border-dashed border-sobre-marca-secundario opacity-60" />
  );
}

/** Reading steps for the green "Lendo a nota" moment: done, in progress and next. */
export function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol aria-label="Etapas" className="flex flex-col gap-4.5">
      {steps.map((step) => (
        <li
          key={step.title}
          aria-current={step.status === 'active' ? 'step' : undefined}
          className="flex items-start gap-3.5"
        >
          <span aria-hidden className="shrink-0">
            <StepIcon status={step.status} />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p
              className={cn(
                'text-[17px] leading-[22px] font-semibold',
                step.status === 'pending' ? 'text-sobre-marca-secundario' : 'text-sobre-marca',
              )}
            >
              {step.title}
              <span className="sr-only"> ({statusText[step.status]})</span>
            </p>
            <p className="texto-legenda text-sobre-marca-secundario">{step.subtitle}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
