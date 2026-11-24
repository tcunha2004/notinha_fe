import { useRouteLoaderData, type LoaderFunctionArgs } from 'react-router';
import { getPurchase, listPurchases } from '../services/purchases';

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
