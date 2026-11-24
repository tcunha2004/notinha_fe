import type { ReactNode } from 'react';

/** Pushed-screen header: leading glass button + centered inline title. */
export function NavBar({ title, leading }: { title: string; leading: ReactNode }) {
  return (
    <header className="grid grid-cols-[44px_1fr_44px] items-center gap-2 pt-[max(12px,env(safe-area-inset-top))] pb-2">
      {leading}
      <h1 className="truncate text-center text-headline">{title}</h1>
    </header>
  );
}
