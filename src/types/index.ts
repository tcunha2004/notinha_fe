// Mirrors the notinha_api schema (snake_case on purpose).
export type PurchaseStatus = 'ok' | 'needs_review';
export type Unit = 'UN' | 'KG' | 'L';

export interface Store {
  id: string;
  cnpj: string;
  name: string;
  address: string;
  city: string;
  state: string;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  position: number;
  raw_description: string;
  code: string | null;
  quantity: number;
  unit: Unit;
  unit_price: number;
  discount: number;
  total_amount: number;
  /** UI-only for now: the agent marks the item that likely breaks the sum. */
  flagged?: boolean;
  /** UI-only for now: human-friendly name ("Pão francês"); not in the API schema yet. */
  description?: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  store: Store;
  purchased_at: string;
  total_amount: number;
  payment_method: string;
  photo_url: string | null;
  status: PurchaseStatus;
  items: PurchaseItem[];
}
