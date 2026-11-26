import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

const tones = {
  atencao: { box: 'bg-atencao-50', accent: 'text-atencao-700' },
  erro: { box: 'bg-erro-50', accent: 'text-erro-700' },
};

/** Sits on top of the content it affects. The title says what; the text says what to do. */
export function Notice({
  tone = 'atencao',
  title,
  titleId,
  children,
  action,
  className,
}: {
  tone?: keyof typeof tones;
  title: string;
  titleId?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const { box, accent } = tones[tone];
  return (
    <section
      aria-labelledby={titleId}
      className={cn('flex flex-col gap-3 rounded-lg p-4', box, className)}
    >
      <div className="flex items-start gap-3">
        <TriangleAlert aria-hidden size={22} className={cn('shrink-0', accent)} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 id={titleId} className="texto-corpo-forte text-tinta">
            {title}
          </h2>
          <p className={cn('texto-legenda text-pretty', accent)}>{children}</p>
        </div>
      </div>
      {action}
    </section>
  );
}
