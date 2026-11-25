import { useId, useState } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import { usePurchase, type totalAction } from '../app/loaders';
import { SaveError, Sheet, SheetFormHeader } from '../components/ui/Sheet';
import { TextField } from '../components/ui/TextField';
import { formatCurrency, formatDecimal, parseDecimal } from '../lib/format';
import { getTotals } from '../lib/purchase';

/** `total`: corrects the receipt total, e.g. when it was cut off in the photo. */
export function TotalSheet() {
  const purchase = usePurchase();
  const navigate = useNavigate();
  const onClose = () => navigate('..', { replace: true, preventScrollReset: true });
  const titleId = useId();
  const fetcher = useFetcher<typeof totalAction>();
  const saving = fetcher.state !== 'idle';
  const failed = fetcher.state === 'idle' && fetcher.data && 'error' in fetcher.data;

  const { itemsTotal } = getTotals(purchase);
  // An unread total arrives as 0: start empty so the user types it instead of editing "0,00".
  const [total, setTotal] = useState(
    purchase.total_amount ? formatDecimal(purchase.total_amount) : '',
  );
  const value = parseDecimal(total);
  const matches = Math.round(value * 100) === Math.round(itemsTotal * 100);

  return (
    <Sheet labelledBy={titleId} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!total.trim() || saving) return;
          void fetcher.submit(
            { total_amount: value },
            { method: 'post', encType: 'application/json', preventScrollReset: true },
          );
        }}
        className="px-4 pt-2 pb-[max(20px,env(safe-area-inset-bottom))] lg:pt-4"
      >
        <SheetFormHeader
          titleId={titleId}
          title="Total da nota"
          onClose={onClose}
          saving={saving}
          disabled={!total.trim()}
        />

        <p className="mt-5 px-1 text-subheadline text-label-secondary">
          Digite o <strong className="font-semibold">Valor a pagar</strong> impresso no fim da nota.
        </p>

        <fieldset disabled={saving} className="mt-3 overflow-hidden rounded-field bg-bg-grouped">
          <TextField
            label="Valor a pagar"
            prefix="R$"
            inputMode="decimal"
            placeholder="0,00"
            autoFocus
            value={total}
            onChange={(event) => setTotal(event.target.value)}
            className="text-label-primary"
          />
        </fieldset>

        {/* Cut-off totals are the common case, and then the items' sum is usually the answer. */}
        <div className="mt-5 flex items-center justify-between gap-4 px-1">
          <span className="text-body text-label-secondary">
            Soma dos itens <span className="text-label-primary">{formatCurrency(itemsTotal)}</span>
          </span>
          {!matches && (
            <button
              type="button"
              disabled={saving}
              onClick={() => setTotal(formatDecimal(itemsTotal))}
              className="pressable rounded-full bg-brand-mint px-3.5 py-1.5 text-footnote font-semibold text-brand-green-dark hover:bg-brand-mint/70"
            >
              Usar a soma
            </button>
          )}
        </div>

        {failed ? (
          <SaveError />
        ) : (
          <p aria-live="polite" className="mt-3 px-1 text-footnote text-label-secondary">
            {total.trim() && matches
              ? 'Confere com a soma dos itens.'
              : 'Ao salvar, o Notinha confere de novo se a soma dos itens bate com o total da nota.'}
          </p>
        )}
      </form>
    </Sheet>
  );
}
