import { Outlet, ScrollRestoration, type RouteObject } from 'react-router';
import { EditItemSheet } from '../pages/EditItemSheet';
import { ErrorPage } from '../pages/ErrorPage';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Processing } from '../pages/Processing';
import { PurchaseDetail } from '../pages/PurchaseDetail';
import { Purchases } from '../pages/Purchases';
import { Review } from '../pages/Review';
import { Scan } from '../pages/Scan';
import { AppShell } from './AppShell';
import { loginLoader, logoutAction, purchaseLoader, purchasesLoader, requireUser } from './loaders';

const editItemRoute: RouteObject = { path: 'items/:itemId', element: <EditItemSheet /> };

export const routes: RouteObject[] = [
  {
    element: (
      <>
        <Outlet />
        <ScrollRestoration />
      </>
    ),
    errorElement: <ErrorPage />,
    HydrateFallback: () => null,
    children: [
      { path: 'login', loader: loginLoader, element: <Login /> },
      { path: 'logout', action: logoutAction },
      {
        id: 'auth',
        loader: requireUser,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, loader: purchasesLoader, element: <Home /> },
              { path: 'purchases', loader: purchasesLoader, element: <Purchases /> },
              {
                path: 'purchases/:id',
                id: 'purchase',
                loader: purchaseLoader,
                children: [
                  {
                    element: <PurchaseDetail />,
                    children: [{ index: true, element: null }, editItemRoute],
                  },
                  { path: 'review', element: <Review />, children: [editItemRoute] },
                ],
              },
            ],
          },
          { path: 'scan', element: <Scan /> },
          { path: 'scan/processing', element: <Processing /> },
        ],
      },
    ],
  },
];
