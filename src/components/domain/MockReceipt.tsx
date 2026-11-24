import { cn } from '../../lib/cn';

// Decorative stand-in for the camera feed; mirrors purchase p1 but is intentionally static.
const LINES: [string, string][] = [
  ['ARROZ T1 5KG', '27,90'],
  ['FEIJAO CARIOCA 1KG 2x', '16,98'],
  ['LEITE INTEGRAL 1L 6x', '28,74'],
  ['CAFE TORRADO 500G', '19,90'],
  ['BANANA PRATA KG', '8,63'],
  ['OVOS BRANCOS 12UN', '13,49'],
  ['DET LIQ 500ML 3x', '7,27'],
  ['PAO FRANCES KG', '6,55'],
];

const QR_SIZE = 25;

/** Deterministic QR-looking pattern: three finder squares + pseudo-random modules. */
function qrPath() {
  const finder = (x: number, y: number) =>
    `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > QR_SIZE - 9 && y < 8) || (x < 8 && y > QR_SIZE - 9);
  let path = finder(0, 0) + finder(QR_SIZE - 7, 0) + finder(0, QR_SIZE - 7);
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      if (!inFinder(x, y) && (x * 7 + y * 13 + x * y) % 5 < 2) path += `M${x} ${y}h1v1h-1z`;
    }
  }
  return path;
}
const QR = qrPath();

export function MockReceipt({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'bg-paper px-4 pt-5 pb-4 text-receipt text-paper-ink uppercase shadow-paper',
        className,
      )}
    >
      <p className="text-center text-receipt-lg font-semibold">Mercado Bom Dia LTDA</p>
      <p className="mt-1 text-center">CNPJ 12.345.678/0001-90</p>
      <p className="text-center">Av. das Palmeiras, 1200 · Centro</p>
      <hr className="my-2.5 border-t border-dashed border-paper-line" />
      <ul className="space-y-0.5">
        {LINES.map(([name, value]) => (
          <li key={name} className="flex justify-between gap-2">
            <span className="truncate">{name}</span>
            <span>{value}</span>
          </li>
        ))}
      </ul>
      <hr className="my-2.5 border-t border-dashed border-paper-line" />
      <p className="flex justify-between text-receipt-lg font-semibold">
        <span>Total R$</span>
        <span>129,46</span>
      </p>
      <svg
        viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
        className="mx-auto mt-2 size-22 fill-paper-ink"
        shapeRendering="crispEdges"
      >
        <path d={QR} fillRule="evenodd" />
      </svg>
      <p className="mt-1.5 text-center font-semibold">Chave de acesso</p>
      <p className="text-center text-receipt-sm whitespace-nowrap">
        3126 1112 3456 7800 0190 6500 1000 0123 4510 0012 3456
      </p>
    </div>
  );
}
