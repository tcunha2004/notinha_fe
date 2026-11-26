/** Native `<progress>` as a 6px ink capsule, for the green "Lendo" screen. */
export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <progress
      value={value}
      max={max}
      aria-label={label}
      className="block h-1.5 w-full appearance-none overflow-hidden rounded-full bg-tinta/15 [&::-moz-progress-bar]:bg-tinta [&::-webkit-progress-bar]:bg-tinta/15 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-tinta [&::-webkit-progress-value]:transition-[width]"
    />
  );
}
