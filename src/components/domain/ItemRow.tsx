import { TriangleAlert } from 'lucide-react';
import { formatCurrency, formatQuantity } from '../../lib/format';
import type { PurchaseItem } from '../../types';
import { ListRow } from '../ui/ListRow';

export function ItemRow({ item, to }: { item: PurchaseItem; to?: string }) {
  const quantity = `${formatQuantity(item.quantity, item.unit)} ${item.unit} × ${formatCurrency(item.unit_price)}`;
  return (
    <ListRow
      to={to}
      title={item.raw_description}
      subtitle={
        item.flagged ? (
          <span className="text-accent-orange">{quantity} · confira o valor</span>
        ) : (
          quantity
        )
      }
      trailing={
        <span className="flex items-center gap-2 text-body">
          {item.flagged && (
            <TriangleAlert aria-label="Valor a conferir" size={18} className="text-accent-orange" />
          )}
          {formatCurrency(item.total_amount)}
        </span>
      }
    />
  );
}
