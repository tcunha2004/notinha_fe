import { TriangleAlert, X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { IconButton } from './IconButton';

interface SheetProps {
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Native modal `<dialog>`: focus trap, Escape and inert background come from the browser.
 * Bottom sheet (28px corners over a 48% ink veil) on phones/tablets, centered dialog on desktop.
 */
export function Sheet({ labelledBy, onClose, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    // The sheet is unmounted by routing, not closed, so focus must be handed back manually.
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      dialog?.close();
      opener?.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // Clicks on the backdrop land on the <dialog> itself; clicks inside land on children.
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[calc(100dvh-48px)] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-xl border-0 bg-superficie-elevada p-0 text-texto animate-folha backdrop:bg-veu backdrop:animate-surgir md:inset-x-0 md:mx-auto md:max-w-[640px] lg:inset-0 lg:m-auto lg:h-fit lg:w-[calc(100%-32px)] lg:max-w-[440px] lg:rounded-xl lg:animate-surgir"
    >
      {children}
    </dialog>
  );
}

/** Grab handle + close · title row of a sheet. */
export function SheetHeader({
  titleId,
  title,
  onClose,
}: {
  titleId: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <>
      <span aria-hidden className="mx-auto block h-1.25 w-9 rounded-full bg-linha lg:hidden" />
      <div className="mt-2 grid h-11 grid-cols-[44px_1fr_44px] items-center gap-2 px-5 lg:mt-0">
        <IconButton icon={X} label="Fechar" onClick={onClose} />
        <h2 id={titleId} className="text-center texto-titulo-3">
          {title}
        </h2>
      </div>
    </>
  );
}

/** Shown in a sheet when the change didn't reach the API. */
export function SaveError({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-center gap-2 rounded-md bg-erro-50 px-4 py-3 texto-legenda text-erro-700"
    >
      <TriangleAlert aria-hidden size={18} className="shrink-0" />
      {children}
    </p>
  );
}
