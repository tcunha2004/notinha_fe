import { useId } from 'react';
import { cn } from '../../lib/cn';

interface SegmentedControlProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  /** Text shown for each option (defaults to the value). */
  format?: (option: T) => string;
}

/** Up to 3 short options on a 52px gray track; the selected one is ink.
 *  Built on native radios, so arrow keys work for free. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  format = (option) => option,
}: SegmentedControlProps<T>) {
  const name = useId();
  const labelId = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span id={labelId} className="texto-rotulo text-texto-secundario">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="flex h-13 gap-1 rounded-full bg-superficie p-1"
      >
        {options.map((option) => (
          <label
            key={option}
            className={cn(
              'grid h-11 flex-1 cursor-pointer place-items-center rounded-full text-base font-semibold transition-colors duration-[120ms] has-focus-visible:outline-2 has-focus-visible:outline-texto',
              value === option && 'bg-botao-neutro text-sobre-botao-neutro',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            {format(option)}
          </label>
        ))}
      </div>
    </div>
  );
}
