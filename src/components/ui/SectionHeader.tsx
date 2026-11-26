import type { ReactNode } from 'react';

/** Title on the left; an action or a total on the right. */
export function SectionHeader({
  id,
  title,
  trailing,
}: {
  id?: string;
  title: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 px-5">
      <h2 id={id} className="texto-titulo-3">
        {title}
      </h2>
      {trailing && (
        <span className="texto-legenda text-texto-secundario tabular-nums">{trailing}</span>
      )}
    </div>
  );
}
