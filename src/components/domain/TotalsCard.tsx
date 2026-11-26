import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { formatCurrency, formatDiscount } from '../../lib/format';
import { getTotals } from '../../lib/purchase';
import type { Purchase } from '../../types';
import { KeyValueList, type KeyValue } from '../ui/KeyValueList';
import { SectionHeader } from '../ui/SectionHeader';

export function TotalsCard({ purchase }: { purchase: Purchase }) {
  const { subtotal, discounts, difference } = getTotals(purchase);
  const rows: KeyValue[] = [
    { label: 'Subtotal', value: formatCurrency(subtotal) },
    { label: 'Descontos', value: discounts ? formatDiscount(discounts) : formatCurrency(0) },
    {
      label: 'Total da nota',
      // The total may be cut off in the photo: the whole row opens the sheet to correct it.
      value: (
        <Link
          to="total"
          preventScrollReset
          aria-label={`Corrigir total da nota, ${formatCurrency(purchase.total_amount)}`}
          className="inline-flex items-center gap-1 font-semibold outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-texto"
        >
          {formatCurrency(purchase.total_amount)}
          <ChevronRight aria-hidden size={18} className="-mr-1 text-texto-secundario" />
        </Link>
      ),
      className:
        'relative transition-colors has-[a:hover]:bg-superficie has-[a:active]:bg-superficie [&>dt]:font-semibold [&>dt]:text-texto',
    },
  ];
  if (difference !== 0) {
    rows.push({
      label: 'Diferença',
      value: formatCurrency(difference),
      className: 'font-semibold text-atencao-700 [&>dt]:text-atencao-700 [&>dt]:font-semibold',
    });
  }
  return (
    <section aria-labelledby="totals-title">
      <SectionHeader id="totals-title" title="Totais" />
      <KeyValueList rows={rows} />
    </section>
  );
}
