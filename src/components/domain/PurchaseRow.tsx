import { formatCurrency, formatPurchaseDate } from '../../lib/format';
import { storeName } from '../../lib/purchase';
import type { Purchase } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { ListRow } from '../ui/ListRow';

export function PurchaseRow({ purchase }: { purchase: Purchase }) {
  const needsReview = purchase.status === 'needs_review';
  return (
    <ListRow
      to={`/purchases/${purchase.id}`}
      chevron
      className="min-h-[66px]"
      leading={<Avatar name={storeName(purchase)} tone={needsReview ? 'orange' : 'green'} />}
      title={storeName(purchase)}
      subtitle={`${formatPurchaseDate(purchase.purchased_at)} · ${purchase.items.length} itens`}
      trailing={
        <>
          <span className="block text-headline">{formatCurrency(purchase.total_amount)}</span>
          {needsReview && <Badge tone="warning">Revisar</Badge>}
        </>
      }
    />
  );
}
