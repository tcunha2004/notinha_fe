import { Check, ChevronRight, Plus, Search, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type Ref } from 'react';
import { cn } from '../../lib/cn';
import { parseDecimal } from '../../lib/format';
import { foldText, productDetail } from '../../lib/purchase';
import { listProducts } from '../../services/purchases';
import type { Product } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SegmentedControl } from '../ui/SegmentedControl';
import { SheetHeader } from '../ui/Sheet';
import { TextField } from '../ui/TextField';

/** An existing product, or a new one (id null) that the API creates when the item is saved. */
export type ProductChoice = Product | (Omit<Product, 'id'> & { id: null });

type PackageUnit = NonNullable<Product['package_unit']>;
const PACKAGE_UNITS = ['g', 'ml', 'un'] as const satisfies readonly PackageUnit[];

/** Rows drawn at once; typing narrows the rest down. */
const MAX_RESULTS = 50;

/** The edit form's "Produto" field: shows the linked product; tapping it opens the picker. */
export function ProductField({
  choice,
  onOpen,
  ref,
}: {
  choice: ProductChoice | null;
  onOpen: () => void;
  ref?: Ref<HTMLButtonElement>;
}) {
  const labelId = useId();
  const valueId = useId();
  const detail = !choice
    ? ''
    : productDetail(choice) || (choice.id ? '' : 'Será criado ao salvar o item');
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span id={labelId} className="texto-rotulo text-texto-secundario">
        Produto
      </span>
      <button
        ref={ref}
        type="button"
        onClick={onOpen}
        aria-labelledby={`${labelId} ${valueId}`}
        className="flex min-h-13 w-full items-center gap-3 rounded-md bg-superficie px-4 py-2.5 text-left transition-colors duration-[120ms] focus-visible:shadow-[inset_0_0_0_2px_var(--color-texto)] focus-visible:outline-none active:bg-linha"
      >
        <span id={valueId} className="flex min-w-0 flex-1 flex-col gap-0.5">
          {choice ? (
            <>
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[17px] leading-[22px]">{choice.name}</span>
                {!choice.id && <Badge tone="novo">Novo</Badge>}
              </span>
              {detail && (
                <span className="truncate texto-legenda text-texto-secundario">{detail}</span>
              )}
            </>
          ) : (
            <span className="text-[17px] leading-[22px] text-texto-secundario">
              Nenhum produto vinculado ao item
            </span>
          )}
        </span>
        <ChevronRight aria-hidden size={20} className="shrink-0 text-texto-secundario" />
      </button>
    </div>
  );
}

interface Result {
  product: Product;
  /** Where the search starts in the folded name; -1 when it matched the brand (or no search). */
  at: number;
  /** 0 name starts with it · 1 a word starts with it · 2 anywhere in the name · 3 brand only. */
  rank: number;
}

/** Accent- and case-insensitive: "pao" finds "Pão francês"; "pilao" finds the Pilão brand. */
function search(products: Product[], query: string): Result[] {
  if (!query) return products.map((product) => ({ product, at: -1, rank: 0 }));
  const results: Result[] = [];
  for (const product of products) {
    const name = foldText(product.name);
    const at = name.indexOf(query);
    if (at >= 0) results.push({ product, at, rank: at === 0 ? 0 : name[at - 1] === ' ' ? 1 : 2 });
    else if (product.brand && foldText(product.brand).includes(query))
      results.push({ product, at: -1, rank: 3 });
  }
  return results.sort((a, b) => a.rank - b.rank); // stable: keeps the API's alphabetical order
}

/** Paints the searched part of the name in the brand green. */
function Highlight({ text, at, length }: { text: string; at: number; length: number }) {
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark className="bg-transparent text-marca-texto">{text.slice(at, at + length)}</mark>
      {text.slice(at + length)}
    </>
  );
}

/**
 * A step inside the edit sheet: search the product catalog, or create a new product.
 * Combobox pattern: focus stays in the search field; arrows move through the options, Enter picks.
 * Escape goes back a step instead of closing the sheet.
 */
export function ProductPicker({
  titleId,
  current,
  onPick,
  onBack,
  onClose,
}: {
  titleId: string;
  current: ProductChoice | null;
  onPick: (choice: ProductChoice) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<'buscar' | 'criar'>('buscar');
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[] | 'carregando' | 'erro'>('carregando');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    listProducts().then(
      (list) => live && setProducts(list),
      () => live && setProducts('erro'),
    );
    return () => {
      live = false;
    };
  }, [attempt]);

  const openCreate = () => setStep('criar');
  const back = () => (step === 'criar' ? setStep('buscar') : onBack());

  return (
    <div
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        event.preventDefault(); // keeps the <dialog> from closing
        back();
      }}
      className="flex h-[calc(100dvh-48px)] flex-col pt-2 animate-tela lg:h-[min(640px,calc(100dvh-48px))] lg:pt-5"
    >
      <SheetHeader
        titleId={titleId}
        title={step === 'criar' ? 'Novo produto' : 'Escolher produto'}
        onClose={onClose}
        onBack={back}
      />
      {step === 'criar' ? (
        <CreateStep
          initialName={query.trim()}
          products={Array.isArray(products) ? products : []}
          onPick={onPick}
        />
      ) : (
        <SearchStep
          query={query}
          onQueryChange={setQuery}
          products={products}
          current={current}
          onPick={onPick}
          onCreate={openCreate}
          onRetry={() => {
            setProducts('carregando');
            setAttempt((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}

function SearchStep({
  query,
  onQueryChange,
  products,
  current,
  onPick,
  onCreate,
  onRetry,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  products: Product[] | 'carregando' | 'erro';
  current: ProductChoice | null;
  onPick: (product: Product) => void;
  onCreate: () => void;
  onRetry: () => void;
}) {
  const listId = useId();
  const groupLabelId = useId();
  const input = useRef<HTMLInputElement>(null);
  const folded = foldText(query.trim());

  const results = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const found = search(products, folded);
    // No search yet: the linked product comes first, so it's clear what's picked.
    const currentAt = folded ? -1 : found.findIndex((r) => r.product.id === current?.id);
    if (currentAt > 0) found.unshift(...found.splice(currentAt, 1));
    return found;
  }, [products, folded, current?.id]);
  const visible = results.slice(0, MAX_RESULTS);

  // Option 0 is "Criar novo produto"; product i is option i + 1. -1: none active yet.
  const [active, setActive] = useState(-1);
  const optionId = (index: number) => `${listId}-${index}`;
  const choose = (index: number) => {
    if (index === 0) onCreate();
    const result = visible[index - 1];
    if (result) onPick(result.product);
  };

  useEffect(() => {
    if (active >= 0)
      document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
  });

  const typed = query.trim();
  const optionClasses = (index: number) =>
    cn(
      'flex min-h-16 cursor-pointer items-center gap-3 px-5 py-3 transition-colors duration-[120ms] hover:bg-superficie',
      active === index && 'bg-superficie',
    );

  return (
    <>
      <div className="px-5 pt-4 pb-2">
        <div className="flex h-13 items-center gap-2.5 rounded-md bg-superficie px-4 has-focus-visible:shadow-[inset_0_0_0_2px_var(--color-texto)]">
          <Search aria-hidden size={20} className="shrink-0 text-texto-secundario" />
          <input
            ref={input}
            role="combobox"
            aria-label="Buscar produto"
            aria-expanded
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? optionId(active) : undefined}
            // A step the user opened on purpose: the keyboard is what they need next.
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            placeholder="Nome ou marca"
            value={query}
            onChange={(event) => {
              const next = event.target.value;
              onQueryChange(next);
              // Typing makes the best match the Enter target; with no match, Enter creates.
              const hasMatch = search(
                Array.isArray(products) ? products : [],
                foldText(next.trim()),
              );
              setActive(!next.trim() ? -1 : hasMatch.length ? 1 : 0);
            }}
            onKeyDown={(event) => {
              const last = visible.length;
              if (event.key === 'ArrowDown') setActive((i) => Math.min(i + 1, last));
              else if (event.key === 'ArrowUp') setActive((i) => Math.max(i - 1, 0));
              else if (event.key === 'Enter') {
                if (active >= 0) choose(active);
              } else return;
              event.preventDefault();
            }}
            className="w-full min-w-0 flex-1 bg-transparent text-[17px] leading-[22px] outline-none placeholder:text-texto-secundario"
          />
          {query && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => {
                onQueryChange('');
                setActive(-1);
                input.current?.focus();
              }}
              className="pressable -mr-1.5 grid size-8 shrink-0 place-items-center rounded-full text-texto-secundario hover:text-texto"
            >
              <X aria-hidden size={18} />
            </button>
          )}
        </div>
      </div>

      <div
        role="listbox"
        id={listId}
        aria-label="Produtos"
        aria-busy={products === 'carregando'}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(16px,env(safe-area-inset-bottom))]"
      >
        <div
          role="option"
          id={optionId(0)}
          aria-selected={active === 0}
          onClick={() => choose(0)}
          onMouseMove={() => active !== 0 && setActive(0)}
          className={optionClasses(0)}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-marca text-sobre-marca">
            <Plus aria-hidden size={22} strokeWidth={2.25} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="texto-corpo-forte">Criar novo produto</span>
            <span className="truncate texto-legenda text-texto-secundario">
              {typed ? `“${typed}”` : 'Quando ele ainda não está na lista'}
            </span>
          </span>
        </div>

        <div role="group" aria-labelledby={groupLabelId}>
          <span
            id={groupLabelId}
            role="presentation"
            className="block px-5 pt-5 pb-1 texto-rotulo text-texto-secundario"
          >
            {!Array.isArray(products)
              ? 'Produtos'
              : typed
                ? `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}`
                : `${products.length} ${products.length === 1 ? 'produto' : 'produtos'}`}
          </span>

          {products === 'carregando' &&
            [56, 40, 64, 48, 36, 52].map((width) => (
              <span
                key={width}
                aria-hidden
                className="flex min-h-16 flex-col justify-center gap-2 px-5"
              >
                <span
                  className="h-4 animate-pulse rounded-full bg-superficie"
                  style={{ width: `${width}%` }}
                />
                <span className="h-3 w-1/4 animate-pulse rounded-full bg-superficie" />
              </span>
            ))}

          {products === 'erro' && (
            <div className="flex flex-col items-start gap-3 px-5 py-4">
              <p className="texto-legenda text-texto-secundario">
                Não deu pra carregar os produtos. Confira sua conexão.
              </p>
              <Button variant="secundario" size="medio" onClick={onRetry}>
                Tentar de novo
              </Button>
            </div>
          )}

          {Array.isArray(products) && !results.length && (
            <p className="px-5 py-4 texto-legenda text-texto-secundario">
              {typed
                ? `Nenhum produto com “${typed}”. Crie um novo com esse nome.`
                : 'Nenhum produto cadastrado ainda. Crie o primeiro.'}
            </p>
          )}

          {visible.map(({ product, at }, i) => {
            const index = i + 1;
            const detail = productDetail(product);
            const isCurrent = product.id === current?.id;
            return (
              <div
                key={product.id}
                role="option"
                id={optionId(index)}
                aria-selected={active === index}
                onClick={() => choose(index)}
                onMouseMove={() => active !== index && setActive(index)}
                className={optionClasses(index)}
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate texto-corpo-forte">
                    <Highlight text={product.name} at={at} length={folded.length} />
                  </span>
                  {detail && (
                    <span className="truncate texto-legenda text-texto-secundario">{detail}</span>
                  )}
                </span>
                {isCurrent && (
                  <>
                    <Check
                      aria-hidden
                      size={20}
                      strokeWidth={2.5}
                      className="shrink-0 text-marca-texto"
                    />
                    <span className="sr-only">(vinculado agora)</span>
                  </>
                )}
              </div>
            );
          })}

          {results.length > MAX_RESULTS && (
            <p className="px-5 py-4 texto-legenda text-texto-secundario">
              Mostrando {MAX_RESULTS} de {results.length}. Digite para encontrar o seu.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

/** Same product as the API would store it: name and brand ignoring case and accents. */
const sameProduct = (a: Omit<Product, 'id'>, b: Omit<Product, 'id'>) =>
  foldText(a.name) === foldText(b.name) &&
  foldText(a.brand ?? '') === foldText(b.brand ?? '') &&
  a.package_size === b.package_size &&
  a.package_unit === b.package_unit;

function CreateStep({
  initialName,
  products,
  onPick,
}: {
  /** What was typed in the search. */
  initialName: string;
  products: Product[];
  onPick: (choice: ProductChoice) => void;
}) {
  const [name, setName] = useState(initialName);
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [unit, setUnit] = useState<PackageUnit>('g');

  const sizeValue = parseDecimal(size);
  const draft: Omit<Product, 'id'> = {
    name: name.trim(),
    brand: brand.trim() || null,
    // No size: sold by weight/volume, so the unit means nothing either.
    package_size: sizeValue > 0 ? sizeValue : null,
    package_unit: sizeValue > 0 ? unit : null,
  };
  // Already in the list: offer it instead of a twin.
  const twin = draft.name ? products.find((p) => sameProduct(p, draft)) : undefined;
  const twinDetail = twin ? productDetail(twin) : '';

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (draft.name) onPick({ id: null, ...draft });
      }}
      className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto overscroll-contain px-5 pt-4 pb-[max(34px,env(safe-area-inset-bottom))]"
    >
      <TextField
        label="Nome do produto"
        value={name}
        placeholder="Ex.: Café torrado"
        maxLength={200}
        autoFocus
        onChange={(event) => setName(event.target.value)}
      />
      <TextField
        label="Marca (opcional)"
        value={brand}
        placeholder="Ex.: Pilão"
        maxLength={200}
        onChange={(event) => setBrand(event.target.value)}
      />
      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Embalagem (opcional)"
            inputMode="decimal"
            placeholder="Ex.: 500"
            value={size}
            onChange={(event) => setSize(event.target.value)}
          />
          <SegmentedControl
            label="Unidade"
            options={PACKAGE_UNITS}
            value={unit}
            onChange={setUnit}
          />
        </div>
        <p className="texto-legenda text-texto-secundario">
          Em branco para o que é vendido por peso, como frutas e pão francês.
        </p>
      </div>

      {twin ? (
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 texto-legenda text-texto-secundario">
            Já existe <span className="font-semibold text-texto">{twin.name}</span>
            {twinDetail && ` (${twinDetail})`} na lista.
          </p>
          <Button variant="secundario" size="medio" onClick={() => onPick(twin)}>
            Usar este
          </Button>
        </div>
      ) : (
        <p className="texto-legenda text-texto-secundario">
          O produto é criado quando você salvar o item e fica disponível para os próximos.
        </p>
      )}

      <Button type="submit" aria-disabled={!draft.name} className="mt-auto">
        Vincular ao item
      </Button>
    </form>
  );
}
