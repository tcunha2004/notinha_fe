import { LoaderCircle, Trash2 } from 'lucide-react';
import { useId } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import { usePurchase, type deletePurchaseAction } from '../app/loaders';
import { Button } from '../components/ui/Button';
import { SaveError, Sheet } from '../components/ui/Sheet';
import { formatCurrency } from '../lib/format';
import { storeName } from '../lib/purchase';

/** `delete`: confirms before deleting the purchase, its items and the photo. */
export function DeletePurchaseSheet() {
  const purchase = usePurchase();
  const navigate = useNavigate();
  const onClose = () => navigate('..', { replace: true, preventScrollReset: true });
  const titleId = useId();
  const fetcher = useFetcher<typeof deletePurchaseAction>();
  const deleting = fetcher.state !== 'idle';
  const failed = fetcher.state === 'idle' && fetcher.data && 'error' in fetcher.data;
  const count = purchase.items.length;

  return (
    <Sheet labelledBy={titleId} onClose={onClose}>
      <fetcher.Form
        method="delete"
        className="flex flex-col items-center px-5 pt-2 pb-[max(34px,env(safe-area-inset-bottom))] text-center lg:pt-5"
      >
        <span aria-hidden className="block h-1.25 w-9 rounded-full bg-linha lg:hidden" />
        <span className="mt-6 grid size-14 place-items-center rounded-full bg-erro-50 text-erro-700">
          <Trash2 aria-hidden size={26} />
        </span>
        <h2 id={titleId} className="mt-4 texto-titulo-2">
          Excluir esta compra?
        </h2>
        <p className="mt-2 texto-legenda text-texto-secundario text-pretty">
          A compra em <strong className="font-semibold text-texto">{storeName(purchase)}</strong> (
          {formatCurrency(purchase.total_amount)}), {count === 1 ? 'o item' : `os ${count} itens`} e
          a foto da nota serão apagados. Não dá para desfazer.
        </p>

        {failed && (
          <div className="mt-4 w-full">
            <SaveError>Não foi possível excluir. Confira sua conexão e tente de novo.</SaveError>
          </div>
        )}

        <div className="mt-6 flex w-full flex-col gap-3">
          <Button type="submit" variant="perigo" disabled={deleting}>
            {deleting && <LoaderCircle aria-hidden size={20} className="animate-spin" />}
            {deleting ? 'Excluindo…' : 'Excluir compra'}
          </Button>
          <Button variant="secundario" onClick={onClose} disabled={deleting}>
            Cancelar
          </Button>
        </div>
      </fetcher.Form>
    </Sheet>
  );
}
