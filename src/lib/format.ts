import type { Unit } from '../types';

const LOCALE = 'pt-BR';
const currency = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'BRL' });
const decimal = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const time = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });
const shortMonth = new Intl.DateTimeFormat(LOCALE, { month: 'short' });
const longDay = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });
const month = new Intl.DateTimeFormat(LOCALE, { month: 'long' });
const monthYear = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' });

/** R$ 1.248,90 */
export const formatCurrency = (value: number) => currency.format(value);

/** 15,90 (no currency symbol, as printed on receipts) */
export const formatDecimal = (value: number) => decimal.format(value);

/** 0,412 for KG; 2 for UN */
export function formatQuantity(quantity: number, unit: Unit) {
  const digits = unit === 'KG' ? 3 : 0;
  return quantity.toLocaleString(LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: 3,
  });
}

/** Parses "1.234,56" → 1234.56; empty/invalid → 0. */
export function parseDecimal(text: string) {
  const value = Number(text.replace(/[^\d,-]/g, '').replace(',', '.'));
  return Number.isFinite(value) ? value : 0;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/**
 * "Hoje, 18:42" · "Ontem, 10:15" · "19 nov".
 * Older dates show the time only with `withTime` ("19 nov, 17:20").
 */
export function formatPurchaseDate(iso: string, { withTime = false } = {}, now = new Date()) {
  const date = new Date(iso);
  const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  const hhmm = time.format(date);
  if (daysAgo === 0) return `Hoje, ${hhmm}`;
  if (daysAgo === 1) return `Ontem, ${hhmm}`;
  const day = `${date.getDate()} ${shortMonth.format(date).replace('.', '')}`;
  return withTime ? `${day}, ${hhmm}` : day;
}

/** "terça, 24 de novembro" */
export const formatLongDay = (date: Date) => longDay.format(date).replace('-feira', '');

/** "novembro" */
export const formatMonth = (date: Date) => month.format(date);

/** "novembro 2026" */
export const formatMonthYear = (date: Date) => monthYear.format(date).replace(' de ', ' ');
