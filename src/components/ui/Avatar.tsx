import { cn } from '../../lib/cn';
import { getInitials } from '../../lib/purchase';

const tones = {
  green: 'bg-brand-mint text-brand-green',
  orange: 'bg-accent-orange-soft text-accent-orange',
};

/** Store initials in a tinted circle. Decorative: the store name is always shown next to it. */
export function Avatar({
  name,
  tone = 'green',
  size = 'md',
}: {
  name: string;
  tone?: keyof typeof tones;
  size?: 'md' | 'lg';
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-semibold',
        tones[tone],
        size === 'md' ? 'size-10 text-callout' : 'size-17 text-title-2',
      )}
    >
      {getInitials(name)}
    </span>
  );
}
