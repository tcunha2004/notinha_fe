import { Check, Trash2, TriangleAlert, X } from 'lucide-react';
import { Outlet } from 'react-router';
import { usePurchase } from '../app/loaders';
import { ItemsSection } from '../components/domain/ItemsSection';
import { PurchaseHero, StickyFooter } from '../components/domain/PurchaseHero';
import { TotalsCard } from '../components/domain/TotalsCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { KeyValueList } from '../components/ui/KeyValueList';
import { SectionHeader } from '../components/ui/SectionHeader';
import { TopBar } from '../components/ui/TopBar';
import { cn } from '../lib/cn';
import { getTotals } from '../lib/purchase';

const NOT_READ = 'Não lido';

/** First screen after the upload: what was read, and whether it adds up.
 *  When it adds up it's a key moment, so the green takes the top of the screen. */
export function Review() {
  const purchase = usePurchase();
  const ok = purchase.status === 'ok';
  const sumMatches = getTotals(purchase).difference === 0;
  const tone = ok ? 'marca' : 'fundo';

  return (
    <main
      className={cn(
        'flex min-h-dvh flex-col pt-[max(12px,env(safe-area-inset-top))] animate-surgir',
        ok && 'bg-marca text-sobre-marca',
      )}
    >
      <h1 className="sr-only">Nota lida</h1>
      <div className="page-container">
        <TopBar
          leading={<IconButton to="/" icon={X} label="Fechar" tone={tone} />}
          trailing={<IconButton to="delete" icon={Trash2} label="Excluir compra" tone={tone} />}
        />
        <div className="pb-7">
          <PurchaseHero
            purchase={purchase}
            onBrand={ok}
            badge={
              ok ? (
                <span className="grid size-14 place-items-center rounded-full bg-tinta text-marca animate-mola">
                  <Check aria-hidden size={30} strokeWidth={3} />
                </span>
              ) : (
                <span className="grid size-14 place-items-center rounded-full bg-atencao-50 text-atencao-700 animate-mola">
                  <TriangleAlert aria-hidden size={28} />
                </span>
              )
            }
          />
        </div>
      </div>

      <div className="page-container flex flex-1 flex-col rounded-t-xl bg-fundo pt-5 text-texto">
        {/* role=status: announced when an edit flips the check. */}
        <p role="status" className="px-5">
          {ok ? (
            <Badge tone="confirmacao">
              <Check aria-hidden size={16} strokeWidth={2.5} />A soma dos itens confere com o total
            </Badge>
          ) : (
            <Badge tone="alerta">
              <TriangleAlert aria-hidden size={16} />
              {sumMatches
                ? 'Confira os itens marcados'
                : 'A soma dos itens não confere com o total'}
            </Badge>
          )}
        </p>

        <section aria-labelledby="store-title" className="mt-4">
          <SectionHeader id="store-title" title="Loja" />
          <KeyValueList
            rows={[
              { label: 'CNPJ', value: purchase.store?.cnpj ?? NOT_READ },
              { label: 'Endereço', value: purchase.store?.address ?? NOT_READ },
              { label: 'Pagamento', value: purchase.payment_method ?? NOT_READ },
            ]}
          />
        </section>

        <div className="mt-2 flex flex-col gap-2">
          <ItemsSection purchase={purchase} />
          <TotalsCard purchase={purchase} />
        </div>

        <div className="flex-1" />
        <StickyFooter>
          <Button to="/">Concluir</Button>
        </StickyFooter>
      </div>

      <Outlet />
    </main>
  );
}
