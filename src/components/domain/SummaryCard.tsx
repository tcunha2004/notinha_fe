import { ReceiptText } from 'lucide-react';
import { formatCurrency } from '../../lib/format';
import { Badge } from '../ui/Badge';

interface SummaryCardProps {
  month: string;
  total: number;
  count: number;
  average: number;
}

export function SummaryCard({ month, total, count, average }: SummaryCardProps) {
  return (
    <section className="relative isolate overflow-hidden rounded-card bg-brand-gradient p-5 text-label-on-accent shadow-brand">
      <ReceiptText
        aria-hidden
        size={148}
        strokeWidth={1.25}
        className="absolute -top-3 -right-3 -z-10 rotate-12 opacity-15"
      />
      <h2 className="text-callout">Gasto em {month}</h2>
      <p className="mt-1 font-rounded text-amount-large">{formatCurrency(total)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="onAccent">{count} compras</Badge>
        <Badge tone="onAccent">Média {formatCurrency(average)}</Badge>
      </div>
    </section>
  );
}
