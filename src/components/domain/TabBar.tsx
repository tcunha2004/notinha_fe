import { Camera, House, ReceiptText } from 'lucide-react';
import { Link, NavLink } from 'react-router';
import { cn } from '../../lib/cn';

const tabs = [
  { to: '/', label: 'Início', icon: House },
  { to: '/purchases', label: 'Compras', icon: ReceiptText },
];

/** Floating Liquid Glass tab bar (phones and tablets). */
export function TabBar({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Principal"
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-20 pb-[max(16px,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      <div className="mx-auto flex max-w-[640px] items-center justify-between px-4">
        <ul className="glass pointer-events-auto flex gap-1 rounded-full p-1">
          {tabs.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  cn(
                    'pressable flex h-14 w-24 flex-col items-center justify-center gap-0.5 rounded-full text-caption-2 transition-colors',
                    isActive
                      ? 'bg-fill-secondary text-brand-green'
                      : 'text-label-primary hover:bg-fill-tertiary',
                  )
                }
              >
                <Icon aria-hidden size={22} strokeWidth={2} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <Link
          to="/scan"
          aria-label="Enviar nota"
          className="pressable pointer-events-auto grid size-16 place-items-center rounded-full bg-brand-gradient text-label-on-accent shadow-brand"
        >
          <Camera aria-hidden size={26} strokeWidth={2.25} />
        </Link>
      </div>
    </nav>
  );
}
