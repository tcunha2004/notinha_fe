import { formatCurrency, formatPurchaseDate } from '../../lib/format';
import { storeName } from '../../lib/purchase';
import type { Purchase } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { ListRow } from '../ui/ListRow';

export function PurchaseRow({ purchase }: { purchase: Purchase }) {
  const count = purchase.items.length;
  return (
    <ListRow
      to={`/purchases/${purchase.id}`}
      density="compra"
      leading={<Avatar name={storeName(purchase)} />}
      title={storeName(purchase)}
      subtitle={`${formatPurchaseDate(purchase.purchased_at)} · ${count} ${count === 1 ? 'item' : 'itens'}`}
      trailing={
        <span className="flex flex-col items-end gap-1">
          <span className="texto-corpo-forte whitespace-nowrap tabular-nums">
            {formatCurrency(purchase.total_amount)}
          </span>
          {purchase.status === 'needs_review' && <Badge tone="atencao">Revisar</Badge>}
        </span>
      }
    />
  );
}
