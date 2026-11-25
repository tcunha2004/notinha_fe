import { Check, Trash2, TriangleAlert, X } from 'lucide-react';
import { Outlet } from 'react-router';
import { usePurchase } from '../app/loaders';
import { ItemsSection } from '../components/domain/ItemsSection';
import { PurchaseLayout, StickyFooter } from '../components/domain/PurchaseLayout';
import { TotalsCard } from '../components/domain/TotalsCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { InfoList } from '../components/ui/Card';
import { GlassButton } from '../components/ui/GlassButton';
import { NavBar } from '../components/ui/NavBar';
import { SectionHeader } from '../components/ui/SectionHeader';
import { formatCurrency } from '../lib/format';
import { getTotals, purchaseSubtitle, storeName } from '../lib/purchase';

const NOT_READ = 'Não lido';

/** First screen after the upload: what was read, and whether it adds up. */
export function Review() {
  const purchase = usePurchase();
  const ok = purchase.status === 'ok';
  const sumMatches = getTotals(purchase).difference === 0;

  return (
    <main className="page-container animate-push">
      <NavBar
        title="Nota lida"
        leading={<GlassButton to="/" icon={X} label="Fechar" />}
        trailing={<GlassButton to="delete" icon={Trash2} label="Excluir compra" />}
      />

      <PurchaseLayout
        footer={<TotalsCard purchase={purchase} />}
        aside={<ItemsSection purchase={purchase} />}
      >
        <div className="flex flex-col items-center pt-2 text-center">
          {ok ? (
            <span className="grid size-17 place-items-center rounded-full bg-brand-gradient text-label-on-accent shadow-brand animate-dialog-in">
              <Check aria-hidden size={34} strokeWidth={3} />
            </span>
          ) : (
            <span className="grid size-17 place-items-center rounded-full bg-accent-orange-soft text-accent-orange animate-dialog-in">
              <TriangleAlert aria-hidden size={32} />
            </span>
          )}
          <p className="mt-5 font-rounded text-amount-large">
            {formatCurrency(purchase.total_amount)}
          </p>
          <h2 className="mt-1 max-w-full truncate text-title-2 font-semibold">
            {storeName(purchase)}
          </h2>
          <p className="mt-1 text-subheadline text-label-secondary">{purchaseSubtitle(purchase)}</p>
          {/* role=status: announced when an edit flips the check. */}
          <p role="status" className="mt-4">
            {ok ? (
              <Badge tone="success">
                <Check aria-hidden size={14} strokeWidth={3} />A soma dos itens confere com o total
              </Badge>
            ) : (
              <Badge tone="warning" className="px-3.5 py-1.5 text-footnote">
                <TriangleAlert aria-hidden size={14} />
                {sumMatches
                  ? 'Confira os itens marcados'
                  : 'A soma dos itens não confere com o total'}
              </Badge>
            )}
          </p>
        </div>

        <section aria-labelledby="store-title">
          <SectionHeader id="store-title" title="Loja" />
          <InfoList
            rows={[
              { label: 'CNPJ', value: purchase.store?.cnpj ?? NOT_READ },
              { label: 'Endereço', value: purchase.store?.address ?? NOT_READ },
              { label: 'Pagamento', value: purchase.payment_method ?? NOT_READ },
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
