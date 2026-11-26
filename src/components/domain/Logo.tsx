import { cn } from '../../lib/cn';

/** Receipt glyph from the brand mark (24px grid, rounded 2px stroke). */
export function ReceiptGlyph({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 21V3h14v18l-2.33-1.5L14.33 21 12 19.5 9.67 21l-2.34-1.5z" />
      <path d="M9 8h6M9 11.5h6M9 15h3" />
    </svg>
  );
}

/** "notinha" wordmark, optionally with the ink tile holding the green receipt. */
export function Logo({ mark = false, className }: { mark?: boolean; className?: string }) {
  return (
    <span className={cn('flex items-center gap-3', className)}>
      {mark && (
        <span className="grid size-12 shrink-0 place-items-center rounded-[13px] bg-tinta text-marca">
          <ReceiptGlyph size={25} />
        </span>
      )}
      <span className="leading-none largura-extra">notinha</span>
    </span>
  );
}
