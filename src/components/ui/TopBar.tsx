import type { ReactNode } from 'react';

/** 44px bar with no background of its own: leave action on the left, optional title and action. */
export function TopBar({
  leading,
  title,
  trailing,
}: {
  leading: ReactNode;
  /** Only when it helps. Pass an <h1> when it is the screen's title. */
  title?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="grid h-11 grid-cols-[44px_1fr_44px] items-center gap-2 px-5">
      {leading}
      <div className="truncate text-center texto-titulo-3">{title}</div>
      {trailing}
    </div>
  );
}
