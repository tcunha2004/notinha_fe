import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

const tones = {
  /** 24px state chip ("Revisar"). */
  atencao: 'h-6 px-2.5 texto-micro bg-atencao-50 text-atencao-700',
  /** 24px, something created on save ("Novo"). */
  novo: 'h-6 px-2.5 texto-micro bg-verde-50 text-verde-700',
  /** 32px, shown after the reading ("A soma dos itens confere com o total"). */
  confirmacao: 'h-8 px-3.5 text-sm leading-[18px] font-semibold bg-verde-50 text-verde-700',
  /** 32px, the reading needs a look. */
  alerta: 'h-8 px-3.5 text-sm leading-[18px] font-semibold bg-atencao-50 text-atencao-700',
};

/** Short state, always with text (never color alone). */
export function Badge({
  tone,
  children,
  className,
}: {
  tone: keyof typeof tones;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
