import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/cn';
import { formatCurrency, formatUnit } from '../../lib/format';
import { priceChange, trendSentence } from '../../lib/purchase';
import type { PurchaseItem } from '../../types';

const sizes = {
  /** Lists and cards: under an amount or beside a name. */
  sm: { text: 'texto-micro', icon: 14 },
  /** The product sheet's price tag. */
  md: { text: 'text-sm leading-[18px] font-semibold', icon: 16 },
};

/**
 * Unit price vs the user's previous purchase of the same product: "↗ +R$ 2,00" in red when it went up,
 * "↘ −R$ 0,20" in green when it went down. Nothing when the price held or it's the product's first purchase.
 * Never color alone: the arrow and the sign carry it too, and screen readers get a full sentence.
 */
export function PriceTrend({
  item,
  size = 'sm',
  perUnit = true,
  suffix,
  decorative = false,
  className,
}: {
  item: PurchaseItem;
  size?: keyof typeof sizes;
  /** "+R$ 2,00/un": the change is per unit, which matters next to a line total. Off where the price shows the unit. */
  perUnit?: boolean;
  /** Visible context after the amount, e.g. "vs. compra anterior". */
  suffix?: string;
  /** Hidden from screen readers, when the place it sits in reads `trendSentence` in a better order. */
  decorative?: boolean;
  className?: string;
}) {
  const change = priceChange(item);
  if (!change) return null; // null (first purchase) or 0 (same price): nothing to point out

  const amount = formatCurrency(Math.abs(change));
  const unit = formatUnit(item.unit);
  const [Icon, text, color] =
    change > 0
      ? [TrendingUp, `+${amount}`, 'text-preco-sobe']
      : [TrendingDown, `−${amount}`, 'text-preco-desce'];
  const sentence = trendSentence(item) ?? '';
  const { text: textClass, icon } = sizes[size];

  return (
    <span
      aria-hidden={decorative || undefined}
      title={sentence}
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap tabular-nums',
        textClass,
        color,
        className,
      )}
    >
      <Icon aria-hidden size={icon} strokeWidth={2.5} className="shrink-0" />
      <span aria-hidden>
        {text}
        {perUnit && `/${unit}`}
        {suffix && ` ${suffix}`}
      </span>
      {!decorative && <span className="sr-only">{sentence}</span>}
    </span>
  );
}
