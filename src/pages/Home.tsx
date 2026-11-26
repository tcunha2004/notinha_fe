import { Link, useLoaderData } from 'react-router';
import type { purchasesLoader } from '../app/loaders';
import { Logo } from '../components/domain/Logo';
import { ProfileMenu } from '../components/domain/ProfileMenu';
import { PurchaseRow } from '../components/domain/PurchaseRow';
import { ThemeToggle } from '../components/domain/ThemeToggle';
import { Amount } from '../components/ui/Amount';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/SectionHeader';
import { formatCurrency, formatMonth } from '../lib/format';
import { groupByMonth } from '../lib/purchase';

const RECENT_COUNT = 4;

export function Home() {
  const purchases = useLoaderData<typeof purchasesLoader>();
  // Summary covers the latest month with data (purchases come newest first).
  const [month] = groupByMonth(purchases);

  return (
    <main className="page-container pt-[max(12px,env(safe-area-inset-top))] animate-surgir">
      <h1 className="sr-only">Início</h1>
      <header className="flex h-11 items-center justify-between px-5">
        <Logo className="text-[24px] lg:invisible" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </header>

      {month ? (
        <>
          <section aria-labelledby="summary-title" className="flex flex-col gap-2 px-5 pt-7">
            <h2
              id="summary-title"
              className="text-[15px] leading-5 font-semibold text-texto-secundario"
            >
              Gasto em {formatMonth(month.date)}
            </h2>
            <Amount value={month.total} size="hero" />
            <p className="texto-legenda text-texto-secundario tabular-nums">
              {month.count} {month.count === 1 ? 'compra' : 'compras'} · média de{' '}
              {formatCurrency(month.average)}
            </p>
          </section>

          <section aria-labelledby="recent-title" className="mt-9">
            <SectionHeader
              id="recent-title"
              title="Compras recentes"
              trailing={
                <Link
                  to="/purchases"
                  className="flex min-h-11 items-center texto-corpo-forte text-marca-texto hover:underline"
                >
                  Ver todas
                </Link>
              }
            />
            <ul className="pt-1">
              {purchases.slice(0, RECENT_COUNT).map((purchase) => (
                <PurchaseRow key={purchase.id} purchase={purchase} />
              ))}
            </ul>
          </section>
        </>
      ) : (
        // Empty state: short title + one sentence + one action.
        <section className="flex flex-col items-start gap-2 px-5 pt-16">
          <h2 className="texto-titulo-2">Nenhuma nota ainda</h2>
          <p className="texto-corpo text-texto-secundario">
            Fotografe a primeira nota do mercado ou farmácia e a gente organiza suas compras.
          </p>
          <Button to="/scan" size="medio" className="mt-4">
            Enviar nota
          </Button>
        </section>
      )}
    </main>
  );
}
