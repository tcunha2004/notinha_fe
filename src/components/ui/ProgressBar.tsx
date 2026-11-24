/** Native `<progress>` styled as a thin capsule. */
export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <progress
      value={value}
      max={max}
      aria-label={label}
      className="block h-1.5 w-full appearance-none overflow-hidden rounded-full bg-fill-secondary [&::-moz-progress-bar]:bg-brand-green [&::-webkit-progress-bar]:bg-fill-secondary [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-brand-green [&::-webkit-progress-value]:transition-[width]"
    />
  );
}
