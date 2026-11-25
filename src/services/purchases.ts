// Data access boundary. Swap these bodies for real API calls; components only see Promises.
import { purchases } from '../mocks/purchases';
import type { Purchase, PurchaseStatus } from '../types';
import { request } from './api';

export async function listPurchases(): Promise<Purchase[]> {
  return [...purchases].sort((a, b) => b.purchased_at.localeCompare(a.purchased_at));
}

export async function getPurchase(id: string): Promise<Purchase | undefined> {
  return purchases.find((purchase) => purchase.id === id);
}

/** The API answered with an error. `status` tells the screens what to show (422 = unreadable). */
export class UploadError extends Error {
  constructor(readonly status: number) {
    super(`POST /invoice/upload_invoice failed: ${status}`);
  }
}

/** Sends the receipt photo; resolves once the agent has read and saved it. */
export async function uploadInvoice(file: File): Promise<{ id: string; status: PurchaseStatus }> {
  const body = new FormData();
  body.append('image', file);
  const response = await request('/invoice/upload_invoice', { method: 'POST', body });
  if (!response.ok) throw new UploadError(response.status);
  return response.json();
}
