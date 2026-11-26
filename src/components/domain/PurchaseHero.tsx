import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { purchaseSubtitle, storeName } from '../../lib/purchase';
import type { Purchase } from '../../types';
import { Amount } from '../ui/Amount';

/** Centered top of a purchase: badge (check or avatar), big amount, store, date · payment. */
export function PurchaseHero({
  purchase,
  badge,
  onBrand = false,
  heading = 'h2',
}: {
  purchase: Purchase;
  badge: ReactNode;
  /** On the green "Nota lida" canvas. */
  onBrand?: boolean;
  /** Render the store name as the screen's h1 (the detail page has no other title). */
  heading?: 'h1' | 'h2';
}) {
  const Heading = heading;
  return (
    <div className="flex flex-col items-center gap-2 px-5 text-center">
      {badge}
      <Amount value={purchase.total_amount} size="grande" />
      <Heading className="max-w-full truncate texto-titulo-3">{storeName(purchase)}</Heading>
      <p
        className={cn(
          '-mt-1.5 texto-legenda',
          onBrand ? 'text-sobre-marca-secundario' : 'text-texto-secundario',
        )}
      >
        {purchaseSubtitle(purchase)}
      </p>
    </div>
  );
}

/** Bottom action bar that stays visible while the page scrolls. */
export function StickyFooter({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 mt-6 border-t border-linha bg-fundo px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
      {children}
    </div>
  );
}
