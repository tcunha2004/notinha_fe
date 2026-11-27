// Test fixtures shaped like the API's GET /purchases answer (newest first).
import type {
  PaymentMethod,
  Product,
  Purchase,
  PurchaseItem,
  PurchaseStatus,
  Store,
  Unit,
} from '../types';

/** A product as the API returns it, identified by name only. */
const product = (name: string): Product => ({
  id: `prod-${name}`,
  name,
  brand: null,
  package_size: null,
  package_unit: null,
});

const stores = {
  bomDia: {
    cnpj: '12.345.678/0001-90',
    name: 'Mercado Bom Dia',
    address: 'Av. das Palmeiras, 1200',
  },
  solNascente: {
    cnpj: '23.456.789/0001-01',
    name: 'Hortifruti Sol Nascente',
    address: 'Rua das Laranjeiras, 85',
  },
  valeVerde: {
    cnpj: '34.567.890/0001-12',
    name: 'Super Vale Verde',
    address: 'Av. Brasil, 4500',
  },
  emporio: {
    cnpj: '45.678.901/0001-23',
    name: 'Empório Central',
    address: 'Rua XV de Novembro, 310',
  },
  trigoBom: {
    cnpj: '56.789.012/0001-34',
    name: 'Padaria Trigo Bom',
    address: 'Rua dos Pinheiros, 742',
  },
} satisfies Record<string, Store>;

type ItemSeed = [
  raw: string,
  name: string,
  quantity: number,
  unit: Unit,
  unitPrice: number,
  total: number,
  extra?: Partial<PurchaseItem>,
];

function items(purchaseId: string, seeds: ItemSeed[]): PurchaseItem[] {
  return seeds.map(([raw, name, quantity, unit, unit_price, total_amount, extra], i) => ({
    id: `${purchaseId}-i${i + 1}`,
    purchase_id: purchaseId,
    position: i + 1,
    raw_description: raw,
    product: product(name),
    code: unit === 'KG' ? null : `78910000${String(i + 1).padStart(5, '0')}`,
    quantity,
    unit,
    unit_price,
    discount: 0,
    total_amount,
    flagged: false,
    previous_unit_price: null,
    ...extra,
  }));
}

const CATALOG: [raw: string, name: string][] = [
  ['ACUCAR REFINADO 1KG', 'Açúcar refinado 1kg'],
  ['OLEO SOJA 900ML', 'Óleo de soja 900ml'],
  ['MACARRAO ESPAGUETE 500G', 'Macarrão espaguete 500g'],
  ['MOLHO TOMATE 340G', 'Molho de tomate 340g'],
  ['SABAO PO 1KG', 'Sabão em pó 1kg'],
  ['PAPEL HIGIENICO 12UN', 'Papel higiênico 12un'],
  ['IOGURTE NATURAL 170G', 'Iogurte natural 170g'],
  ['QUEIJO MUSSARELA 200G', 'Queijo muçarela 200g'],
  ['PRESUNTO FATIADO 200G', 'Presunto fatiado 200g'],
  ['MANTEIGA 200G', 'Manteiga 200g'],
  ['REFRIGERANTE 2L', 'Refrigerante 2L'],
  ['SUCO UVA 1L', 'Suco de uva 1L'],
  ['BISCOITO CREAM CRACKER', 'Biscoito cream cracker'],
  ['FARINHA TRIGO 1KG', 'Farinha de trigo 1kg'],
  ['SAL REFINADO 1KG', 'Sal refinado 1kg'],
  ['AGUA SANITARIA 1L', 'Água sanitária 1L'],
  ['SHAMPOO 350ML', 'Shampoo 350ml'],
  ['CREME DENTAL 90G', 'Creme dental 90g'],
  ['ACHOCOLATADO 400G', 'Achocolatado 400g'],
  ['FRANGO FILE 1KG', 'Filé de frango 1kg'],
];

/** Plausible items for purchases without a detailed list. Sums to `total` to the cent. */
function generatedItems(purchaseId: string, count: number, total: number): PurchaseItem[] {
  const totalCents = Math.round(total * 100);
  const weights = Array.from({ length: count }, (_, i) => 1 + ((i * 7 + count) % 5));
  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  let remaining = totalCents;

  return weights.map((weight, i) => {
    const cents = i === count - 1 ? remaining : Math.floor((totalCents * weight) / weightSum);
    remaining -= cents;
    const quantity = cents % 2 === 0 && cents > 600 ? 2 : 1;
    const [raw, name] = CATALOG[(i * 3 + count) % CATALOG.length] ?? ['ITEM', 'Item'];
    return {
      id: `${purchaseId}-i${i + 1}`,
      purchase_id: purchaseId,
      position: i + 1,
      raw_description: raw,
      product: product(name),
      code: `78920000${String(i + 1).padStart(5, '0')}`,
      quantity,
      unit: 'UN',
      unit_price: cents / quantity / 100,
      discount: 0,
      total_amount: cents / 100,
      flagged: false,
      previous_unit_price: null,
    };
  });
}

function summary(
  id: string,
  store: Store,
  purchased_at: string,
  itemCount: number,
  total_amount: number,
  payment_method: PaymentMethod | null,
  status: PurchaseStatus = 'ok',
): Purchase {
  return {
    id,
    store,
    purchased_at,
    total_amount,
    payment_method,
    status,
    items: generatedItems(id, itemCount, total_amount),
  };
}

const variant = (
  id: string,
  name: string,
  brand: string | null,
  package_size: number,
  package_unit: Product['package_unit'],
  brand_logo: string | null = null,
): Product => ({ id, name, brand, brand_logo, package_size, package_unit });

const achocolatado = (brand: string | null, logo?: string) =>
  variant(`prod-achocolatado-${brand ?? 'sem-marca'}`, 'Achocolatado', brand, 400, 'g', logo);

/** Lines whose receipt printed a brand: same generic product, a product of its own per brand. */
const BRANDED: [purchaseId: string, raw: string, printed: string, product: Product][] = [
  [
    'p1',
    'CAFE TORRADO 500G',
    'CAFE TORRADO PILAO 500G',
    variant('prod-cafe-pilao', 'Café torrado', 'Pilão', 500, 'g'),
  ],
  [
    'p1',
    'LEITE INTEGRAL 1L',
    'LEITE INTEGRAL ITAMBE 1L',
    variant('prod-leite-itambe', 'Leite integral', 'Itambé', 1000, 'ml'),
  ],
  [
    'p3',
    'ACHOCOLATADO 400G',
    'ACHOC NESCAU 400G',
    achocolatado('Nescau', 'https://example.com/nescau.png'),
  ],
  [
    'p5',
    'ACHOCOLATADO 400G',
    'ACHOC NESCAU 400G',
    achocolatado('Nescau', 'https://example.com/nescau.png'),
  ],
  ['p6', 'ACHOCOLATADO 400G', 'ACHOC TODDY 400G', achocolatado('Toddy')],
  ['p9', 'ACHOCOLATADO 400G', 'ACHOC TODDY 400G', achocolatado('Toddy')],
  ['p8', 'ACHOCOLATADO 400G', 'ACHOCOLATADO 400G', achocolatado(null)],
  ['p10', 'ACHOCOLATADO 400G', 'ACHOCOLATADO 400G', achocolatado(null)],
];

function withBrands(list: Purchase[]): Purchase[] {
  for (const [purchaseId, raw, printed, product] of BRANDED) {
    for (const item of list.find((p) => p.id === purchaseId)?.items ?? []) {
      if (item.raw_description === raw) Object.assign(item, { raw_description: printed, product });
    }
  }
  return list;
}

/** What the API's SQL does: each item gets the unit price of the same product (same unit)
 *  in the purchase before it. `list` is newest first, like GET /purchases. */
function withPreviousPrices(list: Purchase[]): Purchase[] {
  const last = new Map<string, number>();
  for (const purchase of [...list].reverse()) {
    const here = new Map<string, number>(); // this purchase's lines don't compare to each other
    for (const item of purchase.items) {
      if (!item.product) continue;
      const key = `${item.product.id}|${item.unit}`;
      item.previous_unit_price = last.get(key) ?? null;
      if (!here.has(key)) here.set(key, item.unit_price);
    }
    for (const [key, price] of here) last.set(key, price);
  }
  return list;
}

// Dates are local time (no offset) so labels render the same in any timezone.
export const purchases: Purchase[] = withPreviousPrices(
  withBrands([
    {
      id: 'p1',
      store: stores.bomDia,
      purchased_at: '2026-11-24T18:42:00',
      total_amount: 129.46,
      payment_method: 'CRÉDITO',
      status: 'ok',
      items: items('p1', [
        ['ARROZ T1 5KG', 'Arroz tipo 1 5kg', 1, 'UN', 27.9, 27.9],
        ['FEIJAO CARIOCA 1KG', 'Feijão carioca 1kg', 2, 'UN', 8.49, 16.98],
        ['LEITE INTEGRAL 1L', 'Leite integral 1L', 6, 'UN', 4.79, 28.74],
        ['CAFE TORRADO 500G', 'Café torrado 500g', 1, 'UN', 19.9, 19.9],
        ['BANANA PRATA KG', 'Banana prata', 1.235, 'KG', 6.99, 8.63],
        ['OVOS BRANCOS 12UN', 'Ovos brancos 12un', 1, 'UN', 13.49, 13.49],
        ['DET LIQ 500ML', 'Detergente líquido 500ml', 3, 'UN', 2.59, 7.27, { discount: 0.5 }],
        ['PAO FRANCES KG', 'Pão francês', 0.412, 'KG', 15.9, 6.55],
      ]),
    },
    {
      id: 'p2',
      store: stores.solNascente,
      purchased_at: '2026-11-23T10:15:00',
      total_amount: 42.18,
      payment_method: 'PIX',
      status: 'needs_review',
      items: items('p2', [
        ['TOMATE ITALIANO KG', 'Tomate italiano', 0.842, 'KG', 8.99, 7.57],
        ['CEBOLA KG', 'Cebola', 0.615, 'KG', 5.49, 3.38],
        ['ALFACE CRESPA UN', 'Alface crespa', 2, 'UN', 3.49, 6.98, { flagged: true }],
        ['MACA GALA KG', 'Maçã gala', 1.12, 'KG', 9.9, 11.09],
        ['MAMAO FORMOSA KG', 'Mamão formosa', 1.38, 'KG', 7.9, 10.9],
      ]),
    },
    summary('p3', stores.valeVerde, '2026-11-19T17:20:00', 23, 356.72, 'DÉBITO'),
    summary('p4', stores.emporio, '2026-11-16T12:05:00', 4, 61.3, 'PIX'),
    summary('p5', stores.valeVerde, '2026-11-12T19:48:00', 31, 402.15, 'CRÉDITO'),
    summary('p6', stores.bomDia, '2026-11-08T09:30:00', 12, 158.4, 'DÉBITO'),
    summary('p7', stores.trigoBom, '2026-11-03T07:55:00', 3, 98.69, 'DINHEIRO'),
    summary('p8', stores.valeVerde, '2026-10-28T18:10:00', 27, 389.2, 'CRÉDITO'),
    summary('p9', stores.bomDia, '2026-10-21T11:40:00', 15, 201.47, 'PIX'),
    summary('p10', stores.emporio, '2026-10-14T16:25:00', 6, 94.1, 'DÉBITO'),
  ]),
);

/** The catalog as GET /products returns it (sorted by name). */
export const products: Product[] = [
  { id: 'prod-Café', name: 'Café torrado', brand: 'Pilão', package_size: 500, package_unit: 'g' },
  product('Pão de forma'),
  product('Pão francês'),
  product('Sacola'),
];
