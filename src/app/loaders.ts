import {
  redirect,
  replace,
  useRouteLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router';
import { getMe, logout } from '../services/auth';
import {
  ApiError,
  deleteItem,
  deletePurchase,
  getPurchase,
  listPurchases,
  saveItem,
  saveTotal,
} from '../services/purchases';
import type { ItemInput, User } from '../types';

/** Guard for every private route: no session means the login screen. */
export async function requireUser(): Promise<User> {
  const user = await getMe();
  if (!user) throw redirect('/login');
  return user;
}

export async function loginLoader() {
  return (await getMe()) ? redirect('/') : null;
}

export async function logoutAction() {
  await logout();
  return redirect('/login');
}

export const purchasesLoader = () => listPurchases();

export async function purchaseLoader({ params }: LoaderFunctionArgs) {
  const purchase = await getPurchase(params.id ?? '');
  if (!purchase) throw new Response('Compra não encontrada', { status: 404 });
  return purchase;
}

/** The purchase loaded by the `purchases/:id` route (detail, review and the edit sheet). */
export function usePurchase() {
  const purchase = useRouteLoaderData<typeof purchaseLoader>('purchase');
  if (!purchase) throw new Error('usePurchase must be used under the "purchase" route');
  return purchase;
}

/** Runs a sheet's save, then closes the sheet. On failure the sheet stays open with `{ error }`.
 *  The purchase loader re-runs afterwards, so totals and the review status refresh on their own. */
async function saveAndClose(request: Request, save: () => Promise<unknown>, to?: string) {
  try {
    await save();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return redirect('/login');
    return { error: true };
  }
  // Drop the sheet's segment (`items/:itemId`, `total`…). `replace`: Back must not reopen it.
  return replace(to ?? new URL(request.url).pathname.replace(/\/(items\/[^/]+|total)$/, ''));
}

/** Edit sheet: `items/:itemId`, or `items/new` to add one. DELETE removes the item. */
export async function itemAction({ params, request }: ActionFunctionArgs) {
  const { id = '', itemId = '' } = params;
  if (request.method === 'DELETE') return saveAndClose(request, () => deleteItem(id, itemId));
  const item = (await request.json()) as ItemInput;
  return saveAndClose(request, () => saveItem(id, itemId === 'new' ? undefined : itemId, item));
}

/** Total sheet: `total`. */
export async function totalAction({ params, request }: ActionFunctionArgs) {
  const { total_amount } = (await request.json()) as { total_amount: number };
  return saveAndClose(request, () => saveTotal(params.id ?? '', total_amount));
}

/** Delete sheet: `delete`. Leaves to where the user came from (the list, or home after a scan). */
export async function deletePurchaseAction({ params, request }: ActionFunctionArgs) {
  const fromReview = new URL(request.url).pathname.includes('/review/');
  const to = fromReview ? '/' : '/purchases';
  return saveAndClose(request, () => deletePurchase(params.id ?? ''), to);
}
