import { useState } from 'react';
import { cn } from '../../lib/cn';
import { getInitials } from '../../lib/purchase';

/** Store logo, falling back to initials in a gray circle when there is none or it fails to load.
 *  Decorative: the store name is always shown next to it. */
export function Avatar({
  name,
  logo,
  size = 'md',
}: {
  name: string;
  logo?: string | null;
  size?: 'md' | 'lg';
}) {
  const [broken, setBroken] = useState(false);
  const base = cn('shrink-0 rounded-full', size === 'md' ? 'size-11' : 'size-16');
  if (logo && !broken) {
    return (
      <img
        src={logo}
        alt=""
        // Logos are hotlinked from other sites, which may refuse requests that carry our Referer.
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        // Logos are drawn for a white background, so keep it white in dark mode too.
        className={cn(base, 'bg-white object-contain p-1 ring-1 ring-linha')}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        base,
        'grid place-items-center bg-superficie font-bold tracking-[-0.01em] [font-stretch:112%]',
        size === 'md' ? 'text-[15px]' : 'text-[22px]',
      )}
    >
      {getInitials(name)}
    </span>
  );
}
