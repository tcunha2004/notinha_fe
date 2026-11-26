import { cn } from '../../lib/cn';
import { formatDecimal } from '../../lib/format';

/** The app's hero: "R$" at ~44% of the size, aligned to the top, then the tabular number. */
export function Amount({
  value,
  size,
  className,
}: {
  value: number;
  /** `hero`: the screen's main number (Início). `grande`: one purchase (Nota lida, Detalhe). */
  size: 'hero' | 'grande';
  className?: string;
}) {
  const hero = size === 'hero';
  return (
    <p
      className={cn(
        'flex items-start gap-1.5',
        hero ? 'texto-valor-hero' : 'texto-valor-grande',
        className,
      )}
    >
      <span
        className={cn(
          'tracking-[-0.01em]',
          hero ? 'pt-1.5 text-[28px] leading-8' : 'pt-1 text-[22px] leading-[26px]',
        )}
      >
        R$
      </span>
      {formatDecimal(value)}
    </p>
  );
}
