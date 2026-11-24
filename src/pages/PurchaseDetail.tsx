import { ChevronLeft } from 'lucide-react';
import { Outlet } from 'react-router';
import { usePurchase } from '../app/loaders';
import { ItemRow } from '../components/domain/ItemRow';
import { PurchaseLayout, StickyFooter } from '../components/domain/PurchaseLayout';
import { ReviewBanner } from '../components/domain/ReviewBanner';
import { TotalsCard } from '../components/domain/TotalsCard';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Card, CardList } from '../components/ui/Card';
import { GlassButton } from '../components/ui/GlassButton';
import { NavBar } from '../components/ui/NavBar';
import { SectionHeader } from '../components/ui/SectionHeader';
import { formatCurrency, formatPurchaseDate } from '../lib/format';
import { getTotals } from '../lib/purchase';

export function PurchaseDetail() {
  const purchase = usePurchase();
  const needsReview = purchase.status === 'needs_review';

  return (
    <main className="page-container animate-push">
      <NavBar
        title="Compra"
        leading={<GlassButton to="/purchases" icon={ChevronLeft} label="Voltar" />}
      />

      <PurchaseLayout
        footer={<TotalsCard purchase={purchase} />}
        aside={
          <section aria-labelledby="items-title">
            <SectionHeader
              id="items-title"
              title={`${purchase.items.length} itens`}
              trailing={<span>Toque para corrigir</span>}
            />
            <Card>
              <CardList>
                {purchase.items.map((item) => (
                  <ItemRow key={item.id} item={item} to={`items/${item.id}`} />
                ))}
              </CardList>
            </Card>
          </section>
        }
      >
        <div className="flex flex-col items-center pt-2 text-center">
          <Avatar name={purchase.store.name} tone={needsReview ? 'orange' : 'green'} size="lg" />
          <p className="mt-4 font-rounded text-amount-large">
            {formatCurrency(purchase.total_amount)}
          </p>
          <h2 className="mt-1 max-w-full truncate text-title-2 font-semibold">
            {purchase.store.name}
          </h2>
          <p className="mt-1 text-subheadline text-label-secondary">
            {formatPurchaseDate(purchase.purchased_at, { withTime: true })} ·{' '}
            {purchase.payment_method}
          </p>
        </div>

        {needsReview && (
          <ReviewBanner itemsTotal={getTotals(purchase).itemsTotal} total={purchase.total_amount} />
        )}

        {/* No action yet: photos arrive with the API. */}
        <Button variant="tinted">Ver foto da nota</Button>
      </PurchaseLayout>

      {needsReview ? (
        <StickyFooter>
          <Button to="/scan/processing">Ler a nota de novo</Button>
        </StickyFooter>
      ) : (
        <div className="h-[max(24px,env(safe-area-inset-bottom))]" />
      )}

      <Outlet />
    </main>
  );
}
