import { TriangleAlert } from 'lucide-react';
import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Static text before the value, e.g. "R$". */
  prefix?: string;
  /** Shown under the field, with the error ring. */
  error?: string;
}

/** Label always visible on top. Gray field, no border; focus draws a 2px ink ring. */
export function TextField({ label, prefix, error, className, id, ...props }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-erro`;
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="texto-rotulo text-texto-secundario">
        {label}
      </label>
      <div
        className={cn(
          'flex h-13 items-center gap-1.5 rounded-md bg-superficie px-4 text-[17px] leading-[22px]',
          error
            ? 'shadow-[inset_0_0_0_2px_var(--color-erro-700)]'
            : 'has-focus-visible:shadow-[inset_0_0_0_2px_var(--color-texto)]',
        )}
      >
        {prefix && (
          <span aria-hidden className="text-texto-secundario">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="w-full min-w-0 flex-1 bg-transparent tabular-nums outline-none placeholder:text-texto-secundario"
          {...props}
        />
      </div>
      {error && (
        <span id={errorId} className="flex items-center gap-1.5 texto-legenda text-erro-700">
          <TriangleAlert aria-hidden size={16} className="shrink-0" />
          {error}
        </span>
      )}
    </div>
  );
}
