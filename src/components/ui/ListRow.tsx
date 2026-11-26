import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '../../lib/cn';

interface ListRowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  to?: string;
  /** `compra`: 72px with an avatar. `item`: 64px. */
  density?: 'compra' | 'item';
  /** Paints the row in the attention color (an item to check). */
  alert?: boolean;
  /** Keep the scroll position when the link opens a sheet over the page. */
  preventScrollReset?: boolean;
}

/** Edge-to-edge row. The whole row is tappable (no chevron); the name truncates, the amount never wraps. */
export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  to,
  density = 'item',
  alert = false,
  preventScrollReset,
}: ListRowProps) {
  const content = (
    <>
      {leading}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate texto-corpo-forte">{title}</span>
        {subtitle && (
          <span
            className={cn(
              'truncate texto-legenda tabular-nums',
              alert ? 'text-atencao-700' : 'text-texto-secundario',
            )}
          >
            {subtitle}
          </span>
        )}
      </div>
      {trailing}
    </>
  );
  const classes = cn(
    'flex items-center',
    density === 'compra' ? 'min-h-18 gap-3.5 py-3' : 'min-h-16 gap-3 py-3.5',
    alert ? 'rounded-md bg-atencao-50 px-3 text-tinta' : 'px-5',
    to && 'transition-colors focus-visible:-outline-offset-2',
    to && !alert && 'hover:bg-superficie active:bg-superficie',
  );
  return (
    <li className={cn(alert && 'px-2')}>
      {to ? (
        <Link to={to} preventScrollReset={preventScrollReset} className={classes}>
          {content}
        </Link>
      ) : (
        <div className={classes}>{content}</div>
      )}
    </li>
  );
}
