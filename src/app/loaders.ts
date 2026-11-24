import { redirect, useRouteLoaderData, type LoaderFunctionArgs } from 'react-router';
import { getMe, logout } from '../services/auth';
import { getPurchase, listPurchases } from '../services/purchases';
import type { User } from '../types';

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
