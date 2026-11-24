// Data access boundary. Swap these bodies for real API calls; components only see Promises.
import { purchases } from '../mocks/purchases';
import type { Purchase } from '../types';

export async function listPurchases(): Promise<Purchase[]> {
  return [...purchases].sort((a, b) => b.purchased_at.localeCompare(a.purchased_at));
}

export async function getPurchase(id: string): Promise<Purchase | undefined> {
  return purchases.find((purchase) => purchase.id === id);
}
