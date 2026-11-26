import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router';
import { cn } from '../../lib/cn';

const tones = {
  /** On white (or black in dark mode). */
  fundo: 'bg-superficie text-texto',
  /** On the green. */
  marca: 'bg-sobre-marca-suave text-sobre-marca',
  /** On the camera. */
  camera: 'bg-cinza-800 text-branco',
};

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name (Portuguese), required: the button is icon-only. */
  label: string;
  icon: LucideIcon;
  to?: string;
  tone?: keyof typeof tones;
}

/** 44px circle with a 22px icon. Renders a link when `to` is set. */
export function IconButton({
  label,
  icon: Icon,
  to,
  tone = 'fundo',
  className,
  ...props
}: IconButtonProps) {
  const classes = cn(
    'pressable grid size-11 shrink-0 place-items-center rounded-full',
    tones[tone],
    className,
  );
  const icon = <Icon aria-hidden size={22} strokeWidth={2} />;
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
