import type { ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router';
import { cn } from '../../lib/cn';

const variants = {
  filled: 'bg-brand-green text-label-on-accent shadow-brand hover:bg-brand-green-dark',
  tinted: 'bg-brand-mint text-brand-green-dark hover:bg-brand-mint/70',
  gray: 'bg-fill-secondary text-label-primary hover:bg-fill-tertiary',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  to?: string;
}

/** 52px capsule button. Renders a link when `to` is set. */
export function Button({ variant = 'filled', to, className, children, ...props }: ButtonProps) {
  const classes = cn(
    'pressable flex h-13 w-full items-center justify-center gap-2 rounded-full px-6 text-headline transition-colors',
    variants[variant],
    className,
  );
  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
