import { Link, useLoaderData } from 'react-router';
import type { purchasesLoader } from '../app/loaders';
import { ProfileMenu } from '../components/domain/ProfileMenu';
import { PurchaseRow } from '../components/domain/PurchaseRow';
import { ScanCta } from '../components/domain/ScanCta';
import { SummaryCard } from '../components/domain/SummaryCard';
import { Card, CardList } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import { formatLongDay, formatMonth } from '../lib/format';
import { groupByMonth } from '../lib/purchase';

const RECENT_COUNT = 4;

export function Home() {
  const purchases = useLoaderData<typeof purchasesLoader>();
  // Summary covers the latest month with data (purchases come newest first).
  const [month] = groupByMonth(purchases);

  return (
    <main className="page-container pt-[max(16px,env(safe-area-inset-top))]">
      <header className="flex items-end justify-between gap-4 pt-2 lg:pt-6">
        <div>
          <p className="text-footnote font-semibold text-label-secondary uppercase">
            {formatLongDay(new Date())}
          </p>
          <h1 className="text-large-title">Início</h1>
        </div>
        <ProfileMenu />
      </header>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {month && (
          <SummaryCard
            month={formatMonth(month.date)}
            total={month.total}
            count={month.count}
            average={month.average}
          />
        )}
        <ScanCta />
      </div>

      <section aria-labelledby="recent-title" className="mt-7">
        <SectionHeader
          id="recent-title"
          variant="title"
          title="Compras recentes"
          trailing={
            <Link to="/purchases" className="text-body text-brand-green hover:underline">
              Ver todas
            </Link>
          }
        />
        <Card>
          <CardList>
            {purchases.slice(0, RECENT_COUNT).map((purchase) => (
              <PurchaseRow key={purchase.id} purchase={purchase} />
            ))}
          </CardList>
        </Card>
      </section>
    </main>
  );
}
