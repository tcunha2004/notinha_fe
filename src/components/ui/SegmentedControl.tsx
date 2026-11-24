import { useId } from 'react';
import { cn } from '../../lib/cn';

interface SegmentedControlProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

/** iOS segmented control built on native radios (arrow keys work for free). */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const name = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-[9px] bg-fill-tertiary p-0.5"
    >
      {options.map((option) => (
        <label
          key={option}
          className={cn(
            // `after:` widens the hit area to 44px without changing the look.
            'relative grid h-7 min-w-12 cursor-pointer place-items-center rounded-[7px] px-3 text-footnote font-semibold transition-colors after:absolute after:inset-x-0 after:-inset-y-2 has-focus-visible:outline-2 has-focus-visible:outline-accent-blue',
            value === option && 'bg-bg-card shadow-thumb',
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
          {option}
        </label>
      ))}
    </div>
  );
}
