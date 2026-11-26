import type { ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router';
import { cn } from '../../lib/cn';

const variants = {
  /** The screen's action. At most one per screen. */
  principal: 'bg-marca text-sobre-marca active:bg-marca-pressionada',
  /** Main action on the green and on the camera. */
  neutro: 'bg-botao-neutro text-sobre-botao-neutro',
  /** Supporting actions: see photo, cancel. */
  secundario: 'bg-superficie text-texto',
  /** Secondary action on the green. */
  translucido: 'bg-sobre-marca-suave text-sobre-marca',
  /** On a colored notice (attention / error). */
  claro: 'bg-branco text-tinta',
  /** Confirms something that can't be undone. */
  perigo: 'bg-erro-700 text-branco',
  /** Offers it: quieter, so it isn't tapped by accident. */
  perigoSecundario: 'bg-superficie text-erro-700',
};

const sizes = {
  /** 56px, full width at the bottom of the screen. */
  grande: 'h-14 w-full px-6 texto-botao',
  /** 44px, inline with the content. */
  medio: 'h-11 px-5 text-base leading-5 font-semibold',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  to?: string;
  /** Link outside the app, opened in a new tab. */
  href?: string;
}

/** Pill button. Renders a link when `to` (in-app) or `href` (new tab) is set. */
export function Button({
  variant = 'principal',
  size = 'grande',
  to,
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    'pressable inline-flex shrink-0 items-center justify-center gap-2 rounded-full disabled:opacity-40 aria-disabled:opacity-40',
    variants[variant],
    sizes[size],
    className,
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {children}
      </a>
    );
  }
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
