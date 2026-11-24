import { Camera, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

export function ScanCta() {
  return (
    <Link
      to="/scan"
      className="pressable flex items-center gap-4 rounded-card bg-bg-card p-4 transition-colors hover:bg-bg-card/80"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-mint text-brand-green">
        <Camera aria-hidden size={24} strokeWidth={2.25} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-headline">Enviar nova nota</span>
        <span className="mt-0.5 block text-subheadline text-label-secondary">
          Tire uma foto da nota fiscal e a gente lê cada item pra você.
        </span>
      </span>
      <ChevronRight aria-hidden size={18} className="shrink-0 text-label-tertiary" />
    </Link>
  );
}
