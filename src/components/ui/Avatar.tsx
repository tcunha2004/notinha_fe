import { useState } from 'react';
import { cn } from '../../lib/cn';
import { getInitials } from '../../lib/purchase';

const sizes = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-[12px]',
  md: 'size-11 text-[15px]',
  lg: 'size-16 text-[22px]',
};

/** Store or brand logo, falling back to initials in a gray circle when there is none or it fails to load.
 *  Decorative: the name is always shown next to it, or labels the button around it. */
export function Avatar({
  name,
  logo,
  size = 'md',
}: {
  name: string;
  logo?: string | null;
  size?: keyof typeof sizes;
}) {
  const [broken, setBroken] = useState(false);
  const base = cn('shrink-0 rounded-full', sizes[size]);
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
      )}
    >
      {getInitials(name)}
    </span>
  );
}
