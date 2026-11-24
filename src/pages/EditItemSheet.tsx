import { Check, X } from 'lucide-react';
import { useId, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { usePurchase } from '../app/loaders';
import { GlassButton } from '../components/ui/GlassButton';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Sheet } from '../components/ui/Sheet';
import { TextField } from '../components/ui/TextField';
import { formatCurrency, formatDecimal, formatQuantity, parseDecimal } from '../lib/format';
import { itemLabel } from '../lib/purchase';
import type { PurchaseItem, Unit } from '../types';

const UNITS = ['UN', 'KG', 'L'] as const satisfies readonly Unit[];

export function EditItemSheet() {
  const purchase = usePurchase();
  const { itemId } = useParams();
  const navigate = useNavigate();
  const item = purchase.items.find((candidate) => candidate.id === itemId);
  if (!item) return <Navigate to=".." replace />;
  return <ItemForm key={item.id} item={item} onClose={() => navigate('..', { replace: true })} />;
}

/** Visual only: edits live in local state and are discarded on close. */
function ItemForm({ item, onClose }: { item: PurchaseItem; onClose: () => void }) {
  const titleId = useId();
  const [description, setDescription] = useState(itemLabel(item));
  const [quantity, setQuantity] = useState(formatQuantity(item.quantity, item.unit));
  const [unit, setUnit] = useState<Unit>(item.unit);
  const [unitPrice, setUnitPrice] = useState(formatDecimal(item.unit_price));
  const [discount, setDiscount] = useState(formatDecimal(item.discount));
  const gross = parseDecimal(quantity) * parseDecimal(unitPrice) - parseDecimal(discount);
  const total = Math.max(0, Math.round(gross * 100) / 100);

  return (
    <Sheet labelledBy={titleId} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onClose();
        }}
        className="px-4 pt-2 pb-[max(20px,env(safe-area-inset-bottom))] lg:pt-4"
      >
        <span
          aria-hidden
          className="mx-auto block h-1.25 w-9 rounded-full bg-label-tertiary lg:hidden"
        />
        <div className="mt-3 grid grid-cols-[44px_1fr_44px] items-center gap-2">
          <GlassButton icon={X} label="Fechar" onClick={onClose} />
          <h2 id={titleId} className="text-center text-headline">
            Editar item
          </h2>
          <button
            type="submit"
            aria-label="Salvar"
            className="pressable grid size-11 place-items-center rounded-full bg-brand-green text-label-on-accent shadow-brand"
          >
            <Check aria-hidden size={22} strokeWidth={3} />
          </button>
        </div>

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

        <div className="mt-5 divide-y-[0.5px] divide-separator overflow-hidden rounded-field bg-bg-grouped">
          <TextField
            label="Descrição"
            value={description}
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

        <div className="mt-5 flex items-center justify-between gap-4 px-1">
          <span className="text-headline">Total do item</span>
          <output aria-live="polite" className="text-title-2 text-brand-green-dark">
            {formatCurrency(total)}
          </output>
        </div>
        <p className="mt-3 px-1 text-footnote text-label-secondary">
          Ao salvar, o Notinha confere de novo se a soma dos itens bate com o total da nota.
        </p>
      </form>
    </Sheet>
  );
}
