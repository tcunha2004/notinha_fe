// Mirrors the notinha_api schema (snake_case on purpose).
export type PurchaseStatus = 'ok' | 'needs_review';
export type Unit = 'UN' | 'KG' | 'L';

export interface Store {
  cnpj: string;
  name: string | null;
  address: string | null;
  /** Logo URL found on the web; null when none was found. */
  logo?: string | null;
}

/** Standardized product, the same across stores ("CAFE PILAO 2KG" → Café, Pilão, 2000 g). */
export interface Product {
  id: string;
  name: string;
  brand: string | null;
  /** In package_unit; null for items sold by weight/volume. */
  package_size: number | null;
  package_unit: 'g' | 'ml' | 'un' | null;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  position: number;
  /** As printed on the receipt; null for items the user added by hand. */
  raw_description: string | null;
  /** Its name is the item's name. null when the product couldn't be identified. */
  product: Product | null;
  code: string | null;
  quantity: number;
  /** Usually UN, KG or L, but the receipt may print others (PCT, CX…). */
  unit: string;
  unit_price: number;
  discount: number;
  total_amount: number;
  /** Something wasn't read, or quantity × price doesn't give the line total. */
  flagged: boolean;
}

/** What the edit sheet sends; the API recomputes the line total. */
export interface ItemInput {
  /** The picked product; null leaves the item unidentified. */
  product_id: string | null;
  /** "Criar novo produto": the API creates it on save and links it (wins over product_id). */
  new_product?: Omit<Product, 'id'>;
  quantity: number;
  unit: string;
  unit_price: number;
  discount: number;
}

export type PaymentMethod = 'DÉBITO' | 'CRÉDITO' | 'PIX' | 'DINHEIRO';

export interface Purchase {
  id: string;
  /** null when the CNPJ couldn't be read. */
  store: Store | null;
  purchased_at: string;
  total_amount: number;
  payment_method: PaymentMethod | null;
  status: PurchaseStatus;
  items: PurchaseItem[];
}

export interface User {
  email: string;
  name: string;
  picture: string;
}
