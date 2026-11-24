import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** White grouped-list card. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('overflow-hidden rounded-card bg-bg-card', className)} {...props} />;
}

/** `<ul>` with iOS hairline separators between rows (none after the last). */
export function CardList({ className, ...props }: HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn('divide-y-[0.5px] divide-separator', className)} {...props} />;
}

export interface InfoRow {
  label: string;
  value: ReactNode;
  className?: string;
}

/** Label/value rows (store data, totals) as a description list inside a card. */
export function InfoList({ rows, className }: { rows: InfoRow[]; className?: string }) {
  return (
    <Card className={className}>
      <dl className="divide-y-[0.5px] divide-separator">
        {rows.map((row) => (
          <div
            key={row.label}
            className={cn('flex min-h-12 items-center gap-4 px-4 py-3 text-body', row.className)}
          >
            <dt className="shrink-0 text-label-secondary">{row.label}</dt>
            <dd className="min-w-0 flex-1 truncate text-right">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
