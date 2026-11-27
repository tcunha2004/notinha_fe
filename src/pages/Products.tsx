import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Outlet, useLoaderData } from 'react-router';
import type { purchasesLoader } from '../app/loaders';
import { HeaderActions } from '../components/domain/HeaderActions';
import { Price } from '../components/domain/Price';
import { PriceTrend } from '../components/domain/PriceTrend';
import { Button } from '../components/ui/Button';
import {
  brandName,
  foldText,
  groupProducts,
  productSize,
  trendSentence,
  variantSize,
  type ProductGroup,
} from '../lib/purchase';

export function Products() {
  const purchases = useLoaderData<typeof purchasesLoader>();
  // One card per generic product: "Café torrado" holds Pilão, unbranded and any other brand.
  const groups = useMemo(() => groupProducts(purchases), [purchases]);
  const [query, setQuery] = useState('');

  const folded = foldText(query.trim());
  const shown = folded
    ? groups.filter(({ name, variants }) =>
        foldText([name, ...variants.map((v) => v.product.brand ?? '')].join(' ')).includes(folded),
      )
    : groups;

  return (
    <main className="page-container pt-[max(12px,env(safe-area-inset-top))] animate-surgir">
      <header className="flex h-11 items-center justify-end px-5">
        <HeaderActions />
      </header>
      <div className="flex flex-col gap-4 px-5 pt-7">
        <div className="flex flex-col gap-1">
          <h1 className="texto-titulo-1">Produtos</h1>
          {groups.length > 0 && (
            <p className="texto-legenda text-texto-secundario tabular-nums">
              {groups.length} {groups.length === 1 ? 'produto' : 'produtos'} · mais comprados
              primeiro
            </p>
          )}
        </div>

        {groups.length > 0 && (
          <label className="flex h-12 items-center gap-2.5 rounded-full bg-superficie px-4 text-texto-secundario has-focus-visible:shadow-[inset_0_0_0_2px_var(--color-texto)]">
            <Search aria-hidden size={20} strokeWidth={2} />
            <span className="sr-only">Buscar produto</span>
            <input
              type="search"
              placeholder="Buscar produto ou marca"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent texto-corpo text-texto outline-none placeholder:text-texto-secundario [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={() => setQuery('')}
                className="pressable -mr-1.5 grid size-8 place-items-center rounded-full hover:text-texto"
              >
                <X aria-hidden size={18} />
              </button>
            )}
          </label>
        )}
      </div>

      {groups.length === 0 ? (
        // Empty state: short title + one sentence + one action.
        <section className="flex flex-col items-start gap-2 px-5 pt-12">
          <h2 className="texto-titulo-2">Nenhum produto ainda</h2>
          <p className="texto-corpo text-texto-secundario">
            Os produtos aparecem aqui conforme você envia notas, com o histórico de preços de cada
            um.
          </p>
          <Button to="/scan" size="medio" className="mt-4">
            Enviar nota
          </Button>
        </section>
      ) : shown.length === 0 ? (
        <p role="status" className="px-5 pt-8 texto-corpo text-texto-secundario">
          Nenhum produto com “{query.trim()}”.
        </p>
      ) : (
        <ul aria-label="Produtos" className="mt-5 grid grid-cols-2 gap-3 px-5 sm:grid-cols-3">
          {shown.map((group) => (
            <ProductCard key={group.key} group={group} />
          ))}
        </ul>
      )}

      {/* The detail sheet (products/:productKey) opens over the grid. */}
      <Outlet />
    </main>
  );
}

/** A shelf price tag: name and size on white, the last price on a green band below a tear line. */
function ProductCard({ group }: { group: ProductGroup }) {
  const { name, variants, latest } = group;
  const [only] = variants;
  // Several variants: show their size only when they all share it (the name leaves size out, so they may not).
  const sizes = new Set(variants.map(variantSize));
  const size =
    variants.length === 1 && only ? productSize(only) : sizes.size === 1 ? [...sizes][0] : '';
  const latestBrand = latest.item.product ? brandName(latest.item.product) : '';
  return (
    <li>
      <Link
        to={encodeURIComponent(group.key)}
        preventScrollReset
        className="flex h-full flex-col overflow-hidden rounded-lg border border-linha bg-superficie-elevada transition-[translate,scale,box-shadow,border-color] duration-200 ease-padrao hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_12px_28px_-16px_rgb(11_11_12/0.4)] active:translate-y-0 active:scale-[0.97]"
      >
        <span className="flex-1 px-4 pt-3.5 pb-3">
          {/* Floated, so a long name wraps under it instead of losing a column to it. */}
          {/* Decorative here: floated first, it would be read before the name. The band reads it. */}
          <PriceTrend
            item={latest.item}
            perUnit={false}
            decorative
            className="float-right mt-[3px] ml-2"
          />
          <span className="texto-corpo-forte">{name}</span>
          {size && (
            <span className="mt-1 block truncate texto-legenda text-texto-secundario">{size}</span>
          )}
        </span>
        <span
          className="border-t border-dashed border-sobre-etiqueta/25 bg-etiqueta px-4 pt-2.5 pb-3 text-sobre-etiqueta"
          title={variants.length > 1 ? `Último preço: ${latestBrand}` : undefined}
        >
          <span className="sr-only">
            Último preço{variants.length > 1 && ` (${latestBrand})`}:{' '}
          </span>
          <Price value={latest.item.unit_price} unit={latest.item.unit} />
          {trendSentence(latest.item) && (
            <span className="sr-only">, {trendSentence(latest.item)}</span>
          )}
        </span>
      </Link>
    </li>
  );
}
