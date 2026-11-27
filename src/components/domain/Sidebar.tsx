import { Camera, House, LogOut, Package, ReceiptText } from 'lucide-react';
import { Form, Link, NavLink } from 'react-router';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';
import { Logo } from './Logo';

const items = [
  { to: '/', label: 'Início', icon: House },
  { to: '/purchases', label: 'Compras', icon: ReceiptText },
  { to: '/products', label: 'Produtos', icon: Package },
];

/** Desktop (≥ 1024px) version of the tab bar: flat, separated by a line, no shadow. */
export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-20 w-70 flex-col gap-8 border-r border-linha bg-fundo px-5 py-6',
        className,
      )}
    >
      <Link to="/" className="self-start rounded-md text-[24px]">
        <Logo />
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
                    'flex h-12 items-center gap-3 rounded-full px-4 texto-corpo-forte transition-colors',
                    isActive
                      ? 'bg-superficie text-texto'
                      : 'text-texto-secundario hover:bg-superficie',
                  )
                }
              >
                <Icon aria-hidden size={22} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto flex flex-col gap-3">
        <Button to="/scan">
          <Camera aria-hidden size={20} />
          Enviar nota
        </Button>
        <Form method="post" action="/logout">
          <Button type="submit" variant="secundario" className="w-full">
            <LogOut aria-hidden size={20} />
            Sair
          </Button>
        </Form>
      </div>
    </aside>
  );
}
