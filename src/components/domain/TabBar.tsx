import { Camera, House, Package, ReceiptText, type LucideIcon } from 'lucide-react';
import { Link, NavLink } from 'react-router';
import { cn } from '../../lib/cn';

function Tab({ to, label, icon: Icon }: { to: string; label: string; icon: LucideIcon }) {
  return (
    <NavLink
      to={to}
      end
      aria-label={label}
      className={({ isActive }) =>
        cn(
          'group flex h-12 w-16 flex-col items-center justify-center gap-1 rounded-md',
          isActive ? 'text-texto' : 'text-texto-secundario',
        )
      }
    >
      <Icon aria-hidden size={26} strokeWidth={2} />
      {/* Active tab: ink icon + a 4px dot. */}
      <span
        aria-hidden
        className="size-1 rounded-full bg-transparent group-aria-[current=page]:bg-texto"
      />
    </NavLink>
  );
}

/** Icons only, with accessible names. The green shortcut in the middle opens the camera. */
export function TabBar({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Principal"
      className={cn(
        'fixed inset-x-0 bottom-0 z-20 border-t border-linha bg-fundo pt-1.5 pb-[max(8px,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      <div className="mx-auto flex max-w-[640px] items-center justify-around px-5">
        <Tab to="/" label="Início" icon={House} />
        <Tab to="/purchases" label="Compras" icon={ReceiptText} />
        <Link
          to="/scan"
          aria-label="Enviar nota"
          className="pressable grid h-12 w-18 place-items-center rounded-full bg-marca text-sobre-marca active:bg-marca-pressionada"
        >
          <Camera aria-hidden size={26} strokeWidth={2} />
        </Link>
        <Tab to="/products" label="Produtos" icon={Package} />
      </div>
    </nav>
  );
}
