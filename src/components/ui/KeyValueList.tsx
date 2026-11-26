import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface KeyValue {
  label: string;
  value: ReactNode;
  className?: string;
}

/** Receipt data: key in caption gray, value in body, right-aligned. */
export function KeyValueList({ rows }: { rows: KeyValue[] }) {
  return (
    <dl>
      {rows.map((row) => (
        <div
          key={row.label}
          className={cn('flex min-h-11 items-center justify-between gap-4 px-5', row.className)}
        >
          <dt className="shrink-0 texto-legenda text-texto-secundario">{row.label}</dt>
          <dd className="min-w-0 truncate text-right texto-corpo tabular-nums">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
