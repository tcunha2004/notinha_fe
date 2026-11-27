import { cn } from '../../lib/cn';
import { formatDecimal, formatUnit } from '../../lib/format';

/** Shelf-tag price: small "R$", wide tabular number, then the unit ("/kg"). Takes the parent's color. */
export function Price({
  value,
  unit,
  size = 'card',
  className,
}: {
  value: number;
  unit: string;
  /** `card`: the grid tag. `destaque`: the detail sheet's tag. */
  size?: 'card' | 'destaque';
  className?: string;
}) {
  const big = size === 'destaque';
  return (
    <span className={cn('flex items-start whitespace-nowrap tabular-nums', className)}>
      <span
        className={cn(
          'mr-1 font-semibold',
          big ? 'pt-1 text-[17px] leading-5' : 'pt-0.5 text-[13px] leading-4',
        )}
      >
        R$
      </span>
      <span
        className={cn(
          'font-bold [font-stretch:112%]',
          big
            ? 'text-[40px] leading-[42px] tracking-[-0.04em]'
            : 'text-[22px] leading-6 tracking-[-0.03em]',
        )}
      >
        {formatDecimal(value)}
      </span>
      <span
        className={cn(
          'ml-0.5 self-end font-semibold',
          big ? 'pb-1 text-[17px] leading-5' : 'text-[13px] leading-4',
        )}
      >
        /{formatUnit(unit)}
      </span>
    </span>
  );
}
