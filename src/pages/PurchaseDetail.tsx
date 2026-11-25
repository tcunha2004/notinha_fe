import { ChevronLeft, ExternalLink, Trash2 } from 'lucide-react';
import { Outlet } from 'react-router';
import { usePurchase } from '../app/loaders';
import { ItemsSection } from '../components/domain/ItemsSection';
import { PurchaseLayout, StickyFooter } from '../components/domain/PurchaseLayout';
import { ReviewBanner } from '../components/domain/ReviewBanner';
import { TotalsCard } from '../components/domain/TotalsCard';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { GlassButton } from '../components/ui/GlassButton';
import { NavBar } from '../components/ui/NavBar';
import { formatCurrency } from '../lib/format';
import { getTotals, purchaseSubtitle, storeName } from '../lib/purchase';
import { photoUrl } from '../services/purchases';

export function PurchaseDetail() {
  const purchase = usePurchase();
  const needsReview = purchase.status === 'needs_review';

  return (
    <main className="page-container animate-push">
      <NavBar
        title="Compra"
        leading={<GlassButton to="/purchases" icon={ChevronLeft} label="Voltar" />}
        trailing={<GlassButton to="delete" icon={Trash2} label="Excluir compra" />}
      />

      <PurchaseLayout
        footer={<TotalsCard purchase={purchase} />}
        aside={<ItemsSection purchase={purchase} />}
      >
        <div className="flex flex-col items-center pt-2 text-center">
          <Avatar name={storeName(purchase)} tone={needsReview ? 'orange' : 'green'} size="lg" />
          <p className="mt-4 font-rounded text-amount-large">
            {formatCurrency(purchase.total_amount)}
          </p>
          <h2 className="mt-1 max-w-full truncate text-title-2 font-semibold">
            {storeName(purchase)}
          </h2>
          <p className="mt-1 text-subheadline text-label-secondary">{purchaseSubtitle(purchase)}</p>
        </div>

        {needsReview && (
          <ReviewBanner itemsTotal={getTotals(purchase).itemsTotal} total={purchase.total_amount} />
        )}

        <Button variant="tinted" href={photoUrl(purchase.id)}>
          Ver foto da nota
          <ExternalLink aria-hidden size={16} />
          <span className="sr-only">(abre em nova aba)</span>
        </Button>
      </PurchaseLayout>

      {needsReview ? (
        <StickyFooter>
          <Button to="/scan">Ler a nota de novo</Button>
        </StickyFooter>
      ) : (
        <div className="h-[max(24px,env(safe-area-inset-bottom))]" />
      )}

      <Outlet />
    </main>
  );
}
