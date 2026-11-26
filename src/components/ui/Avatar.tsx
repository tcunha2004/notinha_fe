import { cn } from '../../lib/cn';
import { getInitials } from '../../lib/purchase';

/** Store initials in a gray circle: no per-store colors, the amount is what stands out.
 *  Decorative: the store name is always shown next to it. */
export function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-superficie font-bold tracking-[-0.01em] [font-stretch:112%]',
        size === 'md' ? 'size-11 text-[15px]' : 'size-16 text-[22px]',
      )}
    >
      {getInitials(name)}
    </span>
  );
}
