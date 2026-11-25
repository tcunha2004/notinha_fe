import { LoaderCircle, Trash2 } from 'lucide-react';
import { useId } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import { usePurchase, type deletePurchaseAction } from '../app/loaders';
import { Button } from '../components/ui/Button';
import { Sheet } from '../components/ui/Sheet';
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
        className="flex flex-col items-center px-4 pt-2 pb-[max(20px,env(safe-area-inset-bottom))] text-center lg:pt-4"
      >
        <span aria-hidden className="block h-1.25 w-9 rounded-full bg-label-tertiary lg:hidden" />
        <span className="mt-6 grid size-14 place-items-center rounded-full bg-accent-red/12 text-accent-red">
          <Trash2 aria-hidden size={26} />
        </span>
        <h2 id={titleId} className="mt-4 text-title-3">
          Excluir esta compra?
        </h2>
        <p className="mt-2 text-subheadline text-label-secondary">
          A compra em <strong className="font-semibold">{storeName(purchase)}</strong> (
          {formatCurrency(purchase.total_amount)}), {count === 1 ? 'o item' : `os ${count} itens`} e
          a foto da nota serão apagados. Não dá para desfazer.
        </p>

        {failed && (
          <p role="alert" className="mt-3 text-subheadline text-accent-red">
            Não foi possível excluir. Verifique sua conexão e tente de novo.
          </p>
        )}

        <div className="mt-6 flex w-full flex-col gap-3">
          <Button type="submit" variant="destructive" disabled={deleting}>
            {deleting && <LoaderCircle aria-hidden size={20} className="animate-spin" />}
            {deleting ? 'Excluindo…' : 'Excluir compra'}
          </Button>
          <Button variant="gray" onClick={onClose} disabled={deleting}>
            Cancelar
          </Button>
        </div>
      </fetcher.Form>
    </Sheet>
  );
}
