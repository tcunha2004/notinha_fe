import { Check, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { GlassButton } from './GlassButton';

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

/** Grab handle + close · title · save row of a form sheet. The save button submits the form. */
export function SheetFormHeader({
  titleId,
  title,
  onClose,
  saving,
  disabled,
}: {
  titleId: string;
  title: string;
  onClose: () => void;
  saving: boolean;
  disabled: boolean;
}) {
  return (
    <>
      <span
        aria-hidden
        className="mx-auto block h-1.25 w-9 rounded-full bg-label-tertiary lg:hidden"
      />
      <div className="mt-3 grid grid-cols-[44px_1fr_44px] items-center gap-2">
        <GlassButton icon={X} label="Fechar" onClick={onClose} />
        <h2 id={titleId} className="text-center text-headline">
          {title}
        </h2>
        <button
          type="submit"
          aria-label={saving ? 'Salvando…' : 'Salvar'}
          aria-disabled={disabled || saving}
          className="pressable grid size-11 place-items-center rounded-full bg-brand-green text-label-on-accent shadow-brand transition-opacity aria-disabled:opacity-40 aria-disabled:shadow-none"
        >
          {saving ? (
            <LoaderCircle aria-hidden size={22} className="animate-spin" />
          ) : (
            <Check aria-hidden size={22} strokeWidth={3} />
          )}
        </button>
      </div>
    </>
  );
}

/** Shown in a form sheet when the save didn't reach the API. */
export function SaveError() {
  return (
    <p
      role="alert"
      className="mt-3 flex items-center gap-2 rounded-field bg-accent-orange-soft px-4 py-3 text-subheadline text-accent-orange"
    >
      <TriangleAlert aria-hidden size={18} className="shrink-0" />
      Não foi possível salvar. Verifique sua conexão e tente de novo.
    </p>
  );
}
