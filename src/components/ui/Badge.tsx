import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

const tones = {
  warning: 'bg-accent-orange-soft text-accent-orange px-2 py-0.5 text-caption-1 font-semibold',
  success: 'bg-brand-mint text-brand-green-dark px-3.5 py-1.5 text-footnote font-semibold',
  onAccent: 'bg-on-accent-fill text-label-on-accent px-4 py-1.5 text-subheadline font-semibold',
};

export function Badge({
  tone,
  children,
  className,
}: {
  tone: keyof typeof tones;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
