import { LoaderCircle } from 'lucide-react';
import { useId, useState } from 'react';
import { Navigate, useFetcher, useNavigate, useParams } from 'react-router';
import { usePurchase, type itemAction } from '../app/loaders';
import { Button } from '../components/ui/Button';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { SaveError, Sheet, SheetFormHeader } from '../components/ui/Sheet';
import { TextField } from '../components/ui/TextField';
import { formatCurrency, formatDecimal, formatQuantity, parseDecimal } from '../lib/format';
import { itemLabel } from '../lib/purchase';
import type { PurchaseItem, Unit } from '../types';

const UNITS = ['UN', 'KG', 'L'] as const satisfies readonly Unit[];

/** `items/:itemId` edits that item; `items/new` adds one the reading missed. */
export function EditItemSheet() {
  const purchase = usePurchase();
  const { itemId } = useParams();
  const navigate = useNavigate();
  const close = () => navigate('..', { replace: true, preventScrollReset: true });
  if (itemId === 'new') return <ItemForm onClose={close} />;
  const item = purchase.items.find((candidate) => candidate.id === itemId);
  if (!item) return <Navigate to=".." replace />;
  return <ItemForm key={item.id} item={item} onClose={close} />;
}

function ItemForm({ item, onClose }: { item?: PurchaseItem; onClose: () => void }) {
  const titleId = useId();
  const fetcher = useFetcher<typeof itemAction>();
  const saving = fetcher.state !== 'idle';
  const removing = saving && fetcher.formMethod?.toUpperCase() === 'DELETE';
  // Removing asks twice: the first tap only reveals the red confirm button.
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const failed = fetcher.state === 'idle' && fetcher.data && 'error' in fetcher.data;

  const [description, setDescription] = useState(item ? itemLabel(item) : '');
  const [quantity, setQuantity] = useState(item ? formatQuantity(item.quantity, item.unit) : '1');
  const [unit, setUnit] = useState(item?.unit ?? 'UN');
  const [unitPrice, setUnitPrice] = useState(item ? formatDecimal(item.unit_price) : '');
  const [discount, setDiscount] = useState(formatDecimal(item?.discount ?? 0));
  const gross = parseDecimal(quantity) * parseDecimal(unitPrice) - parseDecimal(discount);
  const total = Math.max(0, Math.round(gross * 100) / 100);
  const missing = !description.trim()
    ? 'Dê um nome ao item'
    : parseDecimal(quantity) <= 0
      ? 'Informe a quantidade'
      : null;

  return (
    <Sheet labelledBy={titleId} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (missing || saving) return;
          void fetcher.submit(
            {
              description: description.trim(),
              quantity: parseDecimal(quantity),
              unit,
              unit_price: parseDecimal(unitPrice),
              discount: parseDecimal(discount),
            },
            { method: 'post', encType: 'application/json', preventScrollReset: true },
          );
        }}
        className="px-4 pt-2 pb-[max(20px,env(safe-area-inset-bottom))] lg:pt-4"
      >
        <SheetFormHeader
          titleId={titleId}
          title={item ? 'Editar item' : 'Novo item'}
          onClose={onClose}
          saving={saving}
          disabled={Boolean(missing)}
        />

        {item?.raw_description && (
          <>
            <h3 className="mt-5 px-1 pb-2 text-footnote text-label-secondary uppercase">
              Como está na nota
            </h3>
            <p className="flex flex-wrap gap-x-4 gap-y-1 rounded-field bg-fill-tertiary px-4 py-3 text-subheadline text-label-secondary">
              <span>{item.raw_description}</span>
              <span>
                {formatQuantity(item.quantity, item.unit)} {item.unit} ×{' '}
                {formatDecimal(item.unit_price)}
              </span>
              <span>{formatDecimal(item.total_amount)}</span>
            </p>
          </>
        )}

        <fieldset
          disabled={saving}
          className="mt-5 divide-y-[0.5px] divide-separator overflow-hidden rounded-field bg-bg-grouped"
        >
          <TextField
            label="Descrição"
            value={description}
            placeholder="Ex.: Pão francês"
            autoFocus={!item}
            onChange={(event) => setDescription(event.target.value)}
            className="text-label-primary"
          />
          <TextField
            label="Quantidade"
            inputMode="decimal"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
          <TextField
            label="Unidade"
            control={
              <SegmentedControl label="Unidade" options={UNITS} value={unit} onChange={setUnit} />
            }
          />
          <TextField
            label="Preço unitário"
            prefix="R$"
            inputMode="decimal"
            placeholder="0,00"
            value={unitPrice}
            onChange={(event) => setUnitPrice(event.target.value)}
          />
          <TextField
            label="Desconto"
            prefix="R$"
            inputMode="decimal"
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
          />
        </fieldset>

        <div className="mt-5 flex items-center justify-between gap-4 px-1">
          <span className="text-headline">Total do item</span>
          <output aria-live="polite" className="text-title-2 text-brand-green-dark">
            {formatCurrency(total)}
          </output>
        </div>

        {failed ? (
          <SaveError />
        ) : (
          <p aria-live="polite" className="mt-3 px-1 text-footnote text-label-secondary">
            {missing ??
              'Ao salvar, o Notinha confere de novo se a soma dos itens bate com o total da nota.'}
          </p>
        )}

        {item && (
          <div className="mt-6 border-t-[0.5px] border-separator pt-5">
            {confirmingRemove ? (
              <div role="group" aria-label="Confirmar remoção" className="flex gap-3">
                {/* Focus the safe choice: the button that had focus just disappeared. */}
                <Button
                  variant="gray"
                  autoFocus
                  disabled={saving}
                  onClick={() => setConfirmingRemove(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  disabled={saving}
                  onClick={() =>
                    void fetcher.submit(null, { method: 'delete', preventScrollReset: true })
                  }
                >
                  {removing && <LoaderCircle aria-hidden size={20} className="animate-spin" />}
                  {removing ? 'Removendo…' : 'Remover'}
                </Button>
              </div>
            ) : (
              <Button
                variant="destructiveGray"
                disabled={saving}
                onClick={() => setConfirmingRemove(true)}
              >
                Remover item
              </Button>
            )}
          </div>
        )}
      </form>
    </Sheet>
  );
}
