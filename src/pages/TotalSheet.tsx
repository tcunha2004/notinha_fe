import { LoaderCircle } from 'lucide-react';
import { useId, useState } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import { usePurchase, type totalAction } from '../app/loaders';
import { Button } from '../components/ui/Button';
import { SaveError, Sheet, SheetHeader } from '../components/ui/Sheet';
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
        className="pt-2 pb-[max(34px,env(safe-area-inset-bottom))] lg:pt-5"
      >
        <SheetHeader titleId={titleId} title="Total da nota" onClose={onClose} />

        <div className="flex flex-col gap-3.5 px-5 pt-4">
          <p className="texto-legenda text-texto-secundario">
            Digite o <strong className="font-semibold text-texto">Valor a pagar</strong> impresso no
            fim da nota.
          </p>

          <fieldset disabled={saving} className="contents">
            <TextField
              label="Valor a pagar"
              prefix="R$"
              inputMode="decimal"
              placeholder="0,00"
              autoFocus
              value={total}
              onChange={(event) => setTotal(event.target.value)}
            />
          </fieldset>

          {/* Cut-off totals are the common case, and then the items' sum is usually the answer. */}
          <div className="flex min-h-11 items-center justify-between gap-4">
            <span className="texto-legenda text-texto-secundario">
              Soma dos itens{' '}
              <span className="texto-corpo-forte text-texto tabular-nums">
                {formatCurrency(itemsTotal)}
              </span>
            </span>
            {!matches && (
              <Button
                variant="secundario"
                size="medio"
                disabled={saving}
                onClick={() => setTotal(formatDecimal(itemsTotal))}
              >
                Usar a soma
              </Button>
            )}
          </div>

          {failed ? (
            <SaveError>Não foi possível salvar. Confira sua conexão e tente de novo.</SaveError>
          ) : (
            <p aria-live="polite" className="texto-legenda text-texto-secundario">
              {total.trim() && matches
                ? 'Confere com a soma dos itens.'
                : 'Ao salvar, a gente confere de novo se a soma bate com o total da nota.'}
            </p>
          )}

          <Button type="submit" aria-disabled={!total.trim() || saving}>
            {saving && <LoaderCircle aria-hidden size={20} className="animate-spin" />}
            {saving ? 'Salvando…' : 'Salvar total'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
