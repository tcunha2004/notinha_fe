import { Camera, House, LogOut, ReceiptText } from 'lucide-react';
import { Form, Link, NavLink } from 'react-router';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';

const items = [
  { to: '/', label: 'Início', icon: House },
  { to: '/purchases', label: 'Compras', icon: ReceiptText },
];

/** Left Liquid Glass sidebar (desktop, ≥ 1024px). */
export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'glass fixed inset-y-4 left-4 z-20 w-62 flex-col gap-8 rounded-[28px] p-4',
        className,
      )}
    >
      <Link to="/" className="flex items-center gap-3 rounded-xl px-2 py-1">
        <span className="grid size-9 place-items-center rounded-[10px] bg-brand-gradient text-label-on-accent">
          <ReceiptText aria-hidden size={20} />
        </span>
        <span className="text-title-3 font-bold">Notinha</span>
      </Link>
      <nav aria-label="Principal">
        <ul className="flex flex-col gap-1">
          {items.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex h-11 items-center gap-3 rounded-xl px-3 text-body transition-colors',
                    isActive
                      ? 'bg-fill-secondary font-semibold text-brand-green-dark'
                      : 'hover:bg-fill-tertiary',
                  )
                }
              >
                <Icon aria-hidden size={20} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Button to="/scan" className="mt-auto">
        <Camera aria-hidden size={20} />
        Enviar nota
      </Button>
      <Form method="post" action="/logout">
        <Button type="submit" variant="gray">
          <LogOut aria-hidden size={20} />
          Sair
        </Button>
      </Form>
    </aside>
  );
}
