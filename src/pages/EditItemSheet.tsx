import { LoaderCircle } from 'lucide-react';
import { useId, useState } from 'react';
import { Navigate, useFetcher, useNavigate, useParams } from 'react-router';
import { usePurchase, type itemAction } from '../app/loaders';
import { Button } from '../components/ui/Button';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { SaveError, Sheet, SheetHeader } from '../components/ui/Sheet';
import { TextField } from '../components/ui/TextField';
import {
  formatCurrency,
  formatDecimal,
  formatQuantity,
  formatUnit,
  parseDecimal,
} from '../lib/format';
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

  const [name, setName] = useState(item ? itemLabel(item) : '');
  const [quantity, setQuantity] = useState(item ? formatQuantity(item.quantity, item.unit) : '1');
  const [unit, setUnit] = useState(item?.unit ?? 'UN');
  const [unitPrice, setUnitPrice] = useState(item ? formatDecimal(item.unit_price) : '');
  const [discount, setDiscount] = useState(formatDecimal(item?.discount ?? 0));
  const gross = parseDecimal(quantity) * parseDecimal(unitPrice) - parseDecimal(discount);
  const total = Math.max(0, Math.round(gross * 100) / 100);
  const missing = !name.trim()
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
              name: name.trim(),
              quantity: parseDecimal(quantity),
              unit,
              unit_price: parseDecimal(unitPrice),
              discount: parseDecimal(discount),
            },
            { method: 'post', encType: 'application/json', preventScrollReset: true },
          );
        }}
        className="pt-2 pb-[max(34px,env(safe-area-inset-bottom))] lg:pt-5"
      >
        <SheetHeader
          titleId={titleId}
          title={item ? 'Editar item' : 'Novo item'}
          onClose={onClose}
        />

        <div className="flex flex-col gap-3.5 px-5 pt-4">
          {item?.raw_description && (
            <div className="flex flex-col gap-1.5">
              <h3 className="texto-rotulo text-texto-secundario">Como está na nota</h3>
              <p className="flex flex-wrap justify-between gap-x-2 gap-y-1 rounded-sm bg-superficie px-3.5 py-3 font-mono text-[13px] leading-[18px]">
                <span>{item.raw_description}</span>
                <span>
                  {formatQuantity(item.quantity, item.unit)} × {formatDecimal(item.unit_price)} ={' '}
                  {formatDecimal(item.total_amount)}
                </span>
              </p>
            </div>
          )}

          <fieldset disabled={saving} className="contents">
            <TextField
              label="Descrição"
              value={name}
              placeholder="Ex.: Pão francês"
              autoFocus={!item}
              onChange={(event) => setName(event.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Quantidade"
                inputMode="decimal"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
              <SegmentedControl
                label="Unidade"
                options={UNITS}
                value={unit}
                onChange={setUnit}
                format={formatUnit}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
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
            </div>
          </fieldset>

          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="texto-corpo-forte">Total do item</span>
            <output
              aria-live="polite"
              className="text-[28px] leading-8 font-bold tracking-[-0.03em] tabular-nums [font-stretch:112%]"
            >
              {formatCurrency(total)}
            </output>
          </div>

          {failed ? (
            <SaveError>Não foi possível salvar. Confira sua conexão e tente de novo.</SaveError>
          ) : (
            <p aria-live="polite" className="texto-legenda text-texto-secundario">
              {missing ?? 'Ao salvar, a gente confere de novo se a soma bate com o total da nota.'}
            </p>
          )}

          <Button type="submit" aria-disabled={Boolean(missing) || saving}>
            {saving && !removing && <LoaderCircle aria-hidden size={20} className="animate-spin" />}
            {saving && !removing ? 'Salvando…' : 'Salvar item'}
          </Button>

          {item &&
            (confirmingRemove ? (
              <div role="group" aria-label="Confirmar remoção" className="flex gap-3">
                {/* Focus the safe choice: the button that had focus just disappeared. */}
                <Button
                  variant="secundario"
                  className="flex-1"
                  autoFocus
                  disabled={saving}
                  onClick={() => setConfirmingRemove(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="perigo"
                  className="flex-1"
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
                variant="perigoSecundario"
                disabled={saving}
                onClick={() => setConfirmingRemove(true)}
              >
                Remover item
              </Button>
            ))}
        </div>
      </form>
    </Sheet>
  );
}
