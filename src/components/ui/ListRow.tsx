import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '../../lib/cn';

interface ListRowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  to?: string;
  chevron?: boolean;
  className?: string;
}

/** One row of a grouped list. Must live inside a `<CardList>`. */
export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  to,
  chevron = false,
  className,
}: ListRowProps) {
  const content = (
    <>
      {leading}
      <div className="min-w-0 flex-1">
        <div className="truncate text-body">{title}</div>
        {subtitle && (
          <div className="truncate text-subheadline text-label-secondary">{subtitle}</div>
        )}
      </div>
      {trailing && <div className="shrink-0 text-right">{trailing}</div>}
      {chevron && (
        <ChevronRight aria-hidden size={18} className="-mr-1 shrink-0 text-label-tertiary" />
      )}
    </>
  );
  const classes = cn('flex min-h-16 items-center gap-3 px-4 py-3', className);
  return (
    <li>
      {to ? (
        <Link
          to={to}
          className={cn(
            classes,
            'transition-colors hover:bg-fill-tertiary active:bg-fill-tertiary focus-visible:-outline-offset-2',
          )}
        >
          {content}
        </Link>
      ) : (
        <div className={classes}>{content}</div>
      )}
    </li>
  );
}
