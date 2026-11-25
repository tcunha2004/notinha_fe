import type { Purchase, PurchaseItem } from '../types';
import { formatPurchaseDate } from './format';

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

/** Friendly name for the edit form: the user's own, else what the receipt says. */
export const itemLabel = (item: PurchaseItem) => item.description ?? item.raw_description ?? '';

/** List title: the receipt's text (as in the design), or the name of a hand-added item. */
export const itemTitle = (item: PurchaseItem) => item.raw_description ?? item.description ?? '';

/** The CNPJ may be unreadable, and then there's no store at all. */
export const storeName = (purchase: Purchase) => purchase.store?.name ?? 'Loja não identificada';

/** "Hoje, 18:42 · Cartão de crédito" (payment left out when it wasn't read). */
export const purchaseSubtitle = (purchase: Purchase) =>
  [formatPurchaseDate(purchase.purchased_at, { withTime: true }), purchase.payment_method]
    .filter(Boolean)
    .join(' · ');
