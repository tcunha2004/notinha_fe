import { Check, TriangleAlert, X } from 'lucide-react';
import { Outlet } from 'react-router';
import { usePurchase } from '../app/loaders';
import { ItemRow } from '../components/domain/ItemRow';
import { PurchaseLayout, StickyFooter } from '../components/domain/PurchaseLayout';
import { TotalsCard } from '../components/domain/TotalsCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardList, InfoList } from '../components/ui/Card';
import { GlassButton } from '../components/ui/GlassButton';
import { NavBar } from '../components/ui/NavBar';
import { SectionHeader } from '../components/ui/SectionHeader';
import { formatCurrency, formatPurchaseDate } from '../lib/format';
import { getTotals } from '../lib/purchase';

export function Review() {
  const purchase = usePurchase();
  const sumMatches = getTotals(purchase).difference === 0;

  return (
    <main className="page-container animate-push">
      <NavBar title="Nota lida" leading={<GlassButton to="/" icon={X} label="Fechar" />} />

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
          <span className="grid size-17 place-items-center rounded-full bg-brand-gradient text-label-on-accent shadow-brand">
            <Check aria-hidden size={34} strokeWidth={3} />
          </span>
          <p className="mt-5 font-rounded text-amount-large">
            {formatCurrency(purchase.total_amount)}
          </p>
          <h2 className="mt-1 max-w-full truncate text-title-2 font-semibold">
            {purchase.store.name}
          </h2>
          <p className="mt-1 text-subheadline text-label-secondary">
            {formatPurchaseDate(purchase.purchased_at, { withTime: true })} ·{' '}
            {purchase.payment_method}
          </p>
          {sumMatches ? (
            <Badge tone="success" className="mt-4">
              <Check aria-hidden size={14} strokeWidth={3} />A soma dos itens confere com o total
            </Badge>
          ) : (
            <Badge tone="warning" className="mt-4 px-3.5 py-1.5 text-footnote">
              <TriangleAlert aria-hidden size={14} />A soma dos itens não confere com o total
            </Badge>
          )}
        </div>

        <section aria-labelledby="store-title">
          <SectionHeader id="store-title" title="Loja" />
          <InfoList
            rows={[
              { label: 'CNPJ', value: purchase.store.cnpj },
              { label: 'Endereço', value: purchase.store.address },
              { label: 'Pagamento', value: purchase.payment_method },
            ]}
          />
        </section>
      </PurchaseLayout>

      <StickyFooter>
        <Button to="/">Concluir</Button>
      </StickyFooter>

      <Outlet />
    </main>
  );
}
