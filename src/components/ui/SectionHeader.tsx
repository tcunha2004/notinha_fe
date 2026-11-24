import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface SectionHeaderProps {
  id?: string;
  title: ReactNode;
  trailing?: ReactNode;
  /** `footnote`: small uppercase list header. `title`: bold section title. */
  variant?: 'footnote' | 'title';
  className?: string;
}

export function SectionHeader({
  id,
  title,
  trailing,
  variant = 'footnote',
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4',
        variant === 'footnote' ? 'px-1 pb-2 text-footnote text-label-secondary' : 'pb-3',
        className,
      )}
    >
      <h2 id={id} className={variant === 'footnote' ? 'uppercase' : 'text-title-3 font-bold'}>
        {title}
      </h2>
      {trailing}
    </div>
  );
}
