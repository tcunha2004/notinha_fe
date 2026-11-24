import type { ReactNode } from 'react';

interface PurchaseLayoutProps {
  children: ReactNode;
  aside: ReactNode;
  footer: ReactNode;
}

/**
 * Detail/review body. Phones: children → aside → footer in one column.
 * Desktop: `aside` (the items list) fills the right column; children and footer stack on the left.
 */
export function PurchaseLayout({ children, aside, footer }: PurchaseLayoutProps) {
  return (
    <div className="mt-2 grid gap-5 lg:grid-cols-2 lg:grid-rows-[repeat(4,auto)_1fr] lg:gap-x-8">
      {children}
      <div className="lg:col-start-2 lg:row-span-full lg:row-start-1">{aside}</div>
      {footer}
    </div>
  );
}

/** Bottom action that stays visible while the page scrolls. */
export function StickyFooter({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 bg-linear-to-t from-bg-grouped from-60% to-transparent px-4 pt-8 pb-[max(16px,env(safe-area-inset-bottom))] lg:mx-0 lg:w-[calc(50%-16px)] lg:px-0">
      {children}
    </div>
  );
}
