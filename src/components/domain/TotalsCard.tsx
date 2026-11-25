import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
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
      // The total may be cut off in the photo: the whole row opens the sheet to correct it.
      value: (
        <Link
          to="total"
          preventScrollReset
          aria-label={`Corrigir total da nota, ${formatCurrency(purchase.total_amount)}`}
          className="inline-flex items-center gap-1 outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent-blue"
        >
          {formatCurrency(purchase.total_amount)}
          <ChevronRight aria-hidden size={18} className="-mr-1 text-label-tertiary" />
        </Link>
      ),
      className:
        'relative font-semibold transition-colors has-[a:hover]:bg-fill-tertiary has-[a:active]:bg-fill-tertiary [&>dt]:text-label-primary',
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
