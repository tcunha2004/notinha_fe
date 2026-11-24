import { useEffect, useRef, type ReactNode } from 'react';

interface SheetProps {
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Native modal `<dialog>`: focus trap, Escape and inert background come from the browser.
 * Bottom sheet on phones/tablets, centered dialog on desktop.
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
      className="fixed inset-x-1.5 top-auto bottom-[calc(6px+env(safe-area-inset-bottom))] m-0 max-h-[calc(100dvh-48px)] w-auto max-w-none overflow-y-auto overscroll-contain rounded-sheet border-0 bg-bg-card p-0 text-label-primary animate-sheet-up backdrop:bg-scrim backdrop:animate-fade-in lg:inset-0 lg:m-auto lg:h-fit lg:w-[calc(100%-32px)] lg:max-w-[440px] lg:rounded-[28px] lg:animate-dialog-in"
    >
      {children}
    </dialog>
  );
}
