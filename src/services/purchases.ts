import type { ItemInput, Purchase, PurchaseStatus } from '../types';
import { request } from './api';

/** The API answered with an error. `status` tells the screens what to show
 *  (401 = logged out, 409 on upload = already saved, see `purchaseId`;
 *  422 on upload = nothing saved, `reason` 'invalid' = not a grocery/pharmacy receipt, otherwise unreadable). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly purchaseId?: string,
    readonly reason?: string,
  ) {
    super(`API error ${status}`);
  }
}

async function json<T>(response: Response): Promise<T> {
  if (!response.ok) throw new ApiError(response.status);
  return response.json() as Promise<T>;
}

/** Newest first. */
export async function listPurchases(): Promise<Purchase[]> {
  return json(await request('/purchases'));
}

/** undefined when it doesn't exist or belongs to someone else. */
export async function getPurchase(id: string): Promise<Purchase | undefined> {
  const response = await request(`/purchases/${encodeURIComponent(id)}`);
  // 422 = not even a valid id
  if (response.status === 404 || response.status === 422) return undefined;
  return json(response);
}

/** Edits an item (or adds one when `itemId` is undefined); resolves to the re-checked purchase. */
export async function saveItem(
  purchaseId: string,
  itemId: string | undefined,
  item: ItemInput,
): Promise<Purchase> {
  const path = `/purchases/${purchaseId}/items${itemId ? `/${itemId}` : ''}`;
  const response = await request(path, {
    method: itemId ? 'PATCH' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return json(response);
}

/** Corrects the receipt total (e.g. cut off in the photo); resolves to the re-checked purchase. */
export async function saveTotal(purchaseId: string, totalAmount: number): Promise<Purchase> {
  const response = await request(`/purchases/${purchaseId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ total_amount: totalAmount }),
  });
  return json(response);
}

/** Removes an item (e.g. read twice); resolves to the re-checked purchase. */
export async function deleteItem(purchaseId: string, itemId: string): Promise<Purchase> {
  return json(await request(`/purchases/${purchaseId}/items/${itemId}`, { method: 'DELETE' }));
}

/** Deletes the purchase, its items and the receipt photo. */
export async function deletePurchase(purchaseId: string): Promise<void> {
  const response = await request(`/purchases/${purchaseId}`, { method: 'DELETE' });
  if (!response.ok) throw new ApiError(response.status);
}

/** Opens the receipt photo; the API redirects to a short-lived S3 link. */
export const photoUrl = (purchaseId: string) =>
  `${import.meta.env.VITE_API_URL}/purchases/${purchaseId}/photo`;

/** Sends the receipt photo; resolves once the agent has read and saved it. */
export async function uploadInvoice(file: File): Promise<{ id: string; status: PurchaseStatus }> {
  const body = new FormData();
  body.append('image', file);
  const response = await request('/invoice/upload_invoice', { method: 'POST', body });
  // 409 = same store, date and time already saved: the body points to that purchase.
  if (response.status === 409) {
    const { detail } = (await response.json()) as { detail: { purchase_id: string } };
    throw new ApiError(409, detail.purchase_id);
  }
  if (response.status === 422) {
    const body = (await response.json().catch(() => null)) as {
      detail?: { reason?: string };
    } | null;
    throw new ApiError(422, undefined, body?.detail?.reason);
  }
  return json(response);
}
