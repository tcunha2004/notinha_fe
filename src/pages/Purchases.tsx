import { Search } from 'lucide-react';
import { useLoaderData } from 'react-router';
import type { purchasesLoader } from '../app/loaders';
import { PurchaseRow } from '../components/domain/PurchaseRow';
import { SectionHeader } from '../components/ui/SectionHeader';
import { formatCurrency, formatMonthYear } from '../lib/format';
import { groupByMonth } from '../lib/purchase';

export function Purchases() {
  const groups = groupByMonth(useLoaderData<typeof purchasesLoader>());

  return (
    <main className="page-container pt-[max(12px,env(safe-area-inset-top))] animate-surgir">
      <div className="flex flex-col gap-4 px-5 pt-4">
        <h1 className="texto-titulo-1">Compras</h1>

        {/* Visual only for now: filtering arrives with the API. */}
        <label className="flex h-12 items-center gap-2.5 rounded-full bg-superficie px-4 text-texto-secundario has-focus-visible:shadow-[inset_0_0_0_2px_var(--color-texto)]">
          <Search aria-hidden size={20} strokeWidth={2} />
          <span className="sr-only">Buscar</span>
          <input
            type="search"
            placeholder="Buscar loja ou item"
            className="min-w-0 flex-1 bg-transparent texto-corpo text-texto outline-none placeholder:text-texto-secundario"
          />
        </label>
      </div>

      {groups.map((group, index) => (
        <section
          key={group.key}
          aria-labelledby={`month-${group.key}`}
          className={index === 0 ? 'mt-5' : 'mt-2'}
        >
          <SectionHeader
            id={`month-${group.key}`}
            title={formatMonthYear(group.date)}
            trailing={formatCurrency(group.total)}
          />
          <ul>
            {group.purchases.map((purchase) => (
              <PurchaseRow key={purchase.id} purchase={purchase} />
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
