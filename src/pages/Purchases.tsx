import { Search } from 'lucide-react';
import { useLoaderData } from 'react-router';
import type { purchasesLoader } from '../app/loaders';
import { PurchaseRow } from '../components/domain/PurchaseRow';
import { Card, CardList } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import { formatCurrency, formatMonthYear } from '../lib/format';
import { groupByMonth } from '../lib/purchase';

export function Purchases() {
  const groups = groupByMonth(useLoaderData<typeof purchasesLoader>());

  return (
    <main className="page-container pt-[max(16px,env(safe-area-inset-top))]">
      <h1 className="pt-11 text-large-title lg:pt-6">Compras</h1>

      {/* Visual only for now: filtering arrives with the API. */}
      <label className="mt-3 flex h-11 items-center gap-2 rounded-full bg-fill-secondary px-4 text-label-secondary has-focus-visible:outline-2 has-focus-visible:outline-accent-blue">
        <Search aria-hidden size={18} strokeWidth={2.25} />
        <span className="sr-only">Buscar</span>
        <input
          type="search"
          placeholder="Buscar loja ou item"
          className="min-w-0 flex-1 bg-transparent text-body text-label-primary outline-none placeholder:text-label-secondary"
        />
      </label>

      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`month-${group.key}`} className="mt-6">
          <SectionHeader
            id={`month-${group.key}`}
            title={formatMonthYear(group.date)}
            trailing={<span>{formatCurrency(group.total)}</span>}
          />
          <Card>
            <CardList>
              {group.purchases.map((purchase) => (
                <PurchaseRow key={purchase.id} purchase={purchase} />
              ))}
            </CardList>
          </Card>
        </section>
      ))}
    </main>
  );
}
