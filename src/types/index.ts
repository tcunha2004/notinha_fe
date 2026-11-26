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

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  position: number;
  /** As printed on the receipt; null for items the user added by hand. */
  raw_description: string | null;
  /** The user's friendly name ("Pão francês"), set when they edit the item. */
  description: string | null;
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
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount: number;
}

export interface Purchase {
  id: string;
  /** null when the CNPJ couldn't be read. */
  store: Store | null;
  purchased_at: string;
  total_amount: number;
  payment_method: string | null;
  status: PurchaseStatus;
  items: PurchaseItem[];
}

export interface User {
  email: string;
  name: string;
  picture: string;
}
