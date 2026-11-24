import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Static text before the value, e.g. "R$". */
  prefix?: string;
  /** Replaces the input (e.g. a segmented control) while keeping the row layout. */
  control?: ReactNode;
}

/** Inline form row: label on the left, right-aligned value. */
export function TextField({ label, prefix, control, className, ...props }: TextFieldProps) {
  const row = 'flex min-h-12 items-center gap-3 px-4 py-2 text-body';
  if (control) {
    return (
      <div className={row}>
        <span className="flex-1">{label}</span>
        {control}
      </div>
    );
  }
  return (
    <label
      className={cn(
        row,
        'cursor-text has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-accent-blue',
      )}
    >
      <span className="shrink-0">{label}</span>
      <span className="flex min-w-0 flex-1 items-center justify-end gap-1 text-label-secondary">
        {prefix && <span aria-hidden>{prefix}</span>}
        <input
          className={cn(
            'max-w-full min-w-0 field-sizing-content bg-transparent text-right outline-none placeholder:text-label-tertiary',
            className,
          )}
          {...props}
        />
      </span>
    </label>
  );
}
