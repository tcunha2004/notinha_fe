import type { Product, Purchase, PurchaseItem } from '../types';
import { formatCurrency, formatPackage, formatPurchaseDate, formatUnit } from './format';

/** Sums money in integer cents to dodge floating-point drift. */
export function sumAmounts(values: number[]) {
  return values.reduce((sum, value) => sum + Math.round(value * 100), 0) / 100;
}

export function getTotals(purchase: Purchase) {
  const itemsTotal = sumAmounts(purchase.items.map((item) => item.total_amount));
  const discounts = sumAmounts(purchase.items.map((item) => item.discount));
  return {
    itemsTotal,
    discounts,
    subtotal: sumAmounts([itemsTotal, discounts]),
    difference: sumAmounts([purchase.total_amount, -itemsTotal]),
  };
}

export interface MonthGroup {
  key: string;
  date: Date;
  total: number;
  count: number;
  average: number;
  purchases: Purchase[];
}

/** Groups purchases (already sorted newest first) by calendar month. */
export function groupByMonth(purchases: Purchase[]): MonthGroup[] {
  const groups = new Map<string, Purchase[]>();
  for (const purchase of purchases) {
    const key = purchase.purchased_at.slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), purchase]);
  }
  return [...groups].map(([key, list]) => {
    const total = sumAmounts(list.map((p) => p.total_amount));
    return {
      key,
      date: new Date(`${key}-01T00:00:00`),
      total,
      count: list.length,
      average: Math.round((total / list.length) * 100) / 100,
      purchases: list,
    };
  });
}

/** "Mercado Bom Dia" → "MB" */
export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/** "Pilão · 500 g": what tells apart products with the same name. Empty when neither is known. */
export const productDetail = (product: Omit<Product, 'id'>) =>
  [
    product.brand,
    product.package_size && product.package_unit
      ? formatPackage(product.package_size, product.package_unit)
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

/** Lowercase, no accents, same length as the input: "Pão" → "pao", so search can map matches back. */
export const foldText = (text: string) =>
  Array.from(text, (char) => char.normalize('NFD').charAt(0))
    .join('')
    .toLowerCase();

/** The item's name: the product's, else what the receipt says. */
export const itemLabel = (item: PurchaseItem) => item.product?.name ?? item.raw_description ?? '';

/** "PAO FRANCES KG" → "Pao frances kg": receipts shout; lists shouldn't. */
export function sentenceCase(text: string) {
  if (text !== text.toUpperCase()) return text; // already has lowercase: the user typed it
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** List title: the product's name, else the receipt's text made readable.
 *  The original text stays visible in the edit sheet. */
export const itemTitle = (item: PurchaseItem) => sentenceCase(itemLabel(item));

/** The CNPJ may be unreadable, and then there's no store at all. */
export const storeName = (purchase: Purchase) => purchase.store?.name ?? 'Loja não identificada';

/** "Hoje, 18:42 · CRÉDITO" (payment left out when it wasn't read). */
export const purchaseSubtitle = (purchase: Purchase) =>
  [formatPurchaseDate(purchase.purchased_at, { withTime: true }), purchase.payment_method]
    .filter(Boolean)
    .join(' · ');

/** One line of a receipt, with the purchase it came from. */
export interface ProductEntry {
  item: PurchaseItem;
  purchase: Purchase;
}

export interface ProductHistory {
  product: Product;
  /** Newest first, one per receipt line. */
  entries: ProductEntry[];
  latest: ProductEntry;
  /** Distinct purchases it showed up in. */
  purchaseCount: number;
  spent: number;
  /** Cheapest and priciest unit price among lines sold in the latest one's unit (kg vs un don't compare). */
  lowest: ProductEntry;
  highest: ProductEntry;
}

/** The user's purchases (newest first) regrouped by linked product, most bought first.
 *  Unidentified items (no product) are left out: nothing ties them together. */
export function groupByProduct(purchases: Purchase[]): ProductHistory[] {
  const groups = new Map<string, ProductEntry[]>();
  for (const purchase of purchases) {
    for (const item of purchase.items) {
      if (!item.product) continue;
      groups.set(item.product.id, [...(groups.get(item.product.id) ?? []), { item, purchase }]);
    }
  }
  return [...groups.values()]
    .map((entries) => {
      const [latest] = entries as [ProductEntry];
      const comparable = entries.filter((e) => e.item.unit === latest.item.unit);
      const price = (e: ProductEntry) => e.item.unit_price;
      return {
        product: latest.item.product as Product,
        entries,
        latest,
        purchaseCount: new Set(entries.map((e) => e.purchase.id)).size,
        spent: sumAmounts(entries.map((e) => e.item.total_amount)),
        lowest: comparable.reduce((min, e) => (price(e) < price(min) ? e : min)),
        highest: comparable.reduce((max, e) => (price(e) > price(max) ? e : max)),
      };
    })
    .sort(
      (a, b) => b.purchaseCount - a.purchaseCount || a.product.name.localeCompare(b.product.name),
    );
}

/** "Pilão · 500 g", else how it's sold ("Vendido por kg"); empty when nothing is known. */
export function productSize({ product, latest }: ProductHistory) {
  const detail = productDetail(product);
  if (detail) return detail;
  return latest.item.unit === 'UN' ? '' : `Vendido por ${formatUnit(latest.item.unit)}`;
}

/** Unit price now minus in the previous purchase, in reais (2 = paying R$ 2,00 more per unit).
 *  null on the product's first purchase: there's nothing to compare with. */
export const priceChange = (item: PurchaseItem) =>
  item.previous_unit_price === null
    ? null
    : sumAmounts([item.unit_price, -item.previous_unit_price]);

/** "Pilão", or "Sem marca" for unbranded items. */
export const brandName = (product: Product) => product.brand ?? 'Sem marca';

/** "500 g", or how it's sold ("por kg"); empty for plain units with no package. */
export function variantSize({ product, latest }: ProductHistory) {
  if (product.package_size && product.package_unit)
    return formatPackage(product.package_size, product.package_unit);
  return latest.item.unit === 'UN' ? '' : `por ${formatUnit(latest.item.unit)}`;
}

/** One generic product ("Café torrado") and its variants: one per brand and size, each a product of its own. */
export interface ProductGroup {
  /** The folded name, also its URL: "cafe torrado". */
  key: string;
  name: string;
  /** Most bought first. Prices only compare within a variant. */
  variants: ProductHistory[];
  /** The newest line across every variant. */
  latest: ProductEntry;
  purchaseCount: number;
  spent: number;
}

/** The Produtos screen: products regrouped under their generic name, most bought first.
 *  "CAFE TORRADO PILAO 500G" and "CAFE TORRADO 500G" are two products (Pilão and unbranded) but one card. */
export function groupProducts(purchases: Purchase[]): ProductGroup[] {
  const groups = new Map<string, ProductHistory[]>();
  for (const history of groupByProduct(purchases)) {
    const key = foldText(history.product.name.trim());
    groups.set(key, [...(groups.get(key) ?? []), history]);
  }
  return [...groups]
    .map(([key, variants]) => {
      const latest = variants
        .map((v) => v.latest)
        .reduce((a, b) => (b.purchase.purchased_at > a.purchase.purchased_at ? b : a));
      return {
        key,
        name: (latest.item.product as Product).name,
        variants,
        latest,
        purchaseCount: new Set(variants.flatMap((v) => v.entries.map((e) => e.purchase.id))).size,
        spent: sumAmounts(variants.map((v) => v.spent)),
      };
    })
    .sort((a, b) => b.purchaseCount - a.purchaseCount || a.name.localeCompare(b.name));
}

/** The variant to point out as cheapest by its latest price, only when every variant compares
 *  (same package and unit) and there's a single winner. */
export function cheapestVariant({ variants }: ProductGroup) {
  if (variants.length < 2) return undefined;
  const [first] = variants as [ProductHistory];
  const sameKind = (v: ProductHistory) =>
    v.product.package_size === first.product.package_size &&
    v.product.package_unit === first.product.package_unit &&
    v.latest.item.unit === first.latest.item.unit;
  if (!variants.every(sameKind)) return undefined;
  const prices = variants.map((v) => v.latest.item.unit_price);
  const min = Math.min(...prices);
  return prices.filter((p) => p === min).length === 1 ? variants[prices.indexOf(min)] : undefined;
}

/** "R$ 2,00 mais caro por un que na compra anterior"; null when there's no change to point out. */
export function trendSentence(item: PurchaseItem) {
  const change = priceChange(item);
  if (!change) return null;
  const amount = formatCurrency(Math.abs(change));
  return `${amount} ${change > 0 ? 'mais caro' : 'mais barato'} por ${formatUnit(item.unit)} que na compra anterior`;
}
