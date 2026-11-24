import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router';
import { cn } from '../../lib/cn';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name (Portuguese), required: the button is icon-only. */
  label: string;
  icon: LucideIcon;
  to?: string;
  tone?: 'light' | 'dark';
}

/** 44px circular Liquid Glass icon button. Renders a link when `to` is set. */
export function GlassButton({
  label,
  icon: Icon,
  to,
  tone = 'light',
  className,
  ...props
}: GlassButtonProps) {
  const classes = cn(
    'pressable grid size-11 shrink-0 place-items-center rounded-full',
    tone === 'light' ? 'glass text-label-primary' : 'glass-dark text-label-on-accent',
    className,
  );
  const icon = <Icon aria-hidden size={20} strokeWidth={2.25} />;
  if (to) {
    return (
      <Link to={to} aria-label={label} className={classes}>
        {icon}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} className={classes} {...props}>
      {icon}
    </button>
  );
}
