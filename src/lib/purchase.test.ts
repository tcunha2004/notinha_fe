import { describe, expect, it } from 'vitest';
import { purchases } from '../mocks/purchases';
import { formatMonthYear, formatPurchaseDate, formatQuantity, formatUnit } from './format';
import { getInitials, getTotals, groupByMonth, sentenceCase } from './purchase';

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
