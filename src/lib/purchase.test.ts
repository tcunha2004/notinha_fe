import { describe, expect, it } from 'vitest';
import { purchases } from '../mocks/purchases';
import type { Purchase, PurchaseItem } from '../types';
import type { ProductGroup } from './purchase';
import { formatMonthYear, formatPurchaseDate, formatQuantity, formatUnit } from './format';
import {
  getInitials,
  getTotals,
  groupByMonth,
  cheapestVariant,
  groupByProduct,
  groupProducts,
  listBrands,
  priceChange,
  sentenceCase,
} from './purchase';

describe('purchase math', () => {
  it('items of every "ok" purchase add up to its total', async () => {
    for (const purchase of purchases) {
      const { difference } = getTotals(purchase);
      expect(difference, purchase.id).toBe(purchase.status === 'ok' ? 0 : 2.26);
    }
  });

  it('computes subtotal and discounts for p1', async () => {
    const p1 = purchases.find((p) => p.id === 'p1');
    if (!p1) throw new Error('p1 missing');
    expect(getTotals(p1)).toEqual({
      itemsTotal: 129.46,
      discounts: 0.5,
      subtotal: 129.96,
      difference: 0,
    });
  });

  it('groups by month with totals, counts and averages', async () => {
    const [nov, oct] = groupByMonth(purchases);
    expect(nov).toMatchObject({ key: '2026-11', total: 1248.9, count: 7, average: 178.41 });
    expect(oct).toMatchObject({ key: '2026-10', total: 684.77, count: 3 });
  });
});

describe('formatting', () => {
  const now = new Date('2026-11-24T20:00:00');
  it('formats relative purchase dates', () => {
    expect(formatPurchaseDate('2026-11-24T18:42:00', {}, now)).toBe('Hoje, 18:42');
    expect(formatPurchaseDate('2026-11-23T10:15:00', {}, now)).toBe('Ontem, 10:15');
    expect(formatPurchaseDate('2026-11-19T17:20:00', {}, now)).toBe('19 nov');
    expect(formatPurchaseDate('2026-11-19T17:20:00', { withTime: true }, now)).toBe(
      '19 nov, 17:20',
    );
  });

  it('formats quantities and initials', () => {
    expect(formatQuantity(0.412, 'KG')).toBe('0,412');
    expect(formatQuantity(6, 'UN')).toBe('6');
    expect(getInitials('Hortifruti Sol Nascente')).toBe('HS');
  });

  it('follows the design voice: month headers, units and receipt names', () => {
    expect(formatMonthYear(new Date('2026-11-01T00:00:00'))).toBe('Novembro de 2026');
    expect([formatUnit('UN'), formatUnit('KG'), formatUnit('L')]).toEqual(['un', 'kg', 'L']);
    expect(sentenceCase('ARROZ T1 5KG')).toBe('Arroz t1 5kg');
    expect(sentenceCase('Pão francês')).toBe('Pão francês');
  });
});

describe('groupByProduct', () => {
  const [p1, p2] = purchases as [Purchase, Purchase];
  const [arroz, feijao] = p1.items as [PurchaseItem, PurchaseItem];
  // Newest first: arroz bought at three prices, then feijão once and an unidentified line.
  const fixture: Purchase[] = [
    { ...p1, id: 'a', items: [{ ...arroz, id: 'a1', unit_price: 29.9, total_amount: 29.9 }] },
    {
      ...p2,
      id: 'b',
      items: [
        { ...arroz, id: 'b1', unit_price: 25.9, total_amount: 51.8, quantity: 2 },
        { ...feijao, id: 'b2' },
        { ...feijao, id: 'b3', product: null },
      ],
    },
    { ...p1, id: 'c', items: [{ ...arroz, id: 'c1', unit_price: 27.9, total_amount: 27.9 }] },
  ];

  it('groups lines by product, most bought first, skipping unidentified items', () => {
    const [first, second, ...rest] = groupByProduct(fixture);
    expect(rest).toEqual([]);
    expect(first?.product.name).toBe('Arroz tipo 1 5kg');
    expect(first?.entries.map((e) => e.item.id)).toEqual(['a1', 'b1', 'c1']);
    expect(first).toMatchObject({ purchaseCount: 3, spent: 109.6 });
    expect(first?.lowest.item.id).toBe('b1');
    expect(first?.highest.item.id).toBe('a1');
    expect(second).toMatchObject({ purchaseCount: 1, spent: 16.98 });
  });
});

describe('priceChange', () => {
  const [p1] = purchases as [Purchase];
  const [arroz] = p1.items as [PurchaseItem];
  it('compares the unit price with the previous purchase, in cents', () => {
    expect(priceChange({ ...arroz, unit_price: 12, previous_unit_price: 10 })).toBe(2);
    expect(priceChange({ ...arroz, unit_price: 4.79, previous_unit_price: 4.99 })).toBe(-0.2);
    expect(priceChange({ ...arroz, unit_price: 10, previous_unit_price: 10 })).toBe(0);
    expect(priceChange({ ...arroz, previous_unit_price: null })).toBeNull();
  });

  it('mocks follow the API: the oldest purchase of a product has nothing to compare', () => {
    const oldest = purchases.at(-1)?.items[0];
    expect(oldest?.previous_unit_price).toBeNull();
    const shampoo = purchases
      .find((p) => p.id === 'p6')
      ?.items.find((i) => i.raw_description === 'SHAMPOO 350ML');
    expect(shampoo?.previous_unit_price).toBe(18.75); // p8, the latest purchase before p6 that had it
  });
});

describe('groupProducts', () => {
  const groups = groupProducts(purchases);
  const find = (key: string) => groups.find((g) => g.key === key);

  it('puts every brand of a generic product under one name', () => {
    const achocolatado = find('achocolatado');
    expect(achocolatado?.variants.map((v) => v.product.brand)).toEqual(['Nescau', 'Toddy', null]);
    expect(achocolatado).toMatchObject({ purchaseCount: 6 });
    expect(achocolatado?.latest.purchase.id).toBe('p3'); // newest across brands
    expect(find('cafe torrado')).toMatchObject({ name: 'Café torrado' });
  });

  it('points out the cheapest brand only when the variants compare', () => {
    // Latest prices: Nescau 10,49 (p3) · Toddy 8,33 (p6) · sem marca 9,37 (p8), all 400 g.
    expect(cheapestVariant(find('achocolatado') as ProductGroup)?.product.brand).toBe('Toddy');
    expect(cheapestVariant(find('cafe torrado') as ProductGroup)).toBeUndefined(); // one brand
  });
});

describe('listBrands', () => {
  it('lists each brand once, most bought first, without "sem marca"', () => {
    const brands = listBrands(groupProducts(purchases));
    expect(brands.map((b) => b.name)).toEqual(['Nescau', 'Toddy', 'Itambé', 'Pilão']);
    expect(brands[0]).toEqual({ name: 'Nescau', logo: 'https://example.com/nescau.png' });
  });
});
