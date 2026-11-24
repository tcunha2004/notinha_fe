import { formatCurrency } from '../../lib/format';
import { getTotals } from '../../lib/purchase';
import type { Purchase } from '../../types';
import { InfoList, type InfoRow } from '../ui/Card';

export function TotalsCard({ purchase, className }: { purchase: Purchase; className?: string }) {
  const { subtotal, discounts, difference } = getTotals(purchase);
  const rows: InfoRow[] = [
    { label: 'Subtotal', value: formatCurrency(subtotal) },
    { label: 'Descontos', value: discounts ? `− ${formatCurrency(discounts)}` : formatCurrency(0) },
    {
      label: 'Total da nota',
      value: formatCurrency(purchase.total_amount),
      className: 'font-semibold [&>dt]:text-label-primary',
    },
  ];
  if (difference !== 0) {
    rows.push({
      label: 'Diferença',
      value: formatCurrency(difference),
      className: 'font-semibold text-accent-orange [&>dt]:text-accent-orange',
    });
  }
  return (
    <section aria-label="Totais" className={className}>
      <InfoList rows={rows} />
    </section>
  );
}
