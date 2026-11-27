import { TriangleAlert } from 'lucide-react';
import { formatCurrency, formatDiscount, formatQuantity, formatUnit } from '../../lib/format';
import { itemTitle } from '../../lib/purchase';
import type { PurchaseItem } from '../../types';
import { ListRow } from '../ui/ListRow';
import { PriceTrend } from './PriceTrend';

/** "2 un × R$ 8,49 · −R$ 0,20 · confira o valor" */
function itemDetail(item: PurchaseItem) {
  const parts = [
    `${formatQuantity(item.quantity, item.unit)} ${formatUnit(item.unit)} × ${formatCurrency(item.unit_price)}`,
  ];
  if (item.discount) parts.push(formatDiscount(item.discount));
  if (item.flagged) parts.push('confira o valor');
  return parts.join(' · ');
}

export function ItemRow({ item, to }: { item: PurchaseItem; to?: string }) {
  return (
    <ListRow
      to={to}
      preventScrollReset
      alert={item.flagged}
      title={itemTitle(item)}
      subtitle={itemDetail(item)}
      trailing={
        <>
          {item.flagged && (
            <TriangleAlert aria-hidden size={18} className="shrink-0 text-atencao-700" />
          )}
          <span className="flex flex-col items-end gap-0.5">
            <span className="texto-corpo-forte whitespace-nowrap tabular-nums">
              {formatCurrency(item.total_amount)}
            </span>
            {/* A flagged line's price may be misread: comparing it would mislead. */}
            {!item.flagged && <PriceTrend item={item} />}
          </span>
        </>
      }
    />
  );
}
