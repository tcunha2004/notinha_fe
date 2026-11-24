import { TriangleAlert } from 'lucide-react';
import { formatCurrency } from '../../lib/format';

export function ReviewBanner({ itemsTotal, total }: { itemsTotal: number; total: number }) {
  return (
    <section
      aria-labelledby="review-banner-title"
      className="flex gap-3 rounded-card bg-accent-orange-soft p-4"
    >
      <TriangleAlert aria-hidden size={22} className="mt-0.5 shrink-0 text-accent-orange" />
      <div>
        <h2 id="review-banner-title" className="text-headline text-accent-orange">
          Precisa de revisão
        </h2>
        <p className="mt-0.5 text-subheadline">
          Os itens somam {formatCurrency(itemsTotal)}, mas o total da nota é {formatCurrency(total)}
          . Confira o item marcado.
        </p>
      </div>
    </section>
  );
}
