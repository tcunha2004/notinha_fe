import { ChevronLeft, Image, RefreshCw, Trash2 } from 'lucide-react';
import { Outlet } from 'react-router';
import { usePurchase } from '../app/loaders';
import { ItemsSection } from '../components/domain/ItemsSection';
import { PurchaseHero, StickyFooter } from '../components/domain/PurchaseHero';
import { TotalsCard } from '../components/domain/TotalsCard';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { Notice } from '../components/ui/Notice';
import { TopBar } from '../components/ui/TopBar';
import { formatCurrency } from '../lib/format';
import { getTotals, storeName } from '../lib/purchase';
import type { Purchase } from '../types';
import { photoUrl } from '../services/purchases';

/** The notice's title says what; its text says what to do. */
function reviewMessage(purchase: Purchase) {
  const flagged = purchase.items.filter((item) => item.flagged).length;
  const { itemsTotal, difference } = getTotals(purchase);
  const title = flagged
    ? `Confira ${flagged} ${flagged === 1 ? 'item' : 'itens'}`
    : 'Confira o total da nota';
  const text =
    difference !== 0
      ? `Os itens somam ${formatCurrency(itemsTotal)}, mas a nota diz ${formatCurrency(purchase.total_amount)}. Compare com a foto ou toque no total para corrigir.`
      : 'Parte da nota não foi lida direito. Compare os itens marcados com a foto.';
  return { title, text };
}

export function PurchaseDetail() {
  const purchase = usePurchase();
  const needsReview = purchase.status === 'needs_review';
  const photoLink = (
    <Button
      variant={needsReview ? 'claro' : 'secundario'}
      size="medio"
      href={photoUrl(purchase.id)}
      className="self-start"
    >
      <Image aria-hidden size={18} />
      Ver foto da nota
      <span className="sr-only">(abre em nova aba)</span>
    </Button>
  );

  return (
    <main className="page-container flex min-h-dvh flex-col pt-[max(12px,env(safe-area-inset-top))] animate-tela">
      <TopBar
        leading={<IconButton to="/purchases" icon={ChevronLeft} label="Voltar" />}
        trailing={<IconButton to="delete" icon={Trash2} label="Excluir compra" />}
      />

      <div className="pt-1">
        <PurchaseHero
          purchase={purchase}
          heading="h1"
          badge={<Avatar name={storeName(purchase)} logo={purchase.store?.logo} size="lg" />}
        />
      </div>

      <div className="px-5 pt-6">
        {needsReview ? (
          <Notice titleId="review-title" title={reviewMessage(purchase).title} action={photoLink}>
            {reviewMessage(purchase).text}
          </Notice>
        ) : (
          <div className="flex justify-center">{photoLink}</div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <ItemsSection purchase={purchase} />
        <TotalsCard purchase={purchase} />
      </div>

      <div className="flex-1" />
      {needsReview ? (
        <StickyFooter>
          <Button to="/scan">
            <RefreshCw aria-hidden size={20} />
            Ler a nota de novo
          </Button>
        </StickyFooter>
      ) : (
        <div className="h-[max(24px,env(safe-area-inset-bottom))]" />
      )}

      <Outlet />
    </main>
  );
}
