import { Tag } from 'lucide-react';
import { useId, useMemo } from 'react';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router';
import type { purchasesLoader } from '../app/loaders';
import { Price } from '../components/domain/Price';
import { PriceTrend } from '../components/domain/PriceTrend';
import { Badge } from '../components/ui/Badge';
import { KeyValueList } from '../components/ui/KeyValueList';
import { ListRow } from '../components/ui/ListRow';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Sheet, SheetHeader } from '../components/ui/Sheet';
import { cn } from '../lib/cn';
import { formatCurrency, formatPurchaseDate, formatQuantity, formatUnit } from '../lib/format';
import {
  brandName,
  cheapestVariant,
  getInitials,
  groupProducts,
  productSize,
  storeName,
  variantSize,
  type ProductEntry,
  type ProductGroup,
  type ProductHistory,
} from '../lib/purchase';

/** `products/:productKey`: a generic product's price tag, its brands side by side and each brand's history. */
export function ProductSheet() {
  const purchases = useRouteLoaderData<typeof purchasesLoader>('products');
  const { productKey } = useParams();
  const navigate = useNavigate();
  const onClose = () => navigate('..', { replace: true, preventScrollReset: true });
  const headerId = useId();
  const nameId = useId();

  const group = useMemo(
    () => groupProducts(purchases ?? []).find((g) => g.key === productKey),
    [purchases, productKey],
  );

  return (
    <Sheet labelledBy={group ? nameId : headerId} onClose={onClose}>
      <div className="pt-2 pb-[max(34px,env(safe-area-inset-bottom))] lg:pt-5">
        <SheetHeader titleId={headerId} title="Produto" onClose={onClose} />
        {group ? (
          <ProductDetail group={group} nameId={nameId} />
        ) : (
          <p className="px-5 pt-6 texto-corpo text-texto-secundario">
            Esse produto não aparece nas suas compras.
          </p>
        )}
      </div>
    </Sheet>
  );
}

/** "R$ 8,33/un" */
const unitPrice = ({ item }: ProductEntry) =>
  `${formatCurrency(item.unit_price)}/${formatUnit(item.unit)}`;

const variantId = (variant: ProductHistory) => `variante-${variant.product.id}`;

const pricesVary = ({ lowest, highest }: ProductHistory) =>
  lowest.item.unit_price !== highest.item.unit_price;

const countPurchases = ({ entries }: ProductHistory) =>
  new Set(entries.map((e) => e.purchase.id)).size;

function ProductDetail({ group, nameId }: { group: ProductGroup; nameId: string }) {
  const { name, variants, latest, purchaseCount, spent } = group;
  const [only] = variants as [ProductHistory];
  const many = variants.length > 1;
  const size = productSize(only);

  return (
    <>
      {/* The card's price tag, grown up. */}
      <div className="mx-5 mt-3 overflow-hidden rounded-lg border border-linha">
        <div className="flex flex-col gap-1.5 px-5 pt-4 pb-4">
          <h3 id={nameId} className="texto-titulo-2">
            {name}
          </h3>
          {many ? (
            <p className="texto-legenda text-texto-secundario tabular-nums">
              {purchaseCount} {purchaseCount === 1 ? 'compra' : 'compras'} · {formatCurrency(spent)}{' '}
              no total
            </p>
          ) : (
            size && <p className="texto-legenda text-texto-secundario">{size}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 border-t border-dashed border-sobre-etiqueta/25 bg-etiqueta px-5 pt-3.5 pb-4 text-sobre-etiqueta">
          <span className="texto-rotulo">
            Último preço
            {many && latest.item.product && ` · ${brandName(latest.item.product)}`} ·{' '}
            {formatPurchaseDate(latest.purchase.purchased_at)} · {storeName(latest.purchase)}
          </span>
          <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
            <Price value={latest.item.unit_price} unit={latest.item.unit} size="destaque" />
            <PriceTrend
              item={latest.item}
              size="md"
              suffix="vs. compra anterior"
              className="mb-1.5"
            />
          </div>
        </div>
      </div>

      {many ? (
        <>
          <BrandComparison group={group} />
          <section aria-labelledby="product-history" className="mt-5">
            <SectionHeader id="product-history" title="Histórico por marca" />
            {variants.map((variant) => (
              <VariantHistory key={variant.product.id} variant={variant} />
            ))}
          </section>
        </>
      ) : (
        <>
          <section aria-labelledby="product-summary" className="mt-5">
            <SectionHeader id="product-summary" title="Resumo" />
            <KeyValueList
              rows={[
                ...(pricesVary(only)
                  ? [
                      { label: 'Menor preço', value: <PriceAt entry={only.lowest} /> },
                      { label: 'Maior preço', value: <PriceAt entry={only.highest} /> },
                    ]
                  : []),
                { label: 'Compras', value: purchaseCount },
                { label: 'Total gasto', value: formatCurrency(spent) },
              ]}
            />
          </section>
          <section aria-labelledby="product-history" className="mt-3">
            <SectionHeader id="product-history" title="Histórico" />
            <HistoryRows variant={only} />
          </section>
        </>
      )}
    </>
  );
}

/** The brands side by side by their latest price; tapping one jumps to its history below. */
function BrandComparison({ group }: { group: ProductGroup }) {
  const cheapest = cheapestVariant(group);
  const jumpTo = (variant: ProductHistory) => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    document
      .getElementById(variantId(variant))
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  return (
    <section aria-labelledby="product-brands" className="mt-5">
      <SectionHeader id="product-brands" title="Compare as marcas" trailing="Último preço" />
      <ul>
        {group.variants.map((variant) => {
          const count = countPurchases(variant);
          return (
            <li key={variant.product.id}>
              <button
                type="button"
                onClick={() => jumpTo(variant)}
                className="flex min-h-18 w-full items-center gap-3.5 px-5 py-3 text-left transition-colors hover:bg-superficie focus-visible:-outline-offset-2 active:bg-superficie"
              >
                <BrandMark brand={variant.product.brand} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate texto-corpo-forte">{brandName(variant.product)}</span>
                  <span className="truncate texto-legenda text-texto-secundario tabular-nums">
                    {[variantSize(variant), `${count} ${count === 1 ? 'compra' : 'compras'}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <span className="texto-corpo-forte whitespace-nowrap tabular-nums">
                    {unitPrice(variant.latest)}
                  </span>
                  {variant === cheapest && <Badge tone="novo">Mais barata</Badge>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** One brand's purchases under a header that stays on top while its rows scroll by. */
function VariantHistory({ variant }: { variant: ProductHistory }) {
  const headingId = useId();
  const size = variantSize(variant);
  return (
    <section id={variantId(variant)} aria-labelledby={headingId} className="scroll-mt-2">
      <div className="sticky top-0 z-10 flex min-h-13 items-center gap-3 border-b border-linha bg-superficie-elevada px-5 py-2">
        <BrandMark brand={variant.product.brand} small />
        <h4 id={headingId} className="min-w-0 truncate texto-corpo-forte">
          {brandName(variant.product)}
          {size && ' '}
          {size && <span className="font-normal text-texto-secundario">· {size}</span>}
        </h4>
        {pricesVary(variant) && (
          <span className="ml-auto shrink-0 texto-legenda text-texto-secundario tabular-nums">
            menor {unitPrice(variant.lowest)}
          </span>
        )}
      </div>
      {/* The header already says the lowest price: no per-row badge squeezing the store names. */}
      <HistoryRows variant={variant} markLowest={false} />
    </section>
  );
}

/** Every purchase of one product (one brand and size), newest first. The oldest has no trend: it's the base. */
function HistoryRows({
  variant,
  markLowest = true,
}: {
  variant: ProductHistory;
  markLowest?: boolean;
}) {
  const varies = markLowest && pricesVary(variant);
  return (
    <ul>
      {variant.entries.map((entry) => (
        <ListRow
          key={entry.item.id}
          to={`/purchases/${entry.purchase.id}`}
          title={
            <span className="flex items-center gap-2">
              <span className="truncate">{storeName(entry.purchase)}</span>
              {varies && entry === variant.lowest && <Badge tone="novo">Menor preço</Badge>}
            </span>
          }
          subtitle={`${formatPurchaseDate(entry.purchase.purchased_at)} · ${formatQuantity(entry.item.quantity, entry.item.unit)} ${formatUnit(entry.item.unit)} · ${formatCurrency(entry.item.total_amount)}`}
          // The history is about price: the unit price leads, its change vs the purchase before sits under it.
          trailing={
            <span className="flex flex-col items-end gap-0.5">
              <span className="texto-corpo-forte whitespace-nowrap tabular-nums">
                {unitPrice(entry)}
              </span>
              <PriceTrend item={entry.item} />
            </span>
          }
        />
      ))}
    </ul>
  );
}

/** The brand's initials in a circle; a tag icon for unbranded items ("SM" would read as a brand). */
function BrandMark({ brand, small = false }: { brand: string | null; small?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-superficie font-bold tracking-[-0.01em] [font-stretch:112%]',
        small ? 'size-8 text-[12px]' : 'size-11 text-[15px]',
      )}
    >
      {brand ? (
        getInitials(brand)
      ) : (
        <Tag size={small ? 15 : 19} strokeWidth={2.25} className="text-texto-secundario" />
      )}
    </span>
  );
}

/** "R$ 8,33/un · Mercado Bom Dia" */
function PriceAt({ entry }: { entry: ProductEntry }) {
  return (
    <>
      <span className="font-semibold">{unitPrice(entry)}</span>
      <span className="text-texto-secundario"> · {storeName(entry.purchase)}</span>
    </>
  );
}
