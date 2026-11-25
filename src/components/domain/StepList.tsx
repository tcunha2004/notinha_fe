import { Check, TriangleAlert } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Card, CardList } from '../ui/Card';

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
      <span className="grid size-6 place-items-center rounded-[8px] bg-brand-green text-label-on-accent">
        <Check aria-hidden size={15} strokeWidth={3} />
      </span>
    );
  }
  if (status === 'error') {
    return <TriangleAlert aria-hidden size={24} className="text-accent-orange" />;
  }
  if (status === 'active') {
    return (
      <span className="block size-6 animate-spin rounded-full border-[2.5px] border-brand-mint border-t-brand-green border-r-brand-green" />
    );
  }
  return (
    <span className="block size-6 rounded-full border-2 border-dashed border-label-tertiary" />
  );
}

export function StepList({ steps }: { steps: Step[] }) {
  return (
    <Card>
      <CardList>
        {steps.map((step) => (
          <li
            key={step.title}
            aria-current={step.status === 'active' ? 'step' : undefined}
            className="flex min-h-18 items-center gap-4 px-4 py-3"
          >
            <span aria-hidden className="shrink-0">
              <StepIcon status={step.status} />
            </span>
            <div className="min-w-0">
              <p
                className={cn('text-headline', step.status === 'pending' && 'text-label-secondary')}
              >
                {step.title}
                <span className="sr-only"> ({statusText[step.status]})</span>
              </p>
              <p className="truncate text-subheadline text-label-secondary">{step.subtitle}</p>
            </div>
          </li>
        ))}
      </CardList>
    </Card>
  );
}
