import { Tag } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Avatar } from '../ui/Avatar';

const unbranded = {
  xs: { circle: 'size-6', icon: 13 },
  sm: { circle: 'size-8', icon: 15 },
  md: { circle: 'size-11', icon: 19 },
};

/** The brand's logo (initials without one); a tag icon for unbranded items ("SM" would read as a
 *  brand). Decorative. */
export function BrandMark({
  brand,
  logo,
  size,
}: {
  brand: string | null;
  logo?: string | null;
  size: keyof typeof unbranded;
}) {
  if (brand) return <Avatar name={brand} logo={logo} size={size} />;
  const { circle, icon } = unbranded[size];
  return (
    <span
      aria-hidden
      className={cn('grid shrink-0 place-items-center rounded-full bg-superficie', circle)}
    >
      <Tag size={icon} strokeWidth={2.25} className="text-texto-secundario" />
    </span>
  );
}
